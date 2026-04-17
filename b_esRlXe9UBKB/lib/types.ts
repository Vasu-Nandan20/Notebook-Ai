export type UserRole = 'admin' | 'user' | 'guest'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isStreaming?: boolean
  outputType?: OutputType
  persona?: PersonaType
  reactions?: string[]
}

export interface ShareSettings {
  visibility: 'public' | 'unlisted' | 'password'
  password?: string
  expiration: '1hour' | '1day' | '7days' | 'never'
  allowComments: boolean
  allowExport: boolean
  viewCount: number
  shareUrl?: string
  qrCode?: string
}

export interface Chat {
  id: string
  title: string
  messages: ChatMessage[]
  sources: Source[]
  createdAt: Date
  updatedAt: Date
  isShared?: boolean
  shareId?: string
  shareSettings?: ShareSettings
}

export interface Source {
  id: string
  type: 'pdf' | 'youtube' | 'website' | 'text' | 'docx' | 'md'
  name: string
  url?: string
  content?: string
  uploadedAt: Date
  size?: number
  pages?: number
  status?: 'uploading' | 'processing' | 'ready' | 'error'
  progress?: number
}

export type OutputType = 'summary' | 'mindmap' | 'table' | 'flashcards' | 'quiz'

export type PersonaType = 'teacher' | 'friend' | 'expert' | 'child' | 'eli5'

export type ThemeBackground = 
  | 'default'
  | 'soft-blue'
  | 'mint-green'
  | 'lavender'
  | 'peach'
  | 'dark-mode'
  | 'gradient-sunset'
  | 'gradient-ocean'
  | 'gradient-forest'
  | 'gradient-galaxy'
  | 'gradient-aurora'
  | 'pattern-dots'
  | 'pattern-grid'
  | 'pattern-waves'

export type VoiceVisualization = 
  | 'gentle-waves'
  | 'breathing-circle'
  | 'particle-cloud'
  | 'aurora'
  | 'minimal'

export interface Flashcard {
  id: string
  front: string
  back: string
  difficulty?: 'easy' | 'medium' | 'hard'
  mastered?: boolean
}

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctIndex: number
  explanation?: string
}

export interface MindMapNode {
  id: string
  label: string
  children?: MindMapNode[]
}

export interface TableData {
  headers: string[]
  rows: string[][]
}

export interface ConceptGap {
  concept: string
  confidence: number
  relatedTopics: string[]
}

export interface CrossLink {
  sourceId: string
  targetId: string
  relationship: string
}

export interface StorageInfo {
  used: number
  total: number
  percentage: number
}
