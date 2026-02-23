import React, { useState, useEffect, useRef } from 'react';
import { Message, MessageSender, ChatMode } from '../types';
import CopyIcon from './icons/CopyIcon';
import CheckIcon from './icons/CheckIcon';
import ObsidianLogo from './icons/ObsidianLogo';

interface ChatMessageProps {
  message: Message;
  isLoading: boolean;
  isStopping: boolean;
  isLastMessage: boolean;
  isInitialMessage?: boolean;
  isLastAIMessage?: boolean;
  mode?: ChatMode;
  onSuggestionClick?: (suggestion: string) => void;
}

const DISCLAIMER_TEXT = "This analysis is for informational and educational purposes only";

// A simple function to parse the specific Markdown format from the prompt
const renderMarkdown = (text: string) => {
  const elements: React.ReactNode[] = [];
  const lines = text.split('\n');
  let inList = false;
  let currentListItems: React.ReactNode[] = [];

  const flushList = (key: string | number) => {
    if (currentListItems.length > 0) {
      elements.push(<ul key={`ul-${key}`} className="list-disc pl-6 my-2 space-y-1">{currentListItems}</ul>);
      currentListItems = [];
    }
    inList = false;
  };

  lines.forEach((line, i) => {
    // Bold text handling
    const renderLineWithBold = (lineContent: string) => {
      const parts = lineContent.split(/(\*\*.*?\*\*)/g);
      return parts.map((part, j) =>
        part.startsWith('**') && part.endsWith('**') ? (
          <strong key={j}>{part.substring(2, part.length - 2)}</strong>
        ) : (
          part
        )
      );
    };

    if (line.startsWith('* ') || line.startsWith('- ')) {
      if (!inList) {
        flushList(i); // Flush any previous content before starting a new list
        inList = true;
      }
      currentListItems.push(<li key={i}>{renderLineWithBold(line.substring(2))}</li>);
    } else {
      flushList(i); // Line is not a list item, so end any current list
      if (line.startsWith('**Obsidian Market Assessment:**')) {
        elements.push(<h2 key={i} className="text-xl font-bold mt-4 mb-2 text-cyan-400">{line.replace(/\*\*/g, '')}</h2>);
      } else if (line.startsWith('**High-Probability Trade Recommendations')) {
        elements.push(<h2 key={i} className="text-xl font-bold mt-4 mb-2 text-cyan-400">{line.replace(/\*\*/g, '')}</h2>);
      } else if (line.startsWith('**Portfolio Risk Summary:**')) {
        elements.push(<h2 key={i} className="text-xl font-bold mt-4 mb-2 text-cyan-400">{line.replace(/\*\*/g, '')}</h2>);
      } else if (line.startsWith('**Disclaimer:**')) {
        elements.push(<h3 key={i} className="text-lg font-semibold mt-3 mb-1 text-amber-400">{line.replace(/\*\*/g, '')}</h3>);
      } else if (line.startsWith(DISCLAIMER_TEXT)) {
        elements.push(<p key={i} className="text-xs text-slate-400 italic mt-4">{line}</p>);
      } else if (line.trim() !== '') {
        elements.push(<p key={i} className="my-1">{renderLineWithBold(line)}</p>);
      }
    }
  });

  flushList('end'); // Flush any remaining list items at the end
  return elements;
};

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isLoading, isStopping, isLastMessage, isInitialMessage = false, isLastAIMessage = false, mode = 'lite', onSuggestionClick = () => { } }) => {
  const isUser = message.sender === MessageSender.User;
  const isPro = mode === 'pro';
  const [isCopied, setIsCopied] = useState(false);

  const [displayedText, setDisplayedText] = useState(isInitialMessage ? '' : message.text);
  const [isAnimationComplete, setIsAnimationComplete] = useState(!isInitialMessage && !isLastMessage);

  // Ref to track if the initial animation has already run to prevent re-animation.
  const initialAnimationRan = useRef(false);
  const targetText = message.text;

  useEffect(() => {
    // If this message has been stopped, freeze the animation.
    if (isStopping) {
      setIsAnimationComplete(true);
      return;
    }

    // Historical messages (not initial, not the last streaming one) should be displayed fully and immediately.
    if (!isLastMessage && !isInitialMessage) {
      setDisplayedText(targetText);
      setIsAnimationComplete(true);
      return;
    }

    // This is the crucial part to prevent the initial message from re-animating.
    // If it's the initial message BUT its animation has already run, display it fully and stop.
    if (isInitialMessage && initialAnimationRan.current) {
      setDisplayedText(targetText);
      setIsAnimationComplete(true);
      return;
    }

    // Don't animate if there's no new text.
    if (targetText.length <= displayedText.length) {
      if (!isLoading) {
        setIsAnimationComplete(true);
      }
      return;
    }

    setIsAnimationComplete(false);

    let animationFrameId: number;
    let currentLength = displayedText.length;

    const animate = () => {
      // Pro mode gets a much faster animation speed
      const charsPerFrame = isPro ? 20 : 4;
      currentLength = Math.min(currentLength + charsPerFrame, targetText.length);
      setDisplayedText(targetText.substring(0, currentLength));

      if (currentLength < targetText.length) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        if (isInitialMessage) {
          initialAnimationRan.current = true;
        }
        // Only set animation to complete if the whole stream is finished.
        if (!isLoading) {
          setIsAnimationComplete(true);
        }
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };

  }, [targetText, isLastMessage, isLoading, isInitialMessage, displayedText, isStopping, isPro]);

  const handleCopy = () => {
    if (!message.text) return;
    navigator.clipboard.writeText(message.text).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-xl">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-3 rounded-2xl rounded-br-none shadow-lg">
            {message.imageUrl && (
              <img src={message.imageUrl} alt="User upload" className="mb-2 rounded-lg max-h-60 w-full object-cover" />
            )}
            {message.text && <p className="text-sm">{message.text}</p>}
          </div>
        </div>
      </div>
    );
  }

  // AI Message
  return (
    <div className="group flex justify-start">
      <div className="flex items-start gap-3 max-w-2xl">
        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0 overflow-hidden ring-2 ring-cyan-500/50">
          <ObsidianLogo className="w-6 h-6" />
        </div>
        <div className="relative bg-slate-800/50 backdrop-blur-md border border-slate-700/50 p-4 rounded-2xl rounded-bl-none shadow-lg prose prose-sm max-w-none text-slate-300">
          <div className="prose-strong:text-white prose-headings:text-cyan-400">
            {renderMarkdown(displayedText)}
          </div>

          {isAnimationComplete && message.sources && message.sources.length > 0 && (
            <div className="mt-4 border-t border-slate-700 pt-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-2">Sources</h4>
              <ul className="space-y-1 list-none p-0">
                {message.sources.map((source, index) => (
                  <li key={index} className="truncate">
                    <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:text-cyan-300 transition-colors duration-200 flex items-center gap-2 no-underline hover:underline">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                      <span className="truncate" title={source.title}>{source.title}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggestion Chips */}
          {isLastAIMessage && message.suggestions && message.suggestions.length > 0 && (
            <div className="mt-4 border-t border-slate-700 pt-3 flex flex-wrap gap-2">
              {message.suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => onSuggestionClick(suggestion)}
                  className="text-sm bg-slate-700/50 hover:bg-cyan-500/20 text-cyan-300 px-3 py-1.5 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-cyan-400"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Copy Button: Only show on non-empty, completed AI messages */}
          {isAnimationComplete && message.text && (
            <div className="absolute top-2 right-2">
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-full bg-slate-900/50 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                aria-label={isCopied ? "Copied" : "Copy to clipboard"}
              >
                {isCopied ? <CheckIcon /> : <CopyIcon />}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;