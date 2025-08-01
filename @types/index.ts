// 메시지 타입 정의
export interface Message {
  id: number;
  type: 'user' | 'bot';
  content: string;
  timestamp: string;
  suggestions?: string[];
  cached?: boolean;
}

// 세션 타입 정의
export interface Session {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  lastMessageAt: string;
}

// 지식 베이스 아이템 타입 정의
export interface KnowledgeItem {
  id: string;
  category: 'PARA' | 'CODE' | 'NOTES' | 'REVIEW' | 'GENERAL';
  title: string;
  content: string;
  keywords: string[];
  examples?: string[];
  relatedTopics?: string[];
}

// API 응답 타입 정의
export interface ChatResponse {
  response: string;
  suggestions?: string[];
  cached?: boolean;
  error?: string;
}

// 검색 결과 타입 정의
export interface SearchResult {
  item: KnowledgeItem;
  score: number;
}