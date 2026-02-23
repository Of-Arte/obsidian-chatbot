

import React, { useEffect, useRef } from 'react';
import { Message, MessageSender, ChatMode } from '../types';
import ChatMessage from './ChatMessage';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  isStopping: boolean;
  mode: ChatMode;
  onSuggestionClick: (suggestion: string) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading, isStopping, mode, onSuggestionClick }) => {
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {messages.map((msg, index) => {
           const isLastMessage = index === messages.length - 1;
           const isLastAIMessage = !isLoading && isLastMessage && msg.sender === MessageSender.AI;
           return (
            <ChatMessage 
              key={msg.id} 
              message={msg} 
              isLoading={isLoading && isLastMessage}
              isStopping={isStopping && isLastMessage}
              isLastMessage={isLastMessage}
              isInitialMessage={index === 0 && msg.sender === MessageSender.AI}
              isLastAIMessage={isLastAIMessage}
              mode={mode}
              onSuggestionClick={onSuggestionClick}
            />
           )
        })}
        <div ref={chatEndRef} />
      </div>
    </main>
  );
};

export default ChatWindow;