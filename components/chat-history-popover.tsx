'use client'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ChatHistorySection } from './sidebar/chat-history-section'
import styles from './ui/chat-history-button.module.css'

export function ChatHistoryPopover() {
  return (
    <Popover>
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
          <ChatHistorySection />
        </div>
      </PopoverContent>
    </Popover>
  )
} 