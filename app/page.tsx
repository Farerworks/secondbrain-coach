'use client'

import React, { useState, useRef, useEffect } from 'react';
import { Brain, Send, Sparkles, X, BookOpen, MessageSquare, Zap, ArrowRight, Loader2 } from 'lucide-react';

export default function Home() {
  const [currentView, setCurrentView] = useState('landing');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

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
        suggestions: [
          '영역과 프로젝트 차이가 뭐야?',
          '노트 쪼개기는 어떻게 해?',
          'CODE 방법론 설명해줘'
        ]
      }]);
    }
  }, [currentView]);

  const handleQuickQuestion = async (question) => {
    if (isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: question
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
          message: question
        })
      });

      const data = await response.json();
      
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'bot',
        content: data.response
      }]);

    } catch (error) {
      console.error('Error:', error);
      
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'bot',
        content: '죄송합니다. 연결에 문제가 있습니다. LM Studio가 실행 중인지 확인해주세요.'
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

  const handleSuggestionClick = (suggestion) => {
    handleQuickQuestion(suggestion);
  };

  if (currentView === 'landing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <nav className="px-6 py-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="w-8 h-8 text-purple-400" />
              <span className="text-xl font-bold text-white">SecondBrain Coach</span>
            </div>
            <button
              onClick={() => setCurrentView('chat')}
              className="px-6 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition hover:scale-105 transform"
            >
              무료로 시작하기
            </button>
          </div>
        </nav>

        <section className="px-6 py-20 max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 bg-purple-600/20 rounded-full border border-purple-600/50 mb-6">
            <Sparkles className="w-4 h-4 text-purple-400 mr-2" />
            <span className="text-purple-300 text-sm">닥터가드너 SecondBrain 전문 AI 코치</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
            Second Brain 마스터하기
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              이제 쉬워집니다
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            PARA 분류가 헷갈리시나요? CODE 방법론이 어려우신가요?
            <br />
            실시간 AI 코치가 당신의 Second Brain 구축을 도와드립니다.
          </p>

          <button
            onClick={() => setCurrentView('chat')}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:shadow-lg hover:shadow-purple-500/50 transition transform hover:scale-105 flex items-center mx-auto"
          >
            지금 시작하기
            <ArrowRight className="ml-2 w-5 h-5" />
          </button>
        </section>

        <section className="px-6 py-20 max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="bg-slate-800/30 backdrop-blur border border-purple-500/20 rounded-2xl p-8 hover:bg-slate-800/50 transition">
            <MessageSquare className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">즉문즉답</h3>
            <p className="text-gray-400">PARA 분류, CODE 프로세스 등 궁금한 점을 바로 물어보세요</p>
          </div>
          
          <div className="bg-slate-800/30 backdrop-blur border border-purple-500/20 rounded-2xl p-8 hover:bg-slate-800/50 transition">
            <BookOpen className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">실전 예시</h3>
            <p className="text-gray-400">당신의 상황에 맞는 구체적인 예시와 템플릿을 제공합니다</p>
          </div>
          
          <div className="bg-slate-800/30 backdrop-blur border border-purple-500/20 rounded-2xl p-8 hover:bg-slate-800/50 transition">
            <Zap className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">실시간 피드백</h3>
            <p className="text-gray-400">분류가 맞는지, 더 나은 방법은 없는지 즉시 확인하세요</p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Brain className="w-8 h-8 text-white" />
            <div>
              <h3 className="text-white font-semibold">SecondBrain Coach</h3>
              <p className="text-purple-100 text-sm">PARA & CODE 전문가</p>
            </div>
          </div>
          <button
            onClick={() => setCurrentView('landing')}
            className="text-white/80 hover:text-white transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 max-w-4xl mx-auto w-full">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="animate-fade-in">
              <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] ${
                  message.type === 'user' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-slate-800 text-gray-200'
                } rounded-2xl px-4 py-3 shadow-lg`}>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
              
              {message.suggestions && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {message.suggestions.map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-full text-sm transition hover:scale-105 transform"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex items-center space-x-2 text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
              <span className="text-sm">AI가 답변을 생성하고 있습니다...</span>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-slate-800 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg p-4 mb-4">
            <h3 className="text-white font-semibold mb-3 text-center">🎯 빠른 질문</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleQuickQuestion('영역과 프로젝트 차이가 뭐야?')}
                className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition flex flex-col items-center hover:scale-105 transform"
                disabled={isLoading}
              >
                <span className="text-2xl mb-1">📊</span>
                <span className="font-semibold">PARA 기초</span>
                <span className="text-xs opacity-70">영역 vs 프로젝트</span>
              </button>
              
              <button
                onClick={() => handleQuickQuestion('CODE 방법론 설명해줘')}
                className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition flex flex-col items-center hover:scale-105 transform"
                disabled={isLoading}
              >
                <span className="text-2xl mb-1">📝</span>
                <span className="font-semibold">CODE 방법론</span>
                <span className="text-xs opacity-70">4단계 프로세스</span>
              </button>
              
              <button
                onClick={() => handleQuickQuestion('노트 쪼개기는 어떻게 해?')}
                className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition flex flex-col items-center hover:scale-105 transform"
                disabled={isLoading}
              >
                <span className="text-2xl mb-1">✂️</span>
                <span className="font-semibold">노트 쪼개기</span>
                <span className="text-xs opacity-70">원자성 원칙</span>
              </button>
              
              <button
                onClick={() => handleQuickQuestion('습관을 프로젝트로 만들어도 돼?')}
                className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition flex flex-col items-center hover:scale-105 transform"
                disabled={isLoading}
              >
                <span className="text-2xl mb-1">💪</span>
                <span className="font-semibold">습관 관리</span>
                <span className="text-xs opacity-70">30일 프로젝트</span>
              </button>
            </div>
          </div>
          
          <div className="mt-3">
            <div className="flex items-center space-x-2">
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
                placeholder="직접 질문을 입력하세요..."
                className="flex-1 bg-slate-800 text-white placeholder-gray-400 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !inputValue.trim()}
                className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 transform"
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}