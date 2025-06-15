'use client'

import { ChatHistoryPopover } from '@/components/chat-history-popover'
import GuestMenu from '@/components/guest-menu'
import UserMenu from '@/components/user-menu'
import { cn } from '@/lib/utils'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { Button } from './ui/button'

interface HeaderProps {
  user: any
}

export const Header: React.FC<HeaderProps> = ({ user }) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleNewChat = () => {
    startTransition(() => {
      router.push('/')
    })
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        'px-4 py-2'
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn(
              "size-8 mr-2",
              isPending && "opacity-50"
            )}
            onClick={handleNewChat}
            disabled={isPending}
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
