import React from 'react';
import { Plus, X } from 'lucide-react';
import { Session } from '@/types';

interface SessionSidebarProps {
  sessions: Session[];
  currentSessionId: string;
  showSidebar: boolean;
  onNewSession: () => void;
  onSwitchSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
}

export const SessionSidebar: React.FC<SessionSidebarProps> = ({
  sessions,
  currentSessionId,
  showSidebar,
  onNewSession,
  onSwitchSession,
  onDeleteSession
}) => {
  return (
    <div className={`${showSidebar ? 'w-64' : 'w-0'} bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 overflow-hidden flex flex-col`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={onNewSession}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>새 대화</span>
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {sessions.map(session => (
          <div
            key={session.id}
            className={`group relative p-3 rounded-lg cursor-pointer transition-all ${
              currentSessionId === session.id 
                ? 'bg-purple-100 dark:bg-purple-900/30 border border-purple-300 dark:border-purple-700' 
                : 'hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            onClick={() => onSwitchSession(session.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {session.title}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {new Date(session.lastMessageAt).toLocaleDateString('ko-KR')}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSession(session.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
              >
                <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};