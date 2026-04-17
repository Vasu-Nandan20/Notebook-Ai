export type OutputType = 'summary' | 'mindmap' | 'table' | 'flashcards' | 'quiz';
export type PersonaType = 'teacher' | 'friend' | 'expert' | 'child' | 'eli5' | 'pirate';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  outputType?: OutputType;
  persona?: PersonaType;
  createdAt?: Date;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  shareId?: string;
  isShared?: boolean;
  updatedAt: Date;
}