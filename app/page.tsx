'use client'

import React, { useState, useRef, useEffect } from 'react';
import { Brain, Send, Sparkles, ArrowRight, Moon, Sun, Copy, Check, BookOpen, MessageSquare, Zap } from 'lucide-react';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { SessionSidebar } from '@/components/SessionSidebar';
import { QuickButtons } from '@/components/QuickButtons';
import { ChatHeader } from '@/components/ChatHeader';
import { Message, Session } from '@/types';

export default function Home() {
  const [currentView, setCurrentView] = useState<'landing' | 'chat'>('landing');
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>('');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [showSidebar, setShowSidebar] = useState<boolean>(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 새 세션 생성
  const createNewSession = () => {
    const newSessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newSession: Session = {
      id: newSessionId,
      title: '새 대화',
      messages: [],
      createdAt: new Date().toISOString(),
      lastMessageAt: new Date().toISOString()
    };
    
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSessionId);
    setMessages([]);
    
    // 로컬 스토리지에 저장
    const updatedSessions = [newSession, ...sessions];
    localStorage.setItem('sessions', JSON.stringify(updatedSessions));
    localStorage.setItem('currentSessionId', newSessionId);
    
    return newSessionId;
  };

  // 세션 전환
  const switchSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSessionId(sessionId);
      setMessages(session.messages);
      localStorage.setItem('currentSessionId', sessionId);
    }
  };

  // 세션 삭제
  const deleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    
    // 현재 세션이 삭제되면 새 세션 생성
    if (currentSessionId === sessionId) {
      createNewSession();
    }
    
    // 로컬 스토리지 업데이트
    const updatedSessions = sessions.filter(s => s.id !== sessionId);
    localStorage.setItem('sessions', JSON.stringify(updatedSessions));
  };

  // 다크모드 토글
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // 로컬 스토리지에서 세션 불러오기
  useEffect(() => {
    const savedSessions = localStorage.getItem('sessions');
    const savedCurrentSessionId = localStorage.getItem('currentSessionId');
    const savedDarkMode = localStorage.getItem('darkMode');
    
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
    
    if (savedSessions) {
      const parsedSessions = JSON.parse(savedSessions);
      setSessions(parsedSessions);
      
      if (savedCurrentSessionId && parsedSessions.find((s: Session) => s.id === savedCurrentSessionId)) {
        setCurrentSessionId(savedCurrentSessionId);
        const currentSession = parsedSessions.find((s: Session) => s.id === savedCurrentSessionId);
        if (currentSession) {
          setMessages(currentSession.messages);
        }
      } else if (parsedSessions.length > 0) {
        setCurrentSessionId(parsedSessions[0].id);
        setMessages(parsedSessions[0].messages);
      } else {
        createNewSession();
      }
    } else {
      createNewSession();
    }
  }, []);

  // 메시지 변경시 현재 세션 업데이트
  useEffect(() => {
    if (currentSessionId && messages.length > 0) {
      setSessions(prev => prev.map(session => 
        session.id === currentSessionId 
          ? { 
              ...session, 
              messages, 
              lastMessageAt: new Date().toISOString(),
              title: session.title === '새 대화' && messages.length > 0 
                ? messages[0].content.slice(0, 30) + (messages[0].content.length > 30 ? '...' : '')
                : session.title
            }
          : session
      ));
      
      // 로컬 스토리지 업데이트
      const updatedSessions = sessions.map(session => 
        session.id === currentSessionId 
          ? { ...session, messages, lastMessageAt: new Date().toISOString() }
          : session
      );
      localStorage.setItem('sessions', JSON.stringify(updatedSessions));
    }
  }, [messages, currentSessionId]);

  // 다크모드 변경시 저장
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (currentView === 'chat' && messages.length === 0) {
      setMessages([{
        id: Date.now(),
        type: 'bot',
        content: '안녕하세요! 👋 SecondBrain 코치입니다.\n\nPARA 분류, CODE 방법론, 노션 활용법 등 무엇이든 물어보세요!',
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        suggestions: [
          '영역과 프로젝트 차이가 뭐야?',
          '노트 쪼개기는 어떻게 해?',
          'CODE 방법론 설명해줘'
        ]
      }]);
    }
  }, [currentView, messages.length]);

  const handleQuickQuestion = async (question: string) => {
    if (isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      type: 'user',
      content: question,
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setInputValue('');

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: question,
          conversationId: currentSessionId
        })
      });

      const data = await response.json();
      
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'bot',
        content: data.response,
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        suggestions: data.suggestions,
        cached: data.cached
      }]);

    } catch (error) {
      console.error('Error:', error);
      
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'bot',
        content: '죄송합니다. 연결에 문제가 있습니다. 잠시 후 다시 시도해주세요.',
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    if (inputValue.trim() && !isLoading) {
      handleQuickQuestion(inputValue);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleQuickQuestion(suggestion);
  };

  const copyToClipboard = async (text: string, messageId: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(messageId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadChat = () => {
    const chatContent = messages.map(m => 
      `[${m.timestamp}] ${m.type === 'user' ? '사용자' : 'AI'}: ${m.content}`
    ).join('\n\n');
    
    const blob = new Blob([chatContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `secondbrain-chat-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
  };

  const clearChat = () => {
    if (confirm('현재 대화를 모두 삭제하시겠습니까?')) {
      setMessages([]);
      const updatedSessions = sessions.map(session => 
        session.id === currentSessionId 
          ? { ...session, messages: [], lastMessageAt: new Date().toISOString() }
          : session
      );
      setSessions(updatedSessions);
      localStorage.setItem('sessions', JSON.stringify(updatedSessions));
    }
  };

  // 랜딩 페이지
  if (currentView === 'landing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-white dark:from-gray-900 dark:via-purple-950 dark:to-gray-900 transition-colors duration-300">
        <nav className="px-6 py-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">SecondBrain Coach</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setCurrentView('chat')}
                className="px-6 py-3 bg-purple-600 text-white rounded-xl font-medium transition-all duration-200 hover:bg-purple-700 hover:shadow-lg hover:scale-105 active:scale-95"
              >
                무료로 시작하기
              </button>
            </div>
          </div>
        </nav>

        <section className="px-6 py-20 max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full border border-purple-200 dark:border-purple-800 mb-6">
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 mr-2" />
            <span className="text-purple-700 dark:text-purple-300 text-sm font-medium">닥터가드너 SecondBrain 전문 AI 코치</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
            Second Brain 마스터하기
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              이제 쉬워집니다
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
            PARA 분류가 헷갈리시나요? CODE 방법론이 어려우신가요?
            <br />
            실시간 AI 코치가 당신의 Second Brain 구축을 도와드립니다.
          </p>

          <button
            onClick={() => setCurrentView('chat')}
            className="inline-flex items-center px-8 py-4 bg-purple-600 text-white rounded-xl font-medium text-lg transition-all duration-200 hover:bg-purple-700 hover:shadow-lg hover:scale-105 active:scale-95"
          >
            지금 시작하기
            <ArrowRight className="ml-2 w-5 h-5" />
          </button>
        </section>

        <section className="px-6 py-20 max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 hover:scale-105">
            <MessageSquare className="w-10 h-10 text-purple-600 dark:text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">즉문즉답</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">PARA 분류, CODE 프로세스 등 궁금한 점을 바로 물어보세요</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 hover:scale-105">
            <BookOpen className="w-10 h-10 text-purple-600 dark:text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">실전 예시</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">당신의 상황에 맞는 구체적인 예시와 템플릿을 제공합니다</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 hover:scale-105">
            <Zap className="w-10 h-10 text-purple-600 dark:text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">실시간 피드백</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">분류가 맞는지, 더 나은 방법은 없는지 즉시 확인하세요</p>
          </div>
        </section>
      </div>
    );
  }

  // 채팅 인터페이스
  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-300">
      {/* 헤더 */}
      <ChatHeader
        darkMode={darkMode}
        showSidebar={showSidebar}
        onToggleSidebar={() => setShowSidebar(!showSidebar)}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onDownload={downloadChat}
        onClearChat={clearChat}
        onBackToLanding={() => setCurrentView('landing')}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* 사이드바 */}
        <SessionSidebar
          sessions={sessions}
          currentSessionId={currentSessionId}
          showSidebar={showSidebar}
          onNewSession={createNewSession}
          onSwitchSession={switchSession}
          onDeleteSession={deleteSession}
        />

        {/* 메시지 영역 */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto p-4">
              <div className="space-y-6">
                {messages.map((message) => (
                  <div key={message.id} className="animate-fade-in">
                    <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`group max-w-[85%] md:max-w-[70%] ${
                        message.type === 'user' 
                          ? 'bg-purple-600 text-white' 
                          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700'
                      } rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200`}>
                        <div className="px-4 py-3">
                          <div className="flex items-start justify-between mb-1">
                            <span className={`text-xs ${
                              message.type === 'user' ? 'text-purple-200' : 'text-gray-500 dark:text-gray-400'
                            }`}>
                              {message.type === 'user' ? '나' : 'AI 코치'}
                              {message.cached && (
                                <span className="ml-2 text-xs bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full">빠른 응답</span>
                              )}
                            </span>
                            <span className={`text-xs ${
                              message.type === 'user' ? 'text-purple-200' : 'text-gray-500 dark:text-gray-400'
                            }`}>
                              {message.timestamp}
                            </span>
                          </div>
                          {message.type === 'bot' ? (
                            <MarkdownRenderer content={message.content} />
                          ) : (
                            <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                          )}
                        </div>
                        
                        {message.type === 'bot' && (
                          <div className="px-4 pb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => copyToClipboard(message.content, message.id)}
                              className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 flex items-center"
                            >
                              {copiedId === message.id ? (
                                <>
                                  <Check className="w-3 h-3 mr-1" />
                                  복사됨
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3 mr-1" />
                                  복사
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {message.suggestions && (
                      <div className="flex flex-wrap gap-2 mt-3 px-4">
                        {message.suggestions.map((suggestion, i) => (
                          <button
                            key={i}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-xl text-sm font-medium transition-all hover:scale-105 active:scale-95"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex items-center space-x-3 text-gray-500 dark:text-gray-400 animate-fade-in">
                    <div className="flex space-x-1 items-center bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 shadow-sm">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                      <span className="ml-3 text-sm">AI가 답변을 생성하고 있습니다...</span>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>

          {/* 입력창 영역 */}
          <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="max-w-4xl mx-auto p-4">
              <div className="mb-4">
                <QuickButtons onQuestionClick={handleQuickQuestion} disabled={isLoading} />
              </div>
              
              <div className="flex items-center space-x-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="질문을 입력하세요..."
                  className="w-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !inputValue.trim()}
                  className="bg-purple-600 text-white rounded-xl px-6 py-3 font-medium transition-all duration-200 hover:bg-purple-700 hover:shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}