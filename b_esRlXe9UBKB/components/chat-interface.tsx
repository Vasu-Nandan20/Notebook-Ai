'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Copy,
  Check,
  CornerDownLeft,
  Edit3,
  Heart,
  Mic,
  MicOff,
  Pause,
  Play,
  RefreshCw,
  Share2,
  Sparkles,
  StopCircle,
  ThumbsUp,
  Trash2,
  User,
  HelpCircle,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import { useChat } from '@/lib/chat-context'
import { OutputComponents } from '@/components/output-components'
import { ShareModal } from '@/components/share-modal'
import { VoiceVisualizer } from '@/components/voice-visualizer'
import type { OutputType, PersonaType, VoiceVisualization } from '@/lib/types'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const outputOptions: { value: OutputType; label: string }[] = [
  { value: 'summary', label: 'Summary' },
  { value: 'mindmap', label: 'Mind Map' },
  { value: 'table', label: 'Table' },
  { value: 'flashcards', label: 'Flashcards' },
  { value: 'quiz', label: 'Quiz' },
]

const personaOptions: { value: PersonaType; label: string; description: string }[] = [
  { value: 'teacher', label: 'Teacher', description: 'Clear, educational explanations' },
  { value: 'friend', label: 'Friend', description: 'Casual, conversational tone' },
  { value: 'expert', label: 'Expert', description: 'Technical, detailed analysis' },
  { value: 'child', label: 'For Kids', description: 'Simple, fun explanations' },
  { value: 'eli5', label: 'ELI5', description: 'Explain like I\'m 5' },
]

const reactions = ['👍', '❤️', '🤔']

