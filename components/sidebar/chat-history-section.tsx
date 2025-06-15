'use client'

import { useEffect, useState } from 'react'
import { ChatHistoryClient } from './chat-history-client'

export function ChatHistorySection() {
  const [enableSaveChatHistory, setEnableSaveChatHistory] = useState(false)

  useEffect(() => {
    setEnableSaveChatHistory(process.env.NEXT_PUBLIC_ENABLE_SAVE_CHAT_HISTORY === 'true')
  }, [])

  if (!enableSaveChatHistory) {
    return null
  }

  return <ChatHistoryClient />
}
