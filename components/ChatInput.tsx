
import React, { useState, useRef } from 'react';
import SendIcon from './icons/SendIcon';
import StopIcon from './icons/StopIcon';
import AttachmentIcon from './icons/AttachmentIcon';
import CloseIcon from './icons/CloseIcon';

interface ChatInputProps {
  onSendMessage: (text: string, image?: File) => void;
  isLoading: boolean;
  isStopping: boolean;
  onStopGenerating: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading, isStopping, onStopGenerating }) => {
  const [inputText, setInputText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((inputText.trim() || imageFile) && !isLoading && !isStopping) {
      onSendMessage(inputText, imageFile ?? undefined);
      setInputText('');
      removeImage();
    }
  };

  return (
    <div>
      {imagePreview && (
        <div className="relative inline-block mb-2 p-2 bg-slate-800 rounded-lg">
          <img src={imagePreview} alt="Selected preview" className="max-h-24 rounded-md" />
          <button
            onClick={removeImage}
            className="absolute -top-2 -right-2 bg-slate-600 hover:bg-red-500 text-white rounded-full p-0.5 transition-colors"
            aria-label="Remove image"
          >
            <CloseIcon />
          </button>
        </div>
      )}
      <form 
          onSubmit={handleSubmit} 
          className="relative group bg-slate-900/70 backdrop-blur-lg border border-slate-700 rounded-lg focus-within:ring-2 focus-within:ring-cyan-400 focus-within:border-cyan-400 transition-all duration-300"
      >
        <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading || isStopping}
            className="absolute inset-y-0 left-0 flex items-center justify-center w-12 h-full text-slate-400 hover:text-cyan-400 disabled:text-slate-600 disabled:cursor-not-allowed transition-colors duration-200"
            aria-label="Attach file"
        >
            <AttachmentIcon />
        </button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/png, image/jpeg, image/webp"
        />

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={isLoading ? "Obsidian is generating a response..." : "Enter query or upload an image..."}
          disabled={isLoading}
          className="w-full text-base bg-transparent py-3 pl-12 pr-12 text-slate-200 placeholder-slate-500 focus:outline-none disabled:opacity-50"
        />
        
        {isLoading ? (
           <button
              type="button"
              onClick={onStopGenerating}
              className="absolute inset-y-0 right-0 flex items-center justify-center w-12 h-full text-slate-400 hover:text-red-400 transition-colors duration-200"
              aria-label="Stop generating response"
            >
              <StopIcon />
            </button>
        ) : (
          <button
            type="submit"
            disabled={(!inputText.trim() && !imageFile) || isStopping}
            className="absolute inset-y-0 right-0 flex items-center justify-center w-12 h-full text-slate-400 hover:text-cyan-400 disabled:text-slate-600 disabled:cursor-not-allowed transition-colors duration-200"
            aria-label="Send message"
          >
            <SendIcon />
          </button>
        )}
      </form>
    </div>
  );
};

export default ChatInput;