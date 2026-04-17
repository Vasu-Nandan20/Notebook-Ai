'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  Check,
  ChevronDown,
  ChevronUp,
  FileText,
  Globe,
  GripVertical,
  Layers,
  Link,
  Loader2,
  MoreHorizontal,
  Plus,
  Trash2,
  Upload,
  X,
  Youtube,
  File,
  Grid,
  List,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import { useChat } from '@/lib/chat-context'
import type { Source } from '@/lib/types'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const sourceTypeIcons: Record<Source['type'], typeof FileText> = {
  pdf: FileText,
  youtube: Youtube,
  website: Globe,
  text: FileText,
  docx: File,
  md: FileText,
}

const sourceTypeColors: Record<Source['type'], string> = {
  pdf: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  youtube: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  website: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  text: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
  docx: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  md: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20',
}

const statusIcons: Record<string, React.ReactNode> = {
  uploading: <Loader2 className="size-4 animate-spin text-blue-500" />,
  processing: <Loader2 className="size-4 animate-spin text-yellow-500" />,
  ready: <Check className="size-4 text-green-500" />,
  error: <AlertCircle className="size-4 text-red-500" />,
}

export function SourcePanel() {
  const {
    currentChat,
    addSource,
    removeSource,
    removeMultipleSources,
    clearAllSources,
    reorderSources,
  } = useChat()
  
  const [dialogOpen, setDialogOpen] = useState(false)
  const [url, setUrl] = useState('')
  const [textContent, setTextContent] = useState('')
  const [textTitle, setTextTitle] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedSources, setSelectedSources] = useState<string[]>([])
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 10) {
        toast.error('Maximum 10 files at a time')
        return
      }

      acceptedFiles.forEach((file, index) => {
        // Check file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 10MB)`)
          return
        }

        const type = file.name.endsWith('.pdf')
          ? 'pdf'
          : file.name.endsWith('.docx')
          ? 'docx'
          : file.name.endsWith('.md')
          ? 'md'
          : 'text'

        // Simulate staggered upload
        setTimeout(() => {
          addSource({
            type,
            name: file.name,
            size: file.size,
            pages: type === 'pdf' ? Math.floor(Math.random() * 50) + 5 : undefined,
          })
        }, index * 500)
      })
      setDialogOpen(false)
    },
    [addSource]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/markdown': ['.md'],
    },
    maxFiles: 10,
  })

  const handleAddUrl = () => {
    if (!url) return
    const isYoutube = url.includes('youtube.com') || url.includes('youtu.be')
    addSource({
      type: isYoutube ? 'youtube' : 'website',
      name: url,
      url,
    })
    setUrl('')
    setDialogOpen(false)
    toast.success('Source added')
  }

  const handleAddText = () => {
    if (!textContent) return
    addSource({
      type: 'text',
      name: textTitle || 'Untitled Note',
      content: textContent,
      size: textContent.length,
    })
    setTextContent('')
    setTextTitle('')
    setDialogOpen(false)
    toast.success('Text source added')
  }

  const handleSelectSource = (id: string) => {
    setSelectedSources((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  const handleBulkDelete = () => {
    removeMultipleSources(selectedSources)
    setSelectedSources([])
    setSelectionMode(false)
    setDeleteConfirmOpen(false)
    toast.success(`${selectedSources.length} sources removed`)
  }

  const handleClearAll = () => {
    clearAllSources()
    setDeleteConfirmOpen(false)
    toast.success('All sources cleared')
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return
    reorderSources(draggedIndex, index)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <TooltipProvider>
      <div className="flex h-full flex-col rounded-lg border bg-card">
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="text-sm font-semibold">Sources</h3>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                >
                  {viewMode === 'list' ? <Grid className="size-4" /> : <List className="size-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle view</TooltipContent>
            </Tooltip>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSelectionMode(!selectionMode)}>
                  <Layers className="mr-2 size-4" />
                  {selectionMode ? 'Cancel Selection' : 'Select Multiple'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => setDeleteConfirmOpen(true)}
                >
                  <Trash2 className="mr-2 size-4" />
                  Clear All Files
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="transition-all hover:scale-105">
                  <Plus className="mr-1 size-3" />
                  Add
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add Source</DialogTitle>
                  <DialogDescription>
                    Upload files, add links, or paste text to use as context for your
                    questions. Max 10 files, 10MB each.
                  </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="upload" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="upload" className="transition-all">
                      <Upload className="mr-1 size-3" />
                      Upload
                    </TabsTrigger>
                    <TabsTrigger value="link" className="transition-all">
                      <Link className="mr-1 size-3" />
                      Link
                    </TabsTrigger>
                    <TabsTrigger value="text" className="transition-all">
                      <FileText className="mr-1 size-3" />
                      Text
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="upload" className="mt-4">
                    <div
                      {...getRootProps()}
                      className={cn(
                        'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-all',
                        isDragActive
                          ? 'border-primary bg-primary/5 scale-[1.02]'
                          : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
                      )}
                    >
                      <input {...getInputProps()} />
                      <Upload className={cn(
                        'mb-3 size-10 transition-transform',
                        isDragActive ? 'scale-110 text-primary' : 'text-muted-foreground'
                      )} />
                      <p className="text-center text-sm text-muted-foreground">
                        {isDragActive
                          ? 'Drop the files here...'
                          : 'Drop PDFs anywhere or click to browse'}
                      </p>
                      <p className="mt-2 text-center text-xs text-muted-foreground">
                        Supports: PDF, TXT, DOCX, MD (Max 10 files, 10MB each)
                      </p>
                    </div>
                  </TabsContent>
                  <TabsContent value="link" className="mt-4 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="url">URL</Label>
                      <Input
                        id="url"
                        placeholder="https://youtube.com/watch?v=... or https://example.com"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Supports YouTube videos and website URLs
                      </p>
                    </div>
                    <Button onClick={handleAddUrl} disabled={!url} className="w-full">
                      Add Link
                    </Button>
                  </TabsContent>
                  <TabsContent value="text" className="mt-4 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="text-title">Title (optional)</Label>
                      <Input
                        id="text-title"
                        placeholder="My Notes"
                        value={textTitle}
                        onChange={(e) => setTextTitle(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="text-content">Content</Label>
                      <Textarea
                        id="text-content"
                        placeholder="Paste your text content here..."
                        rows={6}
                        value={textContent}
                        onChange={(e) => setTextContent(e.target.value)}
                      />
                    </div>
                    <Button
                      onClick={handleAddText}
                      disabled={!textContent}
                      className="w-full"
                    >
                      Add Text
                    </Button>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Selection actions */}
        {selectionMode && selectedSources.length > 0 && (
          <div className="flex items-center justify-between border-b bg-muted/50 px-4 py-2">
            <span className="text-sm">{selectedSources.length} selected</span>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteConfirmOpen(true)}
            >
              <Trash2 className="mr-1 size-3" />
              Delete
            </Button>
          </div>
        )}

        <ScrollArea className="flex-1 p-4">
          {!currentChat?.sources.length ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileText className="mb-3 size-10 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No sources added yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Add PDFs, links, or text to get started
              </p>
            </div>
          ) : viewMode === 'list' ? (
            <div className="space-y-2">
              {currentChat.sources.map((source, index) => {
                const Icon = sourceTypeIcons[source.type]
                return (
                  <div
                    key={source.id}
                    draggable={!selectionMode}
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={cn(
                      'group flex items-center gap-3 rounded-lg border bg-card p-3 transition-all duration-200',
                      'hover:-translate-y-0.5 hover:shadow-md hover:bg-accent/50',
                      draggedIndex === index && 'opacity-50',
                      selectedSources.includes(source.id) && 'ring-2 ring-primary'
                    )}
                  >
                    {selectionMode && (
                      <Checkbox
                        checked={selectedSources.includes(source.id)}
                        onCheckedChange={() => handleSelectSource(source.id)}
                      />
                    )}
                    
                    {!selectionMode && (
                      <GripVertical className="size-4 cursor-grab text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    )}
                    
                    <div
                      className={cn(
                        'flex size-8 shrink-0 items-center justify-center rounded-md border transition-transform group-hover:scale-110',
                        sourceTypeColors[source.type]
                      )}
                    >
                      <Icon className="size-4" />
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{source.name}</p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="secondary" className="capitalize">
                          {source.type}
                        </Badge>
                        <span>{formatFileSize(source.size)}</span>
                        {source.pages && <span>{source.pages} pages</span>}
                      </div>
                      
                      {source.status === 'processing' && source.progress !== undefined && (
                        <Progress value={source.progress} className="mt-2 h-1" />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {statusIcons[source.status || 'ready']}
                      
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeSource(source.id)}
                        className="opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {currentChat.sources.map((source) => {
                const Icon = sourceTypeIcons[source.type]
                return (
                  <div
                    key={source.id}
                    className={cn(
                      'group flex flex-col items-center gap-2 rounded-lg border bg-card p-4 transition-all duration-200',
                      'hover:-translate-y-1 hover:shadow-lg hover:bg-accent/50',
                      selectedSources.includes(source.id) && 'ring-2 ring-primary'
                    )}
                  >
                    {selectionMode && (
                      <Checkbox
                        checked={selectedSources.includes(source.id)}
                        onCheckedChange={() => handleSelectSource(source.id)}
                        className="self-start"
                      />
                    )}
                    
                    <div
                      className={cn(
                        'flex size-12 items-center justify-center rounded-lg border transition-transform group-hover:scale-110',
                        sourceTypeColors[source.type]
                      )}
                    >
                      <Icon className="size-6" />
                    </div>
                    
                    <p className="max-w-full truncate text-center text-xs font-medium">
                      {source.name}
                    </p>
                    
                    <div className="flex items-center gap-1">
                      {statusIcons[source.status || 'ready']}
                      <Badge variant="secondary" className="text-[10px] capitalize">
                        {source.type}
                      </Badge>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeSource(source.id)}
                      className="absolute right-1 top-1 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <X className="size-3" />
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Are you sure?</DialogTitle>
              <DialogDescription>
                {selectedSources.length > 0
                  ? `This will remove ${selectedSources.length} source(s) forever.`
                  : 'This will remove all sources from this chat.'}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={selectedSources.length > 0 ? handleBulkDelete : handleClearAll}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}
