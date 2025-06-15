'use client'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Search, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from './ui/button'
import styles from './ui/chat-history-button.module.css'
import { Input } from './ui/input'

interface Chat {
  id: string
  title: string
  createdAt: string
}

export function ChatHistoryPopover() {
  const [isOpen, setIsOpen] = useState(false)
  const [chats, setChats] = useState<Chat[]>([])
  const [filteredChats, setFilteredChats] = useState<Chat[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const fetchChats = async () => {
    try {
      const response = await fetch('/api/chats?offset=0&limit=50')
      if (!response.ok) throw new Error('Failed to fetch chats')
      const data = await response.json()
      setChats(data.chats)
      setFilteredChats(data.chats)
    } catch (error) {
      console.error('Error fetching chats:', error)
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
    const filtered = chats.filter(chat =>
      chat.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredChats(filtered)
  }, [chats, searchQuery])

  const handleDelete = async (chatId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    try {
      const response = await fetch(`/api/chat/${chatId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Failed to delete chat')
      
      setChats(prevChats => prevChats.filter(chat => chat.id !== chatId))
      toast.success('Chat deleted')
    } catch (error) {
      console.error('Error deleting chat:', error)
      toast.error('Failed to delete chat')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === now.toDateString()) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    } else {
      return date.toLocaleDateString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button 
          className={styles.chatHistoryButton} 
          aria-label="Chat history"
          type="button"
        >
          <span className="sr-only">Chat history</span>
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0" 
        align="end"
        side="bottom"
        sideOffset={8}
      >
        <div className="flex flex-col h-[400px]">
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search chats..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground">Loading...</div>
            ) : filteredChats.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                {searchQuery ? 'No matching chats found' : 'No chat history'}
              </div>
            ) : (
              <ul className="divide-y">
                {filteredChats.map(chat => (
                  <li key={chat.id} className="group">
                    <button
                      onClick={() => {
                        router.push(`/chat/${chat.id}`)
                        setIsOpen(false)
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{chat.title}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {formatDate(chat.createdAt)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100"
                          onClick={e => handleDelete(chat.id, e)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
} 