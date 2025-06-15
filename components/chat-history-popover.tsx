'use client'

import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from '@/components/ui/popover'
import { Chat } from '@/lib/types'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { ChatHistorySection } from './sidebar/chat-history-section'
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
        <button className={styles.chatHistoryButton} aria-label="Chat history">
          <span className="sr-only">Chat history</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <ChatHistorySection />
      </PopoverContent>
    </Popover>
  )
} 