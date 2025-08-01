import React from 'react';

interface QuickButtonsProps {
  onQuestionClick: (question: string) => void;
  disabled?: boolean;
}

const quickQuestions = [
  { icon: '📊', label: 'PARA 기초', question: '영역과 프로젝트 차이가 뭐야?' },
  { icon: '📝', label: 'CODE 방법론', question: 'CODE 방법론 설명해줘' },
  { icon: '✂️', label: '노트 쪼개기', question: '노트 쪼개기는 어떻게 해?' },
  { icon: '💪', label: '습관 관리', question: '습관을 프로젝트로 만들어도 돼?' }
];

export const QuickButtons: React.FC<QuickButtonsProps> = ({ onQuestionClick, disabled = false }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {quickQuestions.map((item, index) => (
        <button
          key={index}
          onClick={() => onQuestionClick(item.question)}
          className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-md hover:scale-105 active:scale-95"
          disabled={disabled}
        >
          <span className="text-lg mr-1">{item.icon}</span>
          {item.label}
        </button>
      ))}
    </div>
  );
};