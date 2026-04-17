'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/header'
import { ChatSidebar } from '@/components/chat-sidebar'
import { ChatInterface } from '@/components/chat-interface'
import { SourcePanel } from '@/components/source-panel'
import { ExportMenu } from '@/components/output-components'
import { ChatProvider, useChat } from '@/lib/chat-context'
import { AuthProvider } from '@/lib/auth-context'
import { getThemeBackgroundClass } from '@/components/theme-selector'
import { cn } from '@/lib/utils'

function DashboardContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showSources, setShowSources] = useState(true)
  const { sidebarCollapsed, themeBackground } = useChat()

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (!mobile) {
        setSidebarOpen(true)
        setShowSources(true)
      } else {
        setSidebarOpen(false)
        setShowSources(false)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Handle swipe gesture for mobile sidebar
  useEffect(() => {
    if (!isMobile) return

    let touchStartX = 0
    let touchEndX = 0

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.changedTouches[0].screenX
    }

    const handleTouchEnd = (e: TouchEvent) => {
      touchEndX = e.changedTouches[0].screenX
      const swipeDistance = touchEndX - touchStartX

      // Swipe right from left edge to open
      if (touchStartX < 50 && swipeDistance > 100) {
        setSidebarOpen(true)
      }
      // Swipe left to close
      if (sidebarOpen && swipeDistance < -100) {
        setSidebarOpen(false)
      }
    }

    document.addEventListener('touchstart', handleTouchStart)
    document.addEventListener('touchend', handleTouchEnd)

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isMobile, sidebarOpen])

  return (
    <div className={cn(
      'flex h-screen flex-col overflow-hidden transition-colors duration-300',
      getThemeBackgroundClass(themeBackground) || 'bg-background'
    )}>
      <Header
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        isMobile={isMobile}
      />

      <div className="flex flex-1 overflow-hidden">
        <ChatSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isMobile={isMobile}
        />

        <main className={cn(
          'flex flex-1 flex-col overflow-hidden transition-all duration-300 lg:flex-row',
          !isMobile && sidebarCollapsed && 'lg:ml-0'
        )}>
          {/* Chat area */}
          <div className="relative flex flex-1 flex-col overflow-hidden">
            <ChatInterface />
          </div>

          {/* Source panel - desktop */}
          <div
            className={cn(
              'hidden w-80 shrink-0 border-l p-4 transition-all duration-300 lg:block',
              !showSources && 'lg:hidden'
            )}
          >
            <SourcePanel />
            <div className="mt-4">
              <p className="mb-2 text-sm font-medium text-muted-foreground">
                Export Options
              </p>
              <ExportMenu />
            </div>
          </div>

          {/* Source panel toggle - mobile */}
          {isMobile && (
            <div className="shrink-0 border-t p-4">
              <button
                className="w-full rounded-lg border bg-card p-3 text-center text-sm font-medium transition-all hover:bg-accent"
                onClick={() => setShowSources(!showSources)}
              >
                {showSources ? 'Hide Sources' : 'Show Sources'}
              </button>
              {showSources && (
                <div className="mt-4 space-y-4">
                  <SourcePanel />
                  <div>
                    <p className="mb-2 text-sm font-medium text-muted-foreground">
                      Export Options
                    </p>
                    <ExportMenu />
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export function Dashboard() {
  return (
    <AuthProvider>
      <ChatProvider>
        <DashboardContent />
      </ChatProvider>
    </AuthProvider>
  )
}
