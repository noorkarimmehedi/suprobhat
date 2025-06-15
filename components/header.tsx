'use client'

import GuestMenu from '@/components/guest-menu'
import UserMenu from '@/components/user-menu'
import { cn } from '@/lib/utils'
import { History, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import chatHistoryStyles from './ui/chat-history-button.module.css'
import plusStyles from './ui/plus-button.module.css'

interface HeaderProps {
  user: any
}

export const Header: React.FC<HeaderProps> = ({ user }) => {
  const router = useRouter()

  // Prefetch the home route for instant navigation
  useEffect(() => {
    router.prefetch('/')
  }, [router])

  const handleNewChat = () => {
    // Clear any existing chat state from localStorage
    localStorage.removeItem('chat-state')
    
    // Dispatch event to notify chat components to reset
    window.dispatchEvent(new CustomEvent('new-chat-created'))
    
    // Update chat history
    window.dispatchEvent(new CustomEvent('chat-history-updated'))
    
    // Navigate to home
    router.replace('/')
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        'px-4 py-2'
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button 
            className={plusStyles.plusButton}
            onClick={handleNewChat}
            title="New Chat"
            type="button"
          >
            <Plus className={plusStyles.icon} />
            <span className="sr-only">New Chat</span>
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button
            className={chatHistoryStyles.chatHistoryButton}
            title="Chat History"
            type="button"
            onClick={() => {
              const event = new CustomEvent('toggle-chat-history')
              window.dispatchEvent(event)
            }}
          >
            <History className={chatHistoryStyles.icon} />
            <span className="sr-only">Chat History</span>
          </button>
          {user ? <UserMenu user={user} /> : <GuestMenu />}
        </div>
      </div>
    </header>
  )
}

export default Header