export function ChatInterface() {
  const {
    currentChat,
    addMessage,
    updateMessage,
    deleteMessage,
    addReaction,
    isGenerating,
    isPaused,
    setIsGenerating,
    togglePause,
  } = useChat()

  const [input, setInput] = useState('')
  const [outputType, setOutputType] = useState<OutputType>('summary')
  const [persona, setPersona] = useState<PersonaType>('teacher')
  const [isRecording, setIsRecording] = useState(false)
  const [voiceVolume, setVoiceVolume] = useState(0)
  const [voiceVisualization, setVoiceVisualization] = useState<VoiceVisualization>('gentle-waves')
  const [showVoiceModal, setShowVoiceModal] = useState(false)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [isAtBottom, setIsAtBottom] = useState(true)

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const recognitionRef = useRef<any>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (isAtBottom && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight
    }
  }, [currentChat?.messages, isAtBottom])

  // Detect if user is at bottom
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current
    const atBottom = scrollHeight - scrollTop - clientHeight < 50
    setIsAtBottom(atBottom)
  }, [])

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }

  const handleSubmit = async () => {
    if (!input.trim() || isGenerating) return

    addMessage({ role: 'user', content: input })
    setInput('')
    setIsGenerating(true)
    scrollToBottom()

    // Simulate AI response with streaming
    setTimeout(() => {
      const responses: Record<OutputType, string> = {
        summary:
          'Based on my analysis of the provided sources, here are the key points:\n\n**Main Concepts:**\n\n1. The topic covers fundamental principles that form the foundation of the subject\n2. There are three primary components that work together\n3. Understanding these relationships is crucial for practical application\n\n**Key Takeaways:**\n- The core mechanism operates through a series of interconnected processes\n- Each component has specific characteristics that define its behavior\n- Real-world applications demonstrate the practical value of these concepts',
        mindmap: 'MINDMAP_DATA',
        table: 'TABLE_DATA',
        flashcards: 'FLASHCARDS_DATA',
        quiz: 'QUIZ_DATA',
      }

      addMessage({
        role: 'assistant',
        content: responses[outputType],
        outputType,
        persona,
      })
      setIsGenerating(false)
    }, 2000)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Voice input is not supported in your browser')
      return
    }

    if (isRecording) {
      stopRecording()
      return
    }

    startRecording()
  }

  const startRecording = async () => {
    setIsRecording(true)
    setShowVoiceModal(true)

    // Set up audio context for visualization
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioContextRef.current = new AudioContext()
      analyserRef.current = audioContextRef.current.createAnalyser()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      source.connect(analyserRef.current)
      analyserRef.current.fftSize = 256

      const updateVolume = () => {
        if (!analyserRef.current || !isRecording) return
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
        analyserRef.current.getByteFrequencyData(dataArray)
        const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length
        setVoiceVolume(average / 255)
        if (isRecording) requestAnimationFrame(updateVolume)
      }
      updateVolume()
    } catch (error) {
      console.error('Error accessing microphone:', error)
    }

    // Set up speech recognition
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    recognitionRef.current = new SpeechRecognition()
    recognitionRef.current.continuous = false
    recognitionRef.current.interimResults = true

    recognitionRef.current.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('')
      setInput(transcript)
    }

    recognitionRef.current.onerror = () => {
      stopRecording()
      toast.error("Didn't catch that. Try again?")
    }

    recognitionRef.current.onend = () => {
      stopRecording()
    }

    recognitionRef.current.start()
  }

  const stopRecording = () => {
    setIsRecording(false)
    setShowVoiceModal(false)
    setVoiceVolume(0)

    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
    }
  }

  const handleCopyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content)
    setCopiedMessageId(id)
    toast.success('Message copied!')
    setTimeout(() => setCopiedMessageId(null), 2000)
  }

  const handleDeleteMessage = (id: string) => {
    deleteMessage(id)
    setDeleteConfirmId(null)
    toast.success('Message deleted')
  }

  const handleEditMessage = (id: string, content: string) => {
    setEditingMessageId(id)
    setEditContent(content)
  }

  const handleSaveEdit = () => {
    if (editingMessageId) {
      updateMessage(editingMessageId, editContent)
      setEditingMessageId(null)
      setEditContent('')
      toast.success('Message updated')
    }
  }

  const formatTimestamp = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes} min ago`
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <TooltipProvider>
      <div className="flex h-full flex-col">
        {/* Chat header */}
        <div className="flex shrink-0 items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-3">
            <h2 className="font-medium">{currentChat?.title || 'New Chat'}</h2>
            {currentChat?.isShared && (
              <Badge variant="secondary" className="gap-1">
                <Share2 className="size-3" />
                Shared
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isGenerating && (
              <Button
                variant="outline"
                size="sm"
                onClick={togglePause}
                className="gap-1 transition-all hover:scale-105"
              >
                {isPaused ? (
                  <>
                    <Play className="size-3" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause className="size-3" />
                    Pause
                  </>
                )}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShareModalOpen(true)}
              className="transition-all hover:scale-105 hover:bg-primary hover:text-primary-foreground"
            >
              <Share2 className="mr-1 size-3" />
              Share
            </Button>
          </div>
        </div>

        {/* Messages - Scrollable area */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto scroll-smooth p-4"
          style={{ maxHeight: 'calc(100vh - 280px)' }}
        >
          {!currentChat?.messages.length ? (
            <div className="flex h-full flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary/10 transition-transform hover:scale-110">
                <Sparkles className="size-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Welcome to NotebookAI</h3>
              <p className="mt-2 max-w-md text-muted-foreground">
                Upload your sources and ask questions. I&apos;ll help you understand,
                summarize, and create study materials from your content.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {currentChat.messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'group flex gap-4',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                  onMouseEnter={() => setHoveredMessageId(message.id)}
                  onMouseLeave={() => setHoveredMessageId(null)}
                >
                  {message.role === 'assistant' && (
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform group-hover:scale-110">
                      <Sparkles className="size-4" />
                    </div>
                  )}
                  <div
                    className={cn(
                      'relative max-w-[80%] rounded-2xl px-4 py-3 transition-all duration-200',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/20'
                        : 'bg-muted hover:bg-muted/80 hover:shadow-md',
                      'hover:-translate-y-0.5'
                    )}
                  >
                    {/* Hover actions */}
                    {hoveredMessageId === message.id && (
                      <div
                        className={cn(
                          'absolute -top-8 flex items-center gap-1 rounded-lg border bg-background p-1 shadow-lg',
                          message.role === 'user' ? 'right-0' : 'left-0'
                        )}
                      >
                        {/* Timestamp */}
                        <span className="px-2 text-xs text-muted-foreground">
                          {formatTimestamp(message.timestamp)}
                        </span>
                        
                        {/* Copy */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7"
                              onClick={() => handleCopyMessage(message.id, message.content)}
                            >
                              {copiedMessageId === message.id ? (
                                <Check className="size-3 text-green-500" />
                              ) : (
                                <Copy className="size-3" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Copy</TooltipContent>
                        </Tooltip>

                        {/* Reactions */}
                        {reactions.map((emoji) => (
                          <Button
                            key={emoji}
                            variant="ghost"
                            size="icon"
                            className={cn(
                              'size-7 transition-transform hover:scale-125',
                              message.reactions?.includes(emoji) && 'bg-primary/10'
                            )}
                            onClick={() => addReaction(message.id, emoji)}
                          >
                            <span className="text-sm">{emoji}</span>
                          </Button>
                        ))}

                        {/* Edit (user only) */}
                        {message.role === 'user' && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-7"
                                onClick={() => handleEditMessage(message.id, message.content)}
                              >
                                <Edit3 className="size-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit</TooltipContent>
                          </Tooltip>
                        )}

                        {/* Delete */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 text-destructive hover:bg-destructive/10"
                              onClick={() => setDeleteConfirmId(message.id)}
                            >
                              <Trash2 className="size-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete</TooltipContent>
                        </Tooltip>
                      </div>
                    )}

                    {editingMessageId === message.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="min-h-[100px]"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleSaveEdit}>
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingMessageId(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {message.outputType && message.outputType !== 'summary' ? (
                          <OutputComponents
                            type={message.outputType}
                            content={message.content}
                          />
                        ) : (
                          <div className="prose prose-sm max-w-none dark:prose-invert">
                            {message.content.split('\n').map((line, i) => (
                              <p key={i} className="mb-2 last:mb-0">
                                {line}
                              </p>
                            ))}
                          </div>
                        )}
                        
                        {/* Reactions display */}
                        {message.reactions && message.reactions.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {message.reactions.map((emoji, i) => (
                              <span
                                key={i}
                                className="rounded-full bg-background/50 px-1.5 py-0.5 text-xs"
                              >
                                {emoji}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        {message.persona && (
                          <Badge
                            variant="outline"
                            className="mt-2 text-xs capitalize"
                          >
                            {message.persona} mode
                          </Badge>
                        )}
                      </>
                    )}
                  </div>
                  {message.role === 'user' && (
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted transition-transform group-hover:scale-110">
                      <User className="size-4" />
                    </div>
                  )}
                </div>
              ))}
              
              {/* Generating indicator */}
              {isGenerating && (
                <div className="flex gap-4">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Sparkles className="size-4 animate-pulse" />
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-3">
                    <div className="flex gap-1">
                      <span className="size-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
                      <span className="size-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
                      <span className="size-2 animate-bounce rounded-full bg-primary" />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {isPaused ? 'Paused...' : 'Generating response...'}
                    </span>
                    {isPaused && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditMessage('current', input)}
                      >
                        <Edit3 className="mr-1 size-3" />
                        Edit question
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Scroll to bottom button */}
        {!isAtBottom && currentChat?.messages.length && (
          <div className="absolute bottom-40 left-1/2 -translate-x-1/2">
            <Button
              variant="secondary"
              size="sm"
              onClick={scrollToBottom}
              className="shadow-lg"
            >
              Scroll to bottom
            </Button>
          </div>
        )}

        {/* Fixed Input area */}
        <div className="sticky bottom-0 shrink-0 border-t bg-background p-4">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Select
              value={outputType}
              onValueChange={(value: OutputType) => setOutputType(value)}
            >
              <SelectTrigger className="w-32 transition-all hover:border-primary">
                <SelectValue placeholder="Output type" />
              </SelectTrigger>
              <SelectContent>
                {outputOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="transition-all hover:border-primary">
                  <User className="mr-1 size-3" />
                  {personaOptions.find((p) => p.value === persona)?.label}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {personaOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setPersona(option.value)}
                    className="transition-colors hover:bg-primary/10"
                  >
                    <div>
                      <p className="font-medium">{option.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Textarea
                ref={inputRef}
                placeholder="Ask a question about your sources..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="min-h-[80px] max-h-[160px] resize-none pr-12 transition-all focus:ring-2 focus:ring-primary/20"
                disabled={isGenerating}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleVoiceInput}
                className={cn(
                  'absolute bottom-2 right-2 transition-all hover:scale-110',
                  isRecording && 'text-primary animate-pulse'
                )}
                disabled={isGenerating}
              >
                {isRecording ? (
                  <MicOff className="size-5" />
                ) : (
                  <Mic className="size-5" />
                )}
              </Button>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={!input.trim() || isGenerating}
              className="h-auto transition-all hover:scale-105 hover:shadow-lg"
            >
              {isGenerating ? (
                <StopCircle className="size-5" />
              ) : (
                <CornerDownLeft className="size-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Voice Input Modal */}
        <Dialog open={showVoiceModal} onOpenChange={setShowVoiceModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Listening...</DialogTitle>
              <DialogDescription>
                Speak clearly into your microphone
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center py-8">
              <VoiceVisualizer
                isActive={isRecording}
                volume={voiceVolume}
                type={voiceVisualization}
              />
              <p className="mt-6 text-center text-sm text-muted-foreground">
                {input || "I'm listening..."}
              </p>
            </div>
            <DialogFooter className="flex-col gap-2 sm:flex-row">
              <Select
                value={voiceVisualization}
                onValueChange={(value: VoiceVisualization) => setVoiceVisualization(value)}
              >
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gentle-waves">Gentle Waves</SelectItem>
                  <SelectItem value="breathing-circle">Breathing Circle</SelectItem>
                  <SelectItem value="particle-cloud">Particle Cloud</SelectItem>
                  <SelectItem value="aurora">Aurora</SelectItem>
                  <SelectItem value="minimal">Minimal</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="destructive" onClick={stopRecording}>
                <X className="mr-2 size-4" />
                Stop
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Are you sure?</DialogTitle>
              <DialogDescription>
                This will remove your message forever. Can&apos;t undo!
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmId(null)}
              >
                No, keep it
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteConfirmId && handleDeleteMessage(deleteConfirmId)}
              >
                Yes, delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Share Modal */}
        <ShareModal
          open={shareModalOpen}
          onOpenChange={setShareModalOpen}
          chatId={currentChat?.id || ''}
        />
      </div>
    </TooltipProvider>
  )
}
