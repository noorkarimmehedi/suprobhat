'use client'

import { Input } from '@/components/ui/input'
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Spinner } from '@/components/ui/spinner'
import { Chat } from '@/lib/types'
import { cn } from '@/lib/utils'
import { History } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import styles from './ui/chat-history-button.module.css'

interface ChatHistoryPopoverProps {
  className?: string
}

export function ChatHistoryPopover({ className }: ChatHistoryPopoverProps) {
  const [chats, setChats] = useState<Chat[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const fetchChats = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/chats?offset=0&limit=50`)
      if (!response.ok) {
        throw new Error('Failed to fetch chat history')
      }
      const { chats: newChats } = await response.json()
      setChats(newChats)
    } catch (error) {
      console.error('Failed to load chats:', error)
      toast.error('Failed to load chat history')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchChats()
    }
  }, [isOpen])

  useEffect(() => {
    const handleHistoryUpdate = () => {
      if (isOpen) {
        fetchChats()
      }
    }
    window.addEventListener('chat-history-updated', handleHistoryUpdate)
    return () => {
      window.removeEventListener('chat-history-updated', handleHistoryUpdate)
    }
  }, [isOpen])

  useEffect(() => {
    const handleToggle = () => {
      setIsOpen(prev => !prev)
    }
    window.addEventListener('toggle-chat-history', handleToggle)
    return () => {
      window.removeEventListener('toggle-chat-history', handleToggle)
    }
  }, [])

  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatDate = (date: Date | string) => {
    const d = new Date(date)
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(styles.chatHistoryButton, className)}
          title="Chat History"
          type="button"
        >
          <History className={styles.icon} />
          <span className="sr-only">Chat History</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 p-0"
        align="end"
        side="bottom"
        sideOffset={8}
      >
        <div className="flex flex-col h-[400px]">
          <div className="p-3 border-b">
            <Input
              placeholder="Search chats..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="h-8"
            />
          </div>
          <ScrollArea className="flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <Spinner />
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                {searchQuery ? 'No chats found' : 'No chat history'}
              </div>
            ) : (
              <div className="p-2">
                {filteredChats.map(chat => (
                  <button
                    key={chat.id}
                    onClick={() => {
                      router.push(chat.path)
                      setIsOpen(false)
                    }}
                    className="w-full text-left px-2 py-1.5 rounded-md text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <div className="font-medium truncate">{chat.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(chat.createdAt)}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  )
} 