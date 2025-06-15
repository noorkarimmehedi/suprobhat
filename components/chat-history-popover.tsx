'use client'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useState } from 'react'
import { ChatHistorySection } from './sidebar/chat-history-section'
import styles from './ui/chat-history-button.module.css'

export function ChatHistoryPopover() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button 
          className={styles.chatHistoryButton} 
          aria-label="Chat history"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="sr-only">Chat history</span>
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0" 
        align="end"
        side="bottom"
        sideOffset={8}
        onInteractOutside={() => setIsOpen(false)}
      >
        <div className="flex flex-col h-[400px]">
          <ChatHistorySection />
        </div>
      </PopoverContent>
    </Popover>
  )
} 