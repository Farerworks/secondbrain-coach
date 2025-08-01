import React, { useState, useEffect } from 'react';
import { MarkdownRenderer } from './MarkdownRenderer';

interface TypingEffectProps {
  content: string;
  speed?: number;
  onComplete?: () => void;
  isTyping?: boolean;
}

export const TypingEffect: React.FC<TypingEffectProps> = ({ 
  content, 
  speed = 20,
  onComplete,
  isTyping = true
}) => {
  const [displayedContent, setDisplayedContent] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!isTyping) {
      setDisplayedContent(content);
      setIsComplete(true);
      return;
    }

    if (currentIndex < content.length) {
      const timer = setTimeout(() => {
        // 한 번에 여러 글자 표시 (더 자연스러운 효과)
        const charsToAdd = Math.min(3, content.length - currentIndex);
        setDisplayedContent(content.slice(0, currentIndex + charsToAdd));
        setCurrentIndex(currentIndex + charsToAdd);
      }, speed);

      return () => clearTimeout(timer);
    } else if (!isComplete) {
      setIsComplete(true);
      onComplete?.();
    }
  }, [currentIndex, content, speed, onComplete, isComplete, isTyping]);

  // 빠르게 전체 보기
  const skipTyping = () => {
    setDisplayedContent(content);
    setCurrentIndex(content.length);
    setIsComplete(true);
    onComplete?.();
  };

  return (
    <div className="relative">
      <MarkdownRenderer content={displayedContent} />
      {!isComplete && isTyping && (
        <button
          onClick={skipTyping}
          className="absolute -bottom-6 right-0 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
        >
          Skip ▶
        </button>
      )}
      {!isComplete && isTyping && (
        <span className="inline-block w-0.5 h-4 bg-gray-400 dark:bg-gray-500 animate-pulse ml-0.5" />
      )}
    </div>
  );
};