'use client'

import { useState } from 'react'
import { Palette, Check, Upload, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useChat } from '@/lib/chat-context'
import type { ThemeBackground } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ThemeOption {
  id: ThemeBackground
  name: string
  preview: string
  category: 'solid' | 'gradient' | 'pattern'
}

const themeOptions: ThemeOption[] = [
  { id: 'default', name: 'Default', preview: 'bg-background', category: 'solid' },
  { id: 'soft-blue', name: 'Soft Blue', preview: 'bg-[#E8F4FD]', category: 'solid' },
  { id: 'mint-green', name: 'Mint Green', preview: 'bg-[#E0F7E8]', category: 'solid' },
  { id: 'lavender', name: 'Lavender', preview: 'bg-[#F0E6FF]', category: 'solid' },
  { id: 'peach', name: 'Peach', preview: 'bg-[#FFE5D9]', category: 'solid' },
  { id: 'dark-mode', name: 'Night Owl', preview: 'bg-[#1A1A2E]', category: 'solid' },
  { id: 'gradient-sunset', name: 'Sunset', preview: 'bg-gradient-to-br from-orange-400 to-pink-500', category: 'gradient' },
  { id: 'gradient-ocean', name: 'Ocean', preview: 'bg-gradient-to-br from-blue-400 to-teal-500', category: 'gradient' },
  { id: 'gradient-forest', name: 'Forest', preview: 'bg-gradient-to-br from-green-400 to-emerald-500', category: 'gradient' },
  { id: 'gradient-galaxy', name: 'Galaxy', preview: 'bg-gradient-to-br from-purple-600 to-slate-900', category: 'gradient' },
  { id: 'gradient-aurora', name: 'Aurora', preview: 'bg-gradient-to-br from-cyan-400 to-purple-500', category: 'gradient' },
  { id: 'pattern-dots', name: 'Dots', preview: 'bg-muted', category: 'pattern' },
  { id: 'pattern-grid', name: 'Grid', preview: 'bg-muted', category: 'pattern' },
  { id: 'pattern-waves', name: 'Waves', preview: 'bg-muted', category: 'pattern' },
]

export function ThemeSelector() {
  const { themeBackground, setThemeBackground } = useChat()
  const [open, setOpen] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)
  const [textOverlay, setTextOverlay] = useState(20)

  const handleSelectTheme = (theme: ThemeBackground) => {
    setThemeBackground(theme)
  }

  const groupedThemes = {
    solid: themeOptions.filter((t) => t.category === 'solid'),
    gradient: themeOptions.filter((t) => t.category === 'gradient'),
    pattern: themeOptions.filter((t) => t.category === 'pattern'),
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Palette className="size-4" />
          <span className="hidden sm:inline">Theme</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-5" />
            Customize Theme
          </DialogTitle>
          <DialogDescription>
            Choose a background theme for your workspace
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Solid Colors */}
            <div>
              <h4 className="mb-3 text-sm font-medium text-muted-foreground">Solid Colors</h4>
              <div className="grid grid-cols-3 gap-2">
                {groupedThemes.solid.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => handleSelectTheme(theme.id)}
                    className={cn(
                      'group relative flex h-20 flex-col items-center justify-center rounded-lg border-2 transition-all hover:scale-105',
                      theme.preview,
                      themeBackground === theme.id
                        ? 'border-primary ring-2 ring-primary ring-offset-2'
                        : 'border-transparent hover:border-primary/50'
                    )}
                  >
                    {themeBackground === theme.id && (
                      <div className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="size-3" />
                      </div>
                    )}
                    <span className={cn(
                      'text-xs font-medium',
                      theme.id === 'dark-mode' ? 'text-white' : 'text-foreground'
                    )}>
                      {theme.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Gradients */}
            <div>
              <h4 className="mb-3 text-sm font-medium text-muted-foreground">Gradients</h4>
              <div className="grid grid-cols-3 gap-2">
                {groupedThemes.gradient.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => handleSelectTheme(theme.id)}
                    className={cn(
                      'group relative flex h-20 flex-col items-center justify-center rounded-lg border-2 transition-all hover:scale-105',
                      theme.preview,
                      themeBackground === theme.id
                        ? 'border-primary ring-2 ring-primary ring-offset-2'
                        : 'border-transparent hover:border-primary/50'
                    )}
                  >
                    {themeBackground === theme.id && (
                      <div className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="size-3" />
                      </div>
                    )}
                    <span className="text-xs font-medium text-white drop-shadow">
                      {theme.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Patterns */}
            <div>
              <h4 className="mb-3 text-sm font-medium text-muted-foreground">Patterns</h4>
              <div className="grid grid-cols-3 gap-2">
                {groupedThemes.pattern.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => handleSelectTheme(theme.id)}
                    className={cn(
                      'group relative flex h-20 flex-col items-center justify-center rounded-lg border-2 transition-all hover:scale-105',
                      theme.preview,
                      themeBackground === theme.id
                        ? 'border-primary ring-2 ring-primary ring-offset-2'
                        : 'border-transparent hover:border-primary/50',
                      theme.id === 'pattern-dots' && 'bg-[radial-gradient(circle,_currentColor_1px,_transparent_1px)] bg-[length:12px_12px]',
                      theme.id === 'pattern-grid' && 'bg-[linear-gradient(to_right,_currentColor_1px,_transparent_1px),_linear-gradient(to_bottom,_currentColor_1px,_transparent_1px)] bg-[length:20px_20px]',
                      theme.id === 'pattern-waves' && 'bg-[url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 1440 320\'%3E%3Cpath fill=\'%23e5e7eb\' fill-opacity=\'0.5\' d=\'M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z\'%3E%3C/path%3E%3C/svg%3E")] bg-cover'
                    )}
                  >
                    {themeBackground === theme.id && (
                      <div className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="size-3" />
                      </div>
                    )}
                    <span className="text-xs font-medium">{theme.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Upload */}
            <div>
              <h4 className="mb-3 text-sm font-medium text-muted-foreground">Custom Image</h4>
              <button className="flex h-20 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 transition-colors hover:border-primary/50 hover:bg-muted/50">
                <Upload className="size-5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Upload Image (Max 2MB)</span>
              </button>
            </div>

            {/* Accessibility Options */}
            <div className="space-y-4 rounded-lg border p-4">
              <h4 className="text-sm font-medium">Accessibility</h4>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="reduce-motion" className="text-sm">
                  Reduce motion
                </Label>
                <Switch
                  id="reduce-motion"
                  checked={reduceMotion}
                  onCheckedChange={setReduceMotion}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Text background opacity</Label>
                  <span className="text-sm text-muted-foreground">{textOverlay}%</span>
                </div>
                <Slider
                  value={[textOverlay]}
                  onValueChange={([value]) => setTextOverlay(value)}
                  max={50}
                  step={5}
                />
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={() => handleSelectTheme('default')} className="flex-1">
            Reset to Default
          </Button>
          <Button onClick={() => setOpen(false)} className="flex-1">
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function getThemeBackgroundClass(theme: ThemeBackground): string {
  const classes: Record<ThemeBackground, string> = {
    'default': '',
    'soft-blue': 'bg-[#E8F4FD] dark:bg-slate-900',
    'mint-green': 'bg-[#E0F7E8] dark:bg-slate-900',
    'lavender': 'bg-[#F0E6FF] dark:bg-slate-900',
    'peach': 'bg-[#FFE5D9] dark:bg-slate-900',
    'dark-mode': 'bg-[#1A1A2E]',
    'gradient-sunset': 'bg-gradient-to-br from-orange-100 to-pink-100 dark:from-orange-950 dark:to-pink-950',
    'gradient-ocean': 'bg-gradient-to-br from-blue-100 to-teal-100 dark:from-blue-950 dark:to-teal-950',
    'gradient-forest': 'bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-950 dark:to-emerald-950',
    'gradient-galaxy': 'bg-gradient-to-br from-purple-100 to-slate-200 dark:from-purple-950 dark:to-slate-950',
    'gradient-aurora': 'bg-gradient-to-br from-cyan-100 to-purple-100 dark:from-cyan-950 dark:to-purple-950',
    'pattern-dots': 'bg-muted [background-image:radial-gradient(circle,_currentColor_1px,_transparent_1px)] [background-size:12px_12px]',
    'pattern-grid': 'bg-muted [background-image:linear-gradient(to_right,_rgba(0,0,0,0.05)_1px,_transparent_1px),_linear-gradient(to_bottom,_rgba(0,0,0,0.05)_1px,_transparent_1px)] [background-size:20px_20px]',
    'pattern-waves': 'bg-muted',
  }
  return classes[theme] || ''
}
