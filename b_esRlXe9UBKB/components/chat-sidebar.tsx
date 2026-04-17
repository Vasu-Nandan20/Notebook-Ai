'use client'

import { useState } from 'react'
import {
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  HardDrive,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Search,
  Share2,
  Trash2,
  X,
  Edit3,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { useChat } from '@/lib/chat-context'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface ChatSidebarProps {
  isOpen: boolean
  onClose: () => void
  isMobile: boolean
}

export function ChatSidebar({ isOpen, onClose, isMobile }: ChatSidebarProps) {
  const {
    chats,
    currentChat,
    setCurrentChat,
    createNewChat,
    deleteChat,
    deleteMultipleChats,
    clearAllChats,
    deleteOlderThan,
    renameChat,
    shareChat,
    sidebarCollapsed,
    setSidebarCollapsed,
    storageInfo,
  } = useChat()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedChats, setSelectedChats] = useState<string[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false)
  const [deleteOlderDialogOpen, setDeleteOlderDialogOpen] = useState(false)
  const [renamingChatId, setRenamingChatId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [undoChat, setUndoChat] = useState<{ id: string; timeout: NodeJS.Timeout } | null>(null)
  const [dontAskAgain, setDontAskAgain] = useState(false)

  const filteredChats = chats.filter((chat) =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatDate = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    return date.toLocaleDateString()
  }

  const handleChatSelect = (chatId: string) => {
    if (selectionMode) {
      setSelectedChats((prev) =>
        prev.includes(chatId)
          ? prev.filter((id) => id !== chatId)
          : [...prev, chatId]
      )
      return
    }
    
    const chat = chats.find((c) => c.id === chatId)
    if (chat) {
      setCurrentChat(chat)
      if (isMobile) onClose()
    }
  }

  const handleDelete = (chatId: string) => {
    if (dontAskAgain) {
      performDelete(chatId)
      return
    }
    setSelectedChats([chatId])
    setDeleteDialogOpen(true)
  }

  const performDelete = (chatId: string) => {
    deleteChat(chatId)
    
    // Show undo toast
    const timeout = setTimeout(() => {
      setUndoChat(null)
    }, 5000)
    
    setUndoChat({ id: chatId, timeout })
    toast.success('Chat deleted', {
      action: {
        label: 'Undo',
        onClick: () => {
          // In a real app, you'd restore from a backup
          clearTimeout(timeout)
          setUndoChat(null)
          toast.info('Undo is not available in this demo')
        },
      },
    })
  }

  const handleBulkDelete = () => {
    deleteMultipleChats(selectedChats)
    setSelectedChats([])
    setSelectionMode(false)
    setDeleteDialogOpen(false)
    toast.success(`${selectedChats.length} chats deleted`)
  }

  const handleClearAll = () => {
    clearAllChats()
    setDeleteAllDialogOpen(false)
    toast.success('All chats cleared')
  }

  const handleDeleteOlder = (days: number) => {
    deleteOlderThan(days)
    setDeleteOlderDialogOpen(false)
    toast.success(`Chats older than ${days} days deleted`)
  }

  const handleRename = (chatId: string, title: string) => {
    setRenamingChatId(chatId)
    setRenameValue(title)
  }

  const handleSaveRename = () => {
    if (renamingChatId && renameValue.trim()) {
      renameChat(renamingChatId, renameValue.trim())
      setRenamingChatId(null)
      setRenameValue('')
      toast.success('Chat renamed')
    }
  }

  const handleShare = (chatId: string) => {
    const url = shareChat(chatId, {
      visibility: 'unlisted',
      expiration: '7days',
      allowComments: false,
      allowExport: true,
      viewCount: 0,
    })
    navigator.clipboard.writeText(url)
    toast.success('Share link copied!')
  }

  const handleExportAll = () => {
    toast.success('Export started - this would download a ZIP file')
  }

  // Collapsed sidebar (icons only)
  if (sidebarCollapsed && !isMobile) {
    return (
      <TooltipProvider>
        <aside className="flex w-16 flex-col items-center border-r bg-sidebar py-4 transition-all duration-300">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={createNewChat}
                className="mb-4"
              >
                <Plus className="size-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">New Chat</TooltipContent>
          </Tooltip>

          <ScrollArea className="flex-1 w-full px-2">
            <div className="space-y-2">
              {chats.slice(0, 10).map((chat) => (
                <Tooltip key={chat.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => handleChatSelect(chat.id)}
                      className={cn(
                        'flex size-10 items-center justify-center rounded-lg transition-all hover:bg-sidebar-accent',
                        currentChat?.id === chat.id && 'bg-sidebar-accent'
                      )}
                    >
                      <MessageSquare className="size-4 text-sidebar-foreground" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">{chat.title}</TooltipContent>
                </Tooltip>
              ))}
            </div>
          </ScrollArea>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarCollapsed(false)}
                className="mt-4"
              >
                <ChevronRight className="size-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Expand Sidebar</TooltipContent>
          </Tooltip>
        </aside>
      </TooltipProvider>
    )
  }

  return (
    <TooltipProvider>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r bg-sidebar transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] lg:relative lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          isMobile ? 'top-0' : 'top-14'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-sm font-semibold text-sidebar-foreground">
            Chat History
          </h2>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={createNewChat}
                  className="text-sidebar-foreground transition-all hover:rotate-90 hover:bg-sidebar-accent"
                >
                  <Plus className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>New Chat</TooltipContent>
            </Tooltip>
            
            {!isMobile && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setSidebarCollapsed(true)}
                    className="text-sidebar-foreground hover:bg-sidebar-accent"
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Collapse Sidebar</TooltipContent>
              </Tooltip>
            )}
            
            {isMobile && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onClose}
                className="text-sidebar-foreground hover:bg-sidebar-accent lg:hidden"
              >
                <X className="size-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Search and Actions */}
        <div className="space-y-2 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={selectionMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setSelectionMode(!selectionMode)
                setSelectedChats([])
              }}
              className="flex-1 text-xs"
            >
              {selectionMode ? 'Cancel' : 'Select'}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="text-xs">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setDeleteAllDialogOpen(true)}>
                  <Trash2 className="mr-2 size-4" />
                  Clear All Chats
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDeleteOlderDialogOpen(true)}>
                  <Calendar className="mr-2 size-4" />
                  Delete Old Chats
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleExportAll}>
                  <Download className="mr-2 size-4" />
                  Export All as ZIP
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {selectionMode && selectedChats.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
              className="w-full"
            >
              <Trash2 className="mr-2 size-4" />
              Delete {selectedChats.length} selected
            </Button>
          )}
        </div>

        {/* Chat List */}
        <ScrollArea className="flex-1 px-2">
          <div className="space-y-1 pb-4">
            {filteredChats.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                No chats found
              </p>
            ) : (
              filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  className={cn(
                    'group flex cursor-pointer items-start gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 hover:-translate-y-0.5 hover:bg-sidebar-accent hover:shadow-md',
                    currentChat?.id === chat.id && 'bg-sidebar-accent shadow-sm'
                  )}
                  onClick={() => handleChatSelect(chat.id)}
                >
                  {selectionMode && (
                    <Checkbox
                      checked={selectedChats.includes(chat.id)}
                      onCheckedChange={() => handleChatSelect(chat.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1"
                    />
                  )}
                  
                  <MessageSquare className="mt-0.5 size-4 shrink-0 text-sidebar-foreground/70 transition-transform group-hover:scale-110" />
                  
                  <div className="min-w-0 flex-1">
                    {renamingChatId === chat.id ? (
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <Input
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveRename()}
                          className="h-7 text-sm"
                          autoFocus
                        />
                        <Button size="icon-sm" onClick={handleSaveRename}>
                          <Check className="size-3" />
                        </Button>
                      </div>
                    ) : (
                      <p className="truncate text-sm font-medium text-sidebar-foreground">
                        {chat.title}
                      </p>
                    )}
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="size-3" />
                      <span>{formatDate(chat.updatedAt)}</span>
                      {chat.isShared && (
                        <span className="flex items-center gap-1 text-primary">
                          <Share2 className="size-3" />
                          Shared
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {!selectionMode && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="opacity-0 transition-opacity group-hover:opacity-100"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleRename(chat.id, chat.title)}>
                          <Edit3 className="mr-2 size-4" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleShare(chat.id)}>
                          <Share2 className="mr-2 size-4" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(chat.id)}
                        >
                          <Trash2 className="mr-2 size-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Storage Info */}
        <div className="border-t p-4">
          <div className="mb-3 flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 text-muted-foreground">
              <HardDrive className="size-3" />
              Storage
            </span>
            <span className={cn(
              'font-medium',
              storageInfo.percentage > 90 ? 'text-destructive' :
              storageInfo.percentage > 80 ? 'text-yellow-500' : ''
            )}>
              {storageInfo.used.toFixed(1)} KB / {(storageInfo.total / 1024).toFixed(0)} MB
            </span>
          </div>
          <Progress
            value={storageInfo.percentage}
            className={cn(
              'h-1.5',
              storageInfo.percentage > 90 ? '[&>div]:bg-destructive' :
              storageInfo.percentage > 80 ? '[&>div]:bg-yellow-500' : ''
            )}
          />
          
          <Button
            onClick={createNewChat}
            className="mt-4 w-full transition-all hover:scale-[1.02]"
            variant="outline"
          >
            <Plus className="mr-2 size-4" />
            New Chat
          </Button>
        </div>
      </aside>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This will remove {selectedChats.length === 1 ? 'this chat' : `${selectedChats.length} chats`} forever. Can&apos;t undo!
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 py-4">
            <Checkbox
              id="dontAsk"
              checked={dontAskAgain}
              onCheckedChange={(checked) => setDontAskAgain(checked as boolean)}
            />
            <label htmlFor="dontAsk" className="text-sm text-muted-foreground">
              Don&apos;t ask again
            </label>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              No, keep it
            </Button>
            <Button variant="destructive" onClick={handleBulkDelete}>
              Yes, delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clear All Dialog */}
      <Dialog open={deleteAllDialogOpen} onOpenChange={setDeleteAllDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Clear All Chats?</DialogTitle>
            <DialogDescription>
              This will permanently delete all {chats.length} chats. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteAllDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleClearAll}>
              Clear All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Older Dialog */}
      <Dialog open={deleteOlderDialogOpen} onOpenChange={setDeleteOlderDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Old Chats</DialogTitle>
            <DialogDescription>
              Choose how old the chats should be to delete them.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2 py-4">
            <Button variant="outline" onClick={() => handleDeleteOlder(7)}>
              Older than 7 days
            </Button>
            <Button variant="outline" onClick={() => handleDeleteOlder(30)}>
              Older than 30 days
            </Button>
            <Button variant="outline" onClick={() => handleDeleteOlder(90)}>
              Older than 90 days
            </Button>
            <Button variant="outline" onClick={() => handleDeleteOlder(365)}>
              Older than 1 year
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOlderDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}
