'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { Chat, ChatMessage, Source, ShareSettings, ThemeBackground, StorageInfo } from './types'

interface ChatContextType {
  chats: Chat[]
  currentChat: Chat | null
  isGenerating: boolean
  isPaused: boolean
  sidebarCollapsed: boolean
  themeBackground: ThemeBackground
  storageInfo: StorageInfo
  setChats: (chats: Chat[]) => void
  setCurrentChat: (chat: Chat | null) => void
  createNewChat: () => void
  deleteChat: (id: string) => void
  deleteMultipleChats: (ids: string[]) => void
  clearAllChats: () => void
  deleteOlderThan: (days: number) => void
  renameChat: (id: string, title: string) => void
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void
  updateMessage: (id: string, content: string) => void
  deleteMessage: (id: string) => void
  addReaction: (messageId: string, reaction: string) => void
  addSource: (source: Omit<Source, 'id' | 'uploadedAt'>) => void
  removeSource: (id: string) => void
  removeMultipleSources: (ids: string[]) => void
  clearAllSources: () => void
  reorderSources: (startIndex: number, endIndex: number) => void
  setIsGenerating: (generating: boolean) => void
  setIsPaused: (paused: boolean) => void
  togglePause: () => void
  shareChat: (chatId: string, settings: ShareSettings) => string
  revokeShare: (chatId: string) => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setThemeBackground: (theme: ThemeBackground) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

const STORAGE_KEY = 'notebookai_chats'
const SIDEBAR_KEY = 'notebookai_sidebar'
const THEME_BG_KEY = 'notebookai_theme_bg'

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chats, setChatsState] = useState<Chat[]>([])
  const [currentChat, setCurrentChat] = useState<Chat | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsedState] = useState(false)
  const [themeBackground, setThemeBackgroundState] = useState<ThemeBackground>('default')
  const [isInitialized, setIsInitialized] = useState(false)

  // Calculate storage info
  const storageInfo: StorageInfo = {
    used: chats.reduce((acc, chat) => {
      const msgSize = chat.messages.reduce((m, msg) => m + msg.content.length, 0)
      const srcSize = chat.sources.reduce((s, src) => s + (src.size || 1000), 0)
      return acc + msgSize + srcSize
    }, 0) / 1024, // KB
    total: 100 * 1024, // 100MB in KB
    percentage: 0
  }
  storageInfo.percentage = (storageInfo.used / storageInfo.total) * 100

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    const sidebarState = localStorage.getItem(SIDEBAR_KEY)
    const themeBg = localStorage.getItem(THEME_BG_KEY)
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        const loadedChats = parsed.map((c: Chat) => ({
          ...c,
          createdAt: new Date(c.createdAt),
          updatedAt: new Date(c.updatedAt),
          messages: c.messages.map((m: ChatMessage) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          })),
          sources: c.sources.map((s: Source) => ({
            ...s,
            uploadedAt: new Date(s.uploadedAt)
          }))
        }))
        setChatsState(loadedChats)
        if (loadedChats.length > 0) {
          setCurrentChat(loadedChats[0])
        }
      } catch {
        initializeDefaultChats()
      }
    } else {
      initializeDefaultChats()
    }
    
    if (sidebarState) {
      setSidebarCollapsedState(sidebarState === 'true')
    }
    
    if (themeBg) {
      setThemeBackgroundState(themeBg as ThemeBackground)
    }
    
    setIsInitialized(true)
  }, [])

  const initializeDefaultChats = () => {
    const defaultChats: Chat[] = [
      {
        id: '1',
        title: 'Introduction to Machine Learning',
        messages: [
          {
            id: '1',
            role: 'user',
            content: 'Explain the basics of machine learning',
            timestamp: new Date(Date.now() - 3600000),
          },
          {
            id: '2',
            role: 'assistant',
            content: 'Machine learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed.\n\n**Key Concepts:**\n\n1. **Supervised Learning**: The algorithm learns from labeled training data\n2. **Unsupervised Learning**: The algorithm finds patterns in unlabeled data\n3. **Reinforcement Learning**: The algorithm learns through trial and error',
            timestamp: new Date(Date.now() - 3500000),
            outputType: 'summary',
          },
        ],
        sources: [
          {
            id: '1',
            type: 'pdf',
            name: 'ML_Basics.pdf',
            uploadedAt: new Date(Date.now() - 86400000),
            size: 2500000,
            pages: 45,
            status: 'ready',
          },
        ],
        createdAt: new Date(Date.now() - 86400000),
        updatedAt: new Date(Date.now() - 3500000),
      },
      {
        id: '2',
        title: 'React Best Practices',
        messages: [],
        sources: [],
        createdAt: new Date(Date.now() - 172800000),
        updatedAt: new Date(Date.now() - 172800000),
      },
    ]
    setChatsState(defaultChats)
    setCurrentChat(defaultChats[0])
  }

  // Save to localStorage when chats change
  useEffect(() => {
    if (isInitialized && chats.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chats))
    }
  }, [chats, isInitialized])

  const setChats = useCallback((newChats: Chat[]) => {
    setChatsState(newChats)
  }, [])

  const createNewChat = useCallback(() => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      sources: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setChatsState((prev) => [newChat, ...prev])
    setCurrentChat(newChat)
  }, [])

  const deleteChat = useCallback((id: string) => {
    setChatsState((prev) => {
      const filtered = prev.filter((c) => c.id !== id)
      if (currentChat?.id === id) {
        setCurrentChat(filtered[0] || null)
      }
      return filtered
    })
  }, [currentChat])

  const deleteMultipleChats = useCallback((ids: string[]) => {
    setChatsState((prev) => {
      const filtered = prev.filter((c) => !ids.includes(c.id))
      if (currentChat && ids.includes(currentChat.id)) {
        setCurrentChat(filtered[0] || null)
      }
      return filtered
    })
  }, [currentChat])

  const clearAllChats = useCallback(() => {
    setChatsState([])
    setCurrentChat(null)
  }, [])

  const deleteOlderThan = useCallback((days: number) => {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    setChatsState((prev) => {
      const filtered = prev.filter((c) => c.updatedAt > cutoff)
      if (currentChat && currentChat.updatedAt <= cutoff) {
        setCurrentChat(filtered[0] || null)
      }
      return filtered
    })
  }, [currentChat])

  const renameChat = useCallback((id: string, title: string) => {
    setChatsState((prev) => prev.map((c) => 
      c.id === id ? { ...c, title, updatedAt: new Date() } : c
    ))
    if (currentChat?.id === id) {
      setCurrentChat((prev) => prev ? { ...prev, title } : null)
    }
  }, [currentChat])

  const addMessage = useCallback(
    (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
      if (!currentChat) return
      const newMessage: ChatMessage = {
        ...message,
        id: Date.now().toString(),
        timestamp: new Date(),
        reactions: [],
      }
      const updatedChat = {
        ...currentChat,
        messages: [...currentChat.messages, newMessage],
        updatedAt: new Date(),
        title:
          currentChat.messages.length === 0 && message.role === 'user'
            ? message.content.slice(0, 50)
            : currentChat.title,
      }
      setCurrentChat(updatedChat)
      setChatsState((prev) => prev.map((c) => (c.id === currentChat.id ? updatedChat : c)))
    },
    [currentChat]
  )

  const updateMessage = useCallback(
    (id: string, content: string) => {
      if (!currentChat) return
      const updatedChat = {
        ...currentChat,
        messages: currentChat.messages.map((m) => (m.id === id ? { ...m, content } : m)),
        updatedAt: new Date(),
      }
      setCurrentChat(updatedChat)
      setChatsState((prev) => prev.map((c) => (c.id === currentChat.id ? updatedChat : c)))
    },
    [currentChat]
  )

  const deleteMessage = useCallback(
    (id: string) => {
      if (!currentChat) return
      const updatedChat = {
        ...currentChat,
        messages: currentChat.messages.filter((m) => m.id !== id),
        updatedAt: new Date(),
      }
      setCurrentChat(updatedChat)
      setChatsState((prev) => prev.map((c) => (c.id === currentChat.id ? updatedChat : c)))
    },
    [currentChat]
  )

  const addReaction = useCallback(
    (messageId: string, reaction: string) => {
      if (!currentChat) return
      const updatedChat = {
        ...currentChat,
        messages: currentChat.messages.map((m) => {
          if (m.id === messageId) {
            const reactions = m.reactions || []
            if (reactions.includes(reaction)) {
              return { ...m, reactions: reactions.filter(r => r !== reaction) }
            }
            return { ...m, reactions: [...reactions, reaction] }
          }
          return m
        }),
      }
      setCurrentChat(updatedChat)
      setChatsState((prev) => prev.map((c) => (c.id === currentChat.id ? updatedChat : c)))
    },
    [currentChat]
  )

  const addSource = useCallback(
    (source: Omit<Source, 'id' | 'uploadedAt'>) => {
      if (!currentChat) return
      const newSource: Source = {
        ...source,
        id: Date.now().toString(),
        uploadedAt: new Date(),
        status: 'processing',
        progress: 0,
      }
      const updatedChat = {
        ...currentChat,
        sources: [...currentChat.sources, newSource],
        updatedAt: new Date(),
      }
      setCurrentChat(updatedChat)
      setChatsState((prev) => prev.map((c) => (c.id === currentChat.id ? updatedChat : c)))
      
      // Simulate processing
      setTimeout(() => {
        setCurrentChat((prev) => {
          if (!prev) return null
          return {
            ...prev,
            sources: prev.sources.map((s) =>
              s.id === newSource.id ? { ...s, status: 'ready', progress: 100 } : s
            ),
          }
        })
        setChatsState((prev) =>
          prev.map((c) =>
            c.id === currentChat.id
              ? {
                  ...c,
                  sources: c.sources.map((s) =>
                    s.id === newSource.id ? { ...s, status: 'ready', progress: 100 } : s
                  ),
                }
              : c
          )
        )
      }, 2000)
    },
    [currentChat]
  )

  const removeSource = useCallback(
    (id: string) => {
      if (!currentChat) return
      const updatedChat = {
        ...currentChat,
        sources: currentChat.sources.filter((s) => s.id !== id),
        updatedAt: new Date(),
      }
      setCurrentChat(updatedChat)
      setChatsState((prev) => prev.map((c) => (c.id === currentChat.id ? updatedChat : c)))
    },
    [currentChat]
  )

  const removeMultipleSources = useCallback(
    (ids: string[]) => {
      if (!currentChat) return
      const updatedChat = {
        ...currentChat,
        sources: currentChat.sources.filter((s) => !ids.includes(s.id)),
        updatedAt: new Date(),
      }
      setCurrentChat(updatedChat)
      setChatsState((prev) => prev.map((c) => (c.id === currentChat.id ? updatedChat : c)))
    },
    [currentChat]
  )

  const clearAllSources = useCallback(() => {
    if (!currentChat) return
    const updatedChat = {
      ...currentChat,
      sources: [],
      updatedAt: new Date(),
    }
    setCurrentChat(updatedChat)
    setChatsState((prev) => prev.map((c) => (c.id === currentChat.id ? updatedChat : c)))
  }, [currentChat])

  const reorderSources = useCallback(
    (startIndex: number, endIndex: number) => {
      if (!currentChat) return
      const result = Array.from(currentChat.sources)
      const [removed] = result.splice(startIndex, 1)
      result.splice(endIndex, 0, removed)
      const updatedChat = {
        ...currentChat,
        sources: result,
        updatedAt: new Date(),
      }
      setCurrentChat(updatedChat)
      setChatsState((prev) => prev.map((c) => (c.id === currentChat.id ? updatedChat : c)))
    },
    [currentChat]
  )

  const togglePause = useCallback(() => {
    setIsPaused((prev) => !prev)
  }, [])

  const shareChat = useCallback(
    (chatId: string, settings: ShareSettings) => {
      const shareId = `share_${chatId}_${Date.now()}`
      const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/share/${shareId}`
      
      const updatedSettings: ShareSettings = {
        ...settings,
        shareUrl,
        viewCount: 0,
      }
      
      setChatsState((prev) =>
        prev.map((c) => (c.id === chatId ? { ...c, isShared: true, shareId, shareSettings: updatedSettings } : c))
      )
      if (currentChat?.id === chatId) {
        setCurrentChat((prev) => (prev ? { ...prev, isShared: true, shareId, shareSettings: updatedSettings } : null))
      }
      return shareUrl
    },
    [currentChat]
  )

  const revokeShare = useCallback(
    (chatId: string) => {
      setChatsState((prev) =>
        prev.map((c) => (c.id === chatId ? { ...c, isShared: false, shareId: undefined, shareSettings: undefined } : c))
      )
      if (currentChat?.id === chatId) {
        setCurrentChat((prev) => (prev ? { ...prev, isShared: false, shareId: undefined, shareSettings: undefined } : null))
      }
    },
    [currentChat]
  )

  const setSidebarCollapsed = useCallback((collapsed: boolean) => {
    setSidebarCollapsedState(collapsed)
    localStorage.setItem(SIDEBAR_KEY, String(collapsed))
  }, [])

  const setThemeBackground = useCallback((theme: ThemeBackground) => {
    setThemeBackgroundState(theme)
    localStorage.setItem(THEME_BG_KEY, theme)
  }, [])

  return (
    <ChatContext.Provider
      value={{
        chats,
        currentChat,
        isGenerating,
        isPaused,
        sidebarCollapsed,
        themeBackground,
        storageInfo,
        setChats,
        setCurrentChat,
        createNewChat,
        deleteChat,
        deleteMultipleChats,
        clearAllChats,
        deleteOlderThan,
        renameChat,
        addMessage,
        updateMessage,
        deleteMessage,
        addReaction,
        addSource,
        removeSource,
        removeMultipleSources,
        clearAllSources,
        reorderSources,
        setIsGenerating,
        setIsPaused,
        togglePause,
        shareChat,
        revokeShare,
        setSidebarCollapsed,
        setThemeBackground,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}
