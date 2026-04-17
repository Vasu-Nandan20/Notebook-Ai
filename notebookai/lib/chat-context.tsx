// lib/chat-context.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './auth-context';
import { Message, Chat } from './types';

type ChatContextType = {
  chats: Chat[];
  currentChat: Chat | null;
  isGenerating: boolean;
  isPaused: boolean;
  createNewChat: () => void;
  setCurrentChat: (chat: Chat | null) => void;
  addMessage: (message: Omit<Message, 'id' | 'createdAt'>) => void;
  updateMessage: (id: string, newContent: string) => void;
  deleteChat: (chatId: string) => void;
  shareChat: (chatId: string) => string;
  togglePause: () => void;
  setIsGenerating: (value: boolean) => void;
  loadChats: () => Promise<void>;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Load chats when user is authenticated
  const loadChats = async () => {
    if (!user) return;
    
    try {
      // In a real app, fetch from Supabase
      // For now, we simulate with local state (you can replace with Supabase query)
      const savedChats = localStorage.getItem(`chats_${user.id}`);
      if (savedChats) {
        const parsedChats: Chat[] = JSON.parse(savedChats);
        setChats(parsedChats);
        
        // Load last active chat if exists
        const lastChatId = localStorage.getItem(`lastChat_${user.id}`);
        if (lastChatId) {
          const lastChat = parsedChats.find(c => c.id === lastChatId);
          if (lastChat) setCurrentChat(lastChat);
        }
      }
    } catch (error) {
      console.error('Failed to load chats:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      loadChats();
    } else {
      setChats([]);
      setCurrentChat(null);
    }
  }, [isAuthenticated, user]);

  // Save chats to localStorage whenever they change (replace with Supabase in production)
  useEffect(() => {
    if (user && chats.length > 0) {
      localStorage.setItem(`chats_${user.id}`, JSON.stringify(chats));
    }
  }, [chats, user]);

  const createNewChat = () => {
    const newChat: Chat = {
      id: `chat_${Date.now()}`,
      title: 'New Chat',
      messages: [],
      updatedAt: new Date(),
    };
    
    setChats(prev => [newChat, ...prev]);
    setCurrentChat(newChat);
    
    if (user) {
      localStorage.setItem(`lastChat_${user.id}`, newChat.id);
    }
  };

  const addMessage = (messageData: Omit<Message, 'id' | 'createdAt'>) => {
    if (!currentChat) return;

    const newMessage: Message = {
      ...messageData,
      id: `msg_${Date.now()}`,
      createdAt: new Date(),
    };

    const updatedChat = {
      ...currentChat,
      messages: [...currentChat.messages, newMessage],
      updatedAt: new Date(),
      title: currentChat.messages.length === 0 && messageData.role === 'user' 
        ? messageData.content.substring(0, 50) + '...' 
        : currentChat.title,
    };

    setCurrentChat(updatedChat);
    
    setChats(prev => 
      prev.map(chat => chat.id === updatedChat.id ? updatedChat : chat)
    );
  };

  const updateMessage = (id: string, newContent: string) => {
    if (!currentChat) return;

    const updatedMessages = currentChat.messages.map(msg =>
      msg.id === id ? { ...msg, content: newContent } : msg
    );

    const updatedChat = {
      ...currentChat,
      messages: updatedMessages,
      updatedAt: new Date(),
    };

    setCurrentChat(updatedChat);
    setChats(prev => 
      prev.map(chat => chat.id === updatedChat.id ? updatedChat : chat)
    );
  };

  const deleteChat = (chatId: string) => {
    setChats(prev => prev.filter(chat => chat.id !== chatId));
    
    if (currentChat?.id === chatId) {
      setCurrentChat(null);
    }
  };

  const shareChat = (chatId: string): string => {
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return '';

    // In production, generate shareable link from Supabase share_id
    const shareUrl = `${window.location.origin}/share/${chatId}`;
    
    // Simulate saving share status
    setChats(prev => 
      prev.map(c => c.id === chatId ? { ...c, isShared: true } : c)
    );
    
    return shareUrl;
  };

  const togglePause = () => {
    setIsPaused(prev => !prev);
  };

  const value: ChatContextType = {
    chats,
    currentChat,
    isGenerating,
    isPaused,
    createNewChat,
    setCurrentChat,
    addMessage,
    updateMessage,
    deleteChat,
    shareChat,
    togglePause,
    setIsGenerating,
    loadChats,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};