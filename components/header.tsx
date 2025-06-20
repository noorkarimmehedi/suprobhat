'use client'

import GuestMenu from '@/components/guest-menu'
import UserMenu from '@/components/user-menu'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { ChatHistoryPopover } from './chat-history-popover'
import styles from './ui/plus-button.module.css'

export const Header: React.FC = () => {
  const { user } = useAuth()
  const router = useRouter()

  // Prefetch routes for better navigation performance
  useEffect(() => {
    // Prefetch home route
    router.prefetch('/')
    
    // If user is logged in, prefetch chat routes
    if (user) {
      // Prefetch the first few chat routes
      const prefetchChatRoutes = async () => {
        try {
          const response = await fetch('/api/chats?offset=0&limit=5')
          if (!response.ok) return
          const data = await response.json()
          data.chats.forEach((chat: { id: string }) => {
            router.prefetch(`/search/${chat.id}`)
          })
        } catch (error) {
          console.error('Error prefetching chat routes:', error)
        }
      }
      prefetchChatRoutes()
    }
  }, [router, user])

  const handleNewChat = () => {
    // Clear any existing chat state from localStorage
    localStorage.removeItem('chat-state')
    
    // Dispatch event to notify chat components to reset
    window.dispatchEvent(new CustomEvent('new-chat-created'))
    
    // Navigate to home
    router.replace('/')
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        'px-3 sm:px-4 py-2'
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button 
            className={styles.plusButton}
            onClick={handleNewChat}
            title="New Chat"
            type="button"
            aria-label="New Chat"
          >
            <span className="sr-only">New Chat</span>
          </button>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {user && <ChatHistoryPopover />}
          {user ? <UserMenu user={user} /> : <GuestMenu />}
        </div>
      </div>
    </header>
  )
}

export default Header
