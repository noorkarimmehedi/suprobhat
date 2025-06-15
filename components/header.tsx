'use client'

import { ChatHistoryPopover } from '@/components/chat-history-popover'
import GuestMenu from '@/components/guest-menu'
import UserMenu from '@/components/user-menu'
import { cn } from '@/lib/utils'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { Button } from './ui/button'

interface HeaderProps {
  user: any
}

export const Header: React.FC<HeaderProps> = ({ user }) => {
  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        'px-4 py-2'
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button asChild variant="ghost" size="icon" className="size-8 mr-2">
            <Link href="/" title="New Chat">
              <Plus className="size-5" />
              <span className="sr-only">New Chat</span>
            </Link>
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
