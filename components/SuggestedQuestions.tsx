import React from 'react';

interface SuggestedQuestionsProps {
  onQuestionClick: (question: string) => void;
}

const suggestions = [
  "PARA 시스템이 뭔가요?",
  "CODE 방법론 설명해주세요",
  "원자적 노트 작성법이 궁금해요",
  "주간 리뷰는 어떻게 하나요?",
  "프로젝트와 영역의 차이점은?",
  "데일리 노트 템플릿 보여주세요"
];

export const SuggestedQuestions: React.FC<SuggestedQuestionsProps> = ({ onQuestionClick }) => {
  return (
    <div className="p-4">
      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
        추천 질문
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {suggestions.map((question, index) => (
          <button
            key={index}
            onClick={() => onQuestionClick(question)}
            className="text-left p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-sm text-gray-700 dark:text-gray-300"
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
};