'use client'

import { useState } from 'react'
import {
  BookOpen,
  Copy,
  Check,
  Download,
  Eye,
  MessageSquare,
  Sparkles,
  User,
  Lock,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface SharedChatViewProps {
  shareId: string
}

// Demo shared chat data
const demoChat = {
  title: 'Introduction to Machine Learning',
  owner: 'Anonymous',
  sharedAt: new Date(),
  viewCount: 42,
  allowComments: false,
  allowExport: true,
  messages: [
    {
      id: '1',
      role: 'user' as const,
      content: 'Explain the basics of machine learning',
      timestamp: new Date(Date.now() - 3600000),
    },
    {
      id: '2',
      role: 'assistant' as const,
      content: 'Machine learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed.\n\n**Key Concepts:**\n\n1. **Supervised Learning**: The algorithm learns from labeled training data\n2. **Unsupervised Learning**: The algorithm finds patterns in unlabeled data\n3. **Reinforcement Learning**: The algorithm learns through trial and error\n\nMachine learning is used in many applications including image recognition, natural language processing, and recommendation systems.',
      timestamp: new Date(Date.now() - 3500000),
    },
  ],
}

export function SharedChatView({ shareId }: SharedChatViewProps) {
  const [passwordRequired, setPasswordRequired] = useState(false)
  const [password, setPassword] = useState('')
  const [isUnlocked, setIsUnlocked] = useState(true)
  const [copied, setCopied] = useState(false)

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    toast.success('Link copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleExport = () => {
    toast.success('Export started - PDF download would begin')
  }

  const handleUnlock = () => {
    // Demo: any password works
    if (password) {
      setIsUnlocked(true)
      setPasswordRequired(false)
    }
  }

  if (passwordRequired && !isUnlocked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
              <Lock className="size-8 text-primary" />
            </div>
            <CardTitle>Protected Chat</CardTitle>
            <CardDescription>
              This chat is password protected. Enter the password to view.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
            />
            <Button onClick={handleUnlock} className="w-full">
              Unlock
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Banner */}
      <div className="border-b bg-muted/50 px-4 py-2 text-center text-sm">
        <span className="flex items-center justify-center gap-2">
          <Eye className="size-4" />
          You&apos;re viewing a shared chat
        </span>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur lg:px-6">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BookOpen className="size-4" />
          </div>
          <span className="text-lg font-semibold">NotebookAI</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleCopyLink}>
            {copied ? (
              <Check className="mr-1 size-3" />
            ) : (
              <Copy className="mr-1 size-3" />
            )}
            {copied ? 'Copied!' : 'Copy Link'}
          </Button>
          {demoChat.allowExport && (
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="mr-1 size-3" />
              Export PDF
            </Button>
          )}
          <Button size="sm">
            Save to My Account
          </Button>
        </div>
      </header>

      {/* Chat Info */}
      <div className="border-b px-4 py-4 lg:px-6">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-xl font-semibold">{demoChat.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>Shared by {demoChat.owner}</span>
            <span>|</span>
            <span className="flex items-center gap-1">
              <Eye className="size-3" />
              {demoChat.viewCount} views
            </span>
            <span>|</span>
            <span>{demoChat.sharedAt.toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-3xl space-y-6 p-4 lg:p-6">
          {demoChat.messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex gap-4',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Sparkles className="size-4" />
                </div>
              )}
              <div
                className={cn(
                  'max-w-[80%] rounded-2xl px-4 py-3',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  {message.content.split('\n').map((line, i) => (
                    <p key={i} className="mb-2 last:mb-0">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
              {message.role === 'user' && (
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                  <User className="size-4" />
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t bg-muted/50 px-4 py-4 text-center lg:px-6">
        <p className="text-sm text-muted-foreground">
          Want to create your own AI-powered notebooks?
        </p>
        <Button className="mt-2">
          Get Started with NotebookAI
        </Button>
      </div>
    </div>
  )
}
