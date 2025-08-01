import React from 'react';
import { Brain, MessageSquare, Moon, Sun, Download, RefreshCw, X } from 'lucide-react';

interface ChatHeaderProps {
  darkMode: boolean;
  showSidebar: boolean;
  onToggleSidebar: () => void;
  onToggleDarkMode: () => void;
  onDownload: () => void;
  onClearChat: () => void;
  onBackToLanding: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  darkMode,
  showSidebar,
  onToggleSidebar,
  onToggleDarkMode,
  onDownload,
  onClearChat,
  onBackToLanding
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
      <div className="px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all md:hidden"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
            <Brain className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            <div>
              <h3 className="text-gray-900 dark:text-white font-semibold">SecondBrain Coach</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Dr.Gardner System Guide • Farerworks
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
              title="다크모드 전환"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={onDownload}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
              title="대화 다운로드"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={onClearChat}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
              title="현재 대화 초기화"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={onBackToLanding}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};