export enum MessageSender {
  User = 'user',
  AI = 'ai',
}

export interface Source {
  uri: string;
  title: string;
}

export interface ImagePart {
  mimeType: string;
  data: string; // base64 encoded string
}

export interface Message {
  id: number;
  sender: MessageSender;
  text: string;
  sources?: Source[];
  imageUrl?: string; // For UI display
  image?: ImagePart; // For API request
  suggestions?: string[]; // For AI-suggested follow-ups
}

export type ChatMode = 'lite' | 'pro';

export interface Session {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  mode: ChatMode;
}

export interface GoogleUser {
  id: string;
  name: string;
  email: string;
  picture: string;
}