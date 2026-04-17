'use client'

import { useState } from 'react'
import {
  Copy,
  Check,
  Link2,
  Lock,
  Globe,
  Eye,
  Clock,
  MessageSquare,
  Download,
  QrCode,
  X,
  Share2,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useChat } from '@/lib/chat-context'
import type { ShareSettings } from '@/lib/types'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ShareModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  chatId: string
}

export function ShareModal({ open, onOpenChange, chatId }: ShareModalProps) {
  const { currentChat, shareChat, revokeShare } = useChat()
  const [visibility, setVisibility] = useState<'public' | 'unlisted' | 'password'>('unlisted')
  const [password, setPassword] = useState('')
  const [expiration, setExpiration] = useState<'1hour' | '1day' | '7days' | 'never'>('7days')
  const [allowComments, setAllowComments] = useState(false)
  const [allowExport, setAllowExport] = useState(true)
  const [copied, setCopied] = useState(false)
  const [showQR, setShowQR] = useState(false)

  const isShared = currentChat?.isShared
  const shareUrl = currentChat?.shareSettings?.shareUrl || ''

  const handleGenerateLink = () => {
    const settings: ShareSettings = {
      visibility,
      password: visibility === 'password' ? password : undefined,
      expiration,
      allowComments,
      allowExport,
      viewCount: 0,
    }
    const url = shareChat(chatId, settings)
    toast.success('Share link generated!')
    return url
  }

  const handleCopyLink = () => {
    const url = isShared ? shareUrl : handleGenerateLink()
    navigator.clipboard.writeText(url)
    setCopied(true)
    toast.success('Link copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRevokeLink = () => {
    revokeShare(chatId)
    toast.success('Share link revoked')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="size-5" />
            Share Chat
          </DialogTitle>
          <DialogDescription>
            Generate a public link to share this chat with others
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Link Display */}
          {isShared && (
            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Link2 className="size-4 text-primary" />
                Share Link Active
              </div>
              <div className="flex gap-2">
                <Input
                  value={shareUrl}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyLink}
                >
                  {copied ? (
                    <Check className="size-4 text-green-500" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowQR(!showQR)}
                >
                  <QrCode className="size-4" />
                </Button>
              </div>
              
              {showQR && (
                <div className="mt-4 flex justify-center rounded-lg bg-white p-4">
                  <div className="flex size-32 items-center justify-center rounded border-2 border-dashed border-muted-foreground/30">
                    <span className="text-xs text-muted-foreground">QR Code</span>
                  </div>
                </div>
              )}
              
              <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="size-3" />
                  {currentChat?.shareSettings?.viewCount || 0} views
                </span>
                <span className="flex items-center gap-1">
                  <Users className="size-3" />
                  {visibility === 'public' ? 'Public' : visibility === 'unlisted' ? 'Unlisted' : 'Password Protected'}
                </span>
              </div>
            </div>
          )}

          {/* Privacy Settings */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Privacy</Label>
              <Select
                value={visibility}
                onValueChange={(value: 'public' | 'unlisted' | 'password') => setVisibility(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">
                    <div className="flex items-center gap-2">
                      <Globe className="size-4" />
                      <span>Public - Anyone with link can view</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="unlisted">
                    <div className="flex items-center gap-2">
                      <Eye className="size-4" />
                      <span>Unlisted - Only people with exact link</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="password">
                    <div className="flex items-center gap-2">
                      <Lock className="size-4" />
                      <span>Password Protected</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {visibility === 'password' && (
              <div className="space-y-2">
                <Label htmlFor="share-password">Password</Label>
                <Input
                  id="share-password"
                  type="password"
                  placeholder="Enter a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Expiration</Label>
              <Select
                value={expiration}
                onValueChange={(value: '1hour' | '1day' | '7days' | 'never') => setExpiration(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1hour">
                    <div className="flex items-center gap-2">
                      <Clock className="size-4" />
                      <span>1 Hour</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="1day">
                    <div className="flex items-center gap-2">
                      <Clock className="size-4" />
                      <span>1 Day</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="7days">
                    <div className="flex items-center gap-2">
                      <Clock className="size-4" />
                      <span>7 Days</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="never">
                    <div className="flex items-center gap-2">
                      <Clock className="size-4" />
                      <span>Never</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Permissions */}
          <div className="space-y-4">
            <Label>Permissions</Label>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="size-4 text-muted-foreground" />
                  <span className="text-sm">Allow comments</span>
                </div>
                <Switch
                  checked={allowComments}
                  onCheckedChange={setAllowComments}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <Download className="size-4 text-muted-foreground" />
                  <span className="text-sm">Allow export as PDF</span>
                </div>
                <Switch
                  checked={allowExport}
                  onCheckedChange={setAllowExport}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {isShared ? (
              <>
                <Button onClick={handleCopyLink} className="flex-1">
                  {copied ? (
                    <>
                      <Check className="mr-2 size-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 size-4" />
                      Copy Link
                    </>
                  )}
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleRevokeLink}
                >
                  <X className="mr-2 size-4" />
                  Revoke
                </Button>
              </>
            ) : (
              <Button onClick={handleGenerateLink} className="w-full">
                <Link2 className="mr-2 size-4" />
                Generate Public Link
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
