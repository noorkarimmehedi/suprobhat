'use client'

import { ChatHistoryPopover } from '@/components/chat-history-popover'
import GuestMenu from '@/components/guest-menu'
import UserMenu from '@/components/user-menu'
import { cn } from '@/lib/utils'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from './ui/button'

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
          <Button 
            variant="ghost" 
            size="icon" 
            className="size-8 mr-2 hover:bg-accent hover:text-accent-foreground transition-colors"
            onClick={handleNewChat}
            title="New Chat"
          >
            <Plus className="size-5" />
            <span className="sr-only">New Chat</span>
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <ChatHistoryPopover />
          {user ? <UserMenu user={user} /> : <GuestMenu />}
        </div>
      </div>
    </header>
  )
}

export default Header
