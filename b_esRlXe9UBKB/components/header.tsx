'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import {
  BookOpen,
  Edit3,
  LogIn,
  LogOut,
  Menu,
  Moon,
  Settings,
  Sun,
  User,
  Shield,
  Check,
  FileText,
  Youtube,
  Globe,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth-context'
import { useChat } from '@/lib/chat-context'
import { ThemeSelector } from '@/components/theme-selector'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface HeaderProps {
  onMenuClick: () => void
  isMobile: boolean
}

export function Header({ onMenuClick, isMobile }: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const { user, isAuthenticated, login, logout, isAdmin } = useAuth()
  const { currentChat, renameChat } = useChat()
  const [loginDialogOpen, setLoginDialogOpen] = useState(false)
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setLoginError('')

    const success = await login(email, password)
    if (success) {
      setLoginDialogOpen(false)
      setEmail('')
      setPassword('')
      toast.success('Logged in successfully!')
    } else {
      setLoginError('Invalid email or password')
    }
    setIsLoading(false)
  }

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
  }

  const handleRenameClick = () => {
    if (currentChat) {
      setNewTitle(currentChat.title)
      setRenameDialogOpen(true)
    }
  }

  const handleSaveRename = () => {
    if (currentChat && newTitle.trim()) {
      renameChat(currentChat.id, newTitle.trim().slice(0, 50))
      setRenameDialogOpen(false)
      toast.success('Chat renamed')
    }
  }

  const handleAutoGenerate = () => {
    if (currentChat?.messages.length > 0) {
      const firstMessage = currentChat.messages[0].content
      setNewTitle(firstMessage.slice(0, 50))
    }
  }

  // Determine dynamic heading based on sources
  const getDynamicHeading = () => {
    if (!currentChat) return 'NotebookAI'
    
    if (currentChat.sources.length === 0) {
      return currentChat.title || 'New Chat'
    }
    
    if (currentChat.sources.length === 1) {
      const source = currentChat.sources[0]
      if (source.type === 'youtube') {
        return source.name.includes('youtube.com') ? 'YouTube Video' : source.name
      }
      if (source.type === 'website') {
        try {
          const url = new URL(source.url || '')
          return url.hostname
        } catch {
          return source.name
        }
      }
      return source.name.length > 30 ? source.name.slice(0, 30) + '...' : source.name
    }
    
    return `${currentChat.sources.length} files loaded`
  }

  const getHeadingIcon = () => {
    if (!currentChat?.sources.length) return null
    
    const source = currentChat.sources[0]
    if (currentChat.sources.length > 1) return <FileText className="size-4" />
    if (source.type === 'youtube') return <Youtube className="size-4 text-red-500" />
    if (source.type === 'website') return <Globe className="size-4 text-blue-500" />
    return <FileText className="size-4 text-orange-500" />
  }

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:px-6">
      {/* Left side - Logo (Fixed) */}
      <div className="flex items-center gap-3">
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="transition-transform hover:scale-110"
          >
            <Menu className="size-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        )}
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 transition-transform hover:scale-105"
        >
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-all hover:rotate-12 lg:size-10">
            <BookOpen className="size-4 lg:size-5" />
          </div>
          <span className="hidden text-lg font-semibold tracking-tight sm:inline">
            NotebookAI
          </span>
        </button>
      </div>

      {/* Center - Dynamic Heading */}
      <button
        onClick={handleRenameClick}
        className="group hidden items-center gap-2 rounded-lg px-3 py-1.5 transition-all hover:bg-muted md:flex"
      >
        {getHeadingIcon()}
        <span className="max-w-[200px] truncate text-sm font-medium lg:max-w-[300px]">
          {getDynamicHeading()}
        </span>
        <Edit3 className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
      </button>

      {/* Right side - Controls (Fixed) */}
      <div className="flex items-center gap-2">
        <ThemeSelector />
        
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
            className="transition-transform hover:scale-110"
          >
            <Sun className="size-5 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute size-5 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
          </Button>
        )}

        {isAuthenticated ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative transition-transform hover:scale-110"
              >
                <User className="size-5" />
                {isAdmin && (
                  <span className="absolute -right-0.5 -top-0.5 flex size-3 items-center justify-center rounded-full bg-primary">
                    <Shield className="size-2 text-primary-foreground" />
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                  <p className="text-xs font-medium capitalize text-primary">
                    {user?.role} Account
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {isAdmin && (
                <DropdownMenuItem className="transition-colors hover:bg-primary/10">
                  <Shield className="mr-2 size-4" />
                  Admin Dashboard
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className="transition-colors hover:bg-primary/10">
                <Settings className="mr-2 size-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive transition-colors hover:bg-destructive/10"
              >
                <LogOut className="mr-2 size-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            variant="default"
            size="sm"
            onClick={() => setLoginDialogOpen(true)}
            className="transition-all hover:scale-105"
          >
            <LogIn className="mr-2 size-4" />
            Login
          </Button>
        )}
      </div>

      {/* Login Dialog */}
      <Dialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Login to NotebookAI</DialogTitle>
            <DialogDescription>
              Enter your credentials to access your notebooks and chat history.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {loginError && (
              <p className="text-sm text-destructive">{loginError}</p>
            )}
            <div className="flex flex-col gap-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Demo: admin@example.com / admin123 or user@example.com / user123
              </p>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename Chat</DialogTitle>
            <DialogDescription>
              Give your chat a custom name (max 50 characters)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="chat-title">Chat Title</Label>
              <Input
                id="chat-title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value.slice(0, 50))}
                placeholder="Enter a title..."
                onKeyDown={(e) => e.key === 'Enter' && handleSaveRename()}
              />
              <p className="text-xs text-muted-foreground">
                {newTitle.length}/50 characters
              </p>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleAutoGenerate}
              className="w-full"
            >
              Auto-generate from first message
            </Button>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveRename} disabled={!newTitle.trim()}>
                <Check className="mr-2 size-4" />
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  )
}
