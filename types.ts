export type ChatMessageType = 'user' | 'bot';

export interface Message {
  id: number;
  type: ChatMessageType;
  content: string;
  timestamp: string; // e.g., 'HH:MM' in ko-KR locale
  suggestions?: string[];
  cached?: boolean;
}

export interface Session {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string; // ISO string
  lastMessageAt: string; // ISO string
}
