'use client'

import { ChatHistoryPopover } from '@/components/chat-history-popover'
import GuestMenu from '@/components/guest-menu'
import styles from '@/components/ui/plus-button.module.css'
import UserMenu from '@/components/user-menu'
import { User } from '@supabase/supabase-js'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

interface HeaderProps {
  user?: User
}

export function Header({ user }: HeaderProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleNewChat = () => {
    // Clear any existing chat state from localStorage
    localStorage.removeItem('chat-state')
    
    // Dispatch event to notify chat components to reset
    window.dispatchEvent(new CustomEvent('new-chat-created'))
    
    // Update chat history
    window.dispatchEvent(new CustomEvent('chat-history-updated'))
    
    startTransition(() => {
      router.push('/')
    })
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <button
            onClick={handleNewChat}
            className={styles.plusButton}
            disabled={isPending}
            aria-label="New Chat"
          >
            <Plus className={styles.icon} />
          </button>
          <div className="ml-2">
            <ChatHistoryPopover />
          </div>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <div className="flex items-center gap-4">
              {user ? <UserMenu user={user} /> : <GuestMenu />}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
