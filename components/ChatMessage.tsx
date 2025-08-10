import React, { useState } from 'react';
import { TypingEffect } from './TypingEffect';

interface ChatMessageProps {
  message: {
    role: 'user' | 'assistant';
    content: string;
    timestamp?: Date;
  };
  isLatest?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isLatest = false }) => {
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  
  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] rounded-lg p-4 ${
        message.role === 'user' 
          ? 'bg-blue-600 text-white' 
          : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
      }`}>
        {message.role === 'user' ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <TypingEffect 
            content={message.content} 
            isTyping={isLatest && !isTypingComplete}
            onComplete={() => setIsTypingComplete(true)}
            speed={15}
          />
        )}
        {message.timestamp && (
          <time className="text-xs opacity-70 mt-2 block">
            {message.timestamp.toLocaleTimeString('ko-KR')}
          </time>
        )}
      </div>
    </div>
  );
};