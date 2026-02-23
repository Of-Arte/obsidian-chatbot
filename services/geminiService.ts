import { GoogleGenAI, Part, GenerateContentResponse, Content, Chat, Type } from "@google/genai";
import { Source, Message, MessageSender, ChatMode, ImagePart } from '../types';
import { OBSIDIAN_LITE_SYSTEM_PROMPT, OBSIDIAN_PRO_SYSTEM_PROMPT, SUGGESTIONS_SYSTEM_PROMPT } from '../constants';

// The API key is injected by the build process. This check ensures the app doesn't run if the key is missing.
if (!process.env.API_KEY) {
    throw new Error("Google API Key is missing. The application was not built correctly with an API_KEY.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface ObsidianResponse {
  text: string;
  sources: Source[];
}

/**
 * Maps the application's message history to the format required by the Gemini API.
 * It filters out placeholder messages and formats user and AI messages correctly.
 * @param messages - The array of messages from the current session.
 * @returns An array of Content objects for the Gemini API.
 */
const mapMessagesToContents = (messages: Message[]): Content[] => {
  const history = messages
    // The first message is the AI's welcome, which is implicitly part of the system prompt's persona.
    // We skip it to avoid including it as a conversational turn.
    .slice(1) 
    // Filter out empty AI placeholders which are added before the response is received.
    .filter(msg => msg.sender === MessageSender.User || (msg.sender === MessageSender.AI && (msg.text || msg.image))) 
    .map(msg => {
      const parts: Part[] = [];
      if (msg.text) {
        parts.push({ text: msg.text });
      }
      if (msg.image) {
        parts.push({
          inlineData: {
            mimeType: msg.image.mimeType,
            data: msg.image.data,
          },
        });
      }
      return {
        role: msg.sender === MessageSender.User ? 'user' : 'model',
        parts,
      };
    });
  // Filter out any messages that might have ended up with no parts (should be rare)
  return history.filter(h => h.parts.length > 0);
};


/**
 * Sends the conversation history and a new message to the Gemini API using a stateless chat session.
 * This approach avoids issues with certain proxies by using `chat.sendMessage`.
 *
 * @param history - The current list of messages in the chat *before* the new user message.
 * @param userMessageText - The new text message from the user.
 * @param mode - The current chat mode ('lite' or 'pro').
 * @param userMessageImage - An optional image part for the new message.
 * @returns A promise that resolves to an ObsidianResponse object.
 */
export async function getObsidianResponse(
  history: Message[],
  userMessageText: string,
  mode: ChatMode,
  userMessageImage?: ImagePart
): Promise<ObsidianResponse> {

  // Construct the conversation history for initializing the chat.
  const chatHistory = mapMessagesToContents(history);
  
  const systemInstruction = mode === 'pro' ? OBSIDIAN_PRO_SYSTEM_PROMPT : OBSIDIAN_LITE_SYSTEM_PROMPT;
  const tools = mode === 'pro' ? [{ googleSearch: {} }] : [];

  // Create a new chat session on each call, initialized with the history.
  // This stateless approach is more robust in proxy environments.
  const chat: Chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      history: chatHistory,
      config: {
          systemInstruction,
          tools,
      }
  });

  // Construct the new message to send.
  const userMessageParts: (string | Part)[] = [];
  if (userMessageText) {
      userMessageParts.push(userMessageText);
  }
  if (userMessageImage) {
      userMessageParts.push({ inlineData: userMessageImage });
  }

  if (userMessageParts.length === 0) {
      // Don't call the API if there is no new message content
      return { text: '', sources: [] };
  }

  try {
    // Send only the new message parts.
    const response: GenerateContentResponse = await chat.sendMessage({ message: userMessageParts });
    
    const fullText = response.text;
    const sourcesMap = new Map<string, Source>();

    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    if (groundingMetadata?.groundingChunks) {
      for (const groundingChunk of groundingMetadata.groundingChunks) {
          if (groundingChunk.web?.uri) {
              if (!sourcesMap.has(groundingChunk.web.uri)) {
                  sourcesMap.set(groundingChunk.web.uri, {
                      uri: groundingChunk.web.uri,
                      title: groundingChunk.web.title || groundingChunk.web.uri,
                  });
              }
          }
      }
    }
    
    return {
        text: fullText,
        sources: Array.from(sourcesMap.values()),
    };

  } catch (error) {
    console.error("Gemini API call failed:", error);
    // Propagate a user-friendly error message.
    if (error instanceof Error) {
        throw new Error(`Failed to get response from Obsidian: ${error.message}`);
    }
    throw new Error("An unknown error occurred while communicating with the AI.");
  }
}

/**
 * Generates dynamic follow-up suggestions based on the conversation history.
 * @param messages - The full conversation history.
 * @returns A promise that resolves to an array of suggestion strings.
 */
export async function getDynamicSuggestions(messages: Message[]): Promise<string[]> {
  if (messages.length === 0) {
    return [];
  }
  
  const history = mapMessagesToContents(messages);

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      suggestions: {
        type: Type.ARRAY,
        description: "A list of 3 to 4 concise, relevant follow-up questions or prompts for the user.",
        items: {
          type: Type.STRING,
        },
      },
    },
    required: ['suggestions'],
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: history,
      config: {
        systemInstruction: SUGGESTIONS_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7, // A bit of creativity for suggestions
      },
    });

    const jsonText = response.text.trim();
    if (!jsonText) {
      return [];
    }
    
    const parsed = JSON.parse(jsonText);
    
    if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
      return parsed.suggestions.filter((s: any) => typeof s === 'string');
    }

    return [];

  } catch (error) {
    console.error("Failed to generate dynamic suggestions:", error);
    // On failure, return an empty array. The UI will just not show suggestions.
    return [];
  }
}