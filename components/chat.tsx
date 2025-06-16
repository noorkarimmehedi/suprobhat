'use client'

import { useAuth } from '@/hooks/use-auth'
import { Model } from '@/lib/types/models'
import { cn } from '@/lib/utils'
import { useChat } from '@ai-sdk/react'
import { ChatRequestOptions, JSONValue, Message } from 'ai'
import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { ChatMessages } from './chat-messages'
import { ChatPanel } from './chat-panel'

// Define section structure
interface ChatSection {
  id: string // User message ID
  userMessage: Message
  assistantMessages: Message[]
}

export function Chat({
  id,
  savedMessages = [],
  query,
  models
}: {
  id: string
  savedMessages?: Message[]
  query?: string
  models?: Model[]
}) {
  const [messages, setMessages] = useState<Message[]>(savedMessages)
  const [data, setData] = useState<JSONValue[]>()
  const [isAtBottom, setIsAtBottom] = useState(true)
  const [selectedModel, setSelectedModel] = useState<Model | undefined>(models?.[0])
  const [selectedProvider, setSelectedProvider] = useState<string>()
  const [isStreaming, setIsStreaming] = useState(false)
  const [isToolCalling, setIsToolCalling] = useState(false)
  const [isManualToolStream, setIsManualToolStream] = useState(false)
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const {
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    stop,
    append,
    reload,
    addToolResult
  } = useChat({
    id,
    initialMessages: savedMessages,
    onResponse: response => {
      if ('data' in response) {
        setData(response.data as JSONValue[])
      }
    },
    onFinish: () => {
      setIsStreaming(false)
      setIsToolCalling(false)
      setIsManualToolStream(false)
    },
    onError: error => {
      toast.error(error.message)
      setIsStreaming(false)
      setIsToolCalling(false)
      setIsManualToolStream(false)
    }
  })

  // Listen for new chat creation and reset state
  useEffect(() => {
    const handleNewChat = () => {
      setMessages([])
      setData(undefined)
      stop()
    }

    window.addEventListener('new-chat-created', handleNewChat)
    return () => {
      window.removeEventListener('new-chat-created', handleNewChat)
    }
  }, [setMessages, setData, stop])

  // Convert messages array to sections array
  const sections = useMemo<ChatSection[]>(() => {
    const result: ChatSection[] = []
    let currentSection: ChatSection | null = null

    for (const message of messages) {
      if (message.role === 'user') {
        // Start a new section when a user message is found
        if (currentSection) {
          result.push(currentSection)
        }
        currentSection = {
          id: message.id,
          userMessage: message,
          assistantMessages: []
        }
      } else if (currentSection && message.role === 'assistant') {
        // Add assistant message to the current section
        currentSection.assistantMessages.push(message)
      }
      // Ignore other role types like 'system' for now
    }

    // Add the last section if exists
    if (currentSection) {
      result.push(currentSection)
    }

    return result
  }, [messages])

  // Detect if scroll container is at the bottom
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      const threshold = 50 // threshold in pixels
      if (scrollHeight - scrollTop - clientHeight < threshold) {
        setIsAtBottom(true)
      } else {
        setIsAtBottom(false)
      }
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Set initial state

    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  // Scroll to the section when a new user message is sent
  useEffect(() => {
    if (sections.length > 0) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage && lastMessage.role === 'user') {
        // If the last message is from user, find the corresponding section
        const sectionId = lastMessage.id
        requestAnimationFrame(() => {
          const sectionElement = document.getElementById(`section-${sectionId}`)
          sectionElement?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        })
      }
    }
  }, [sections, messages])

  useEffect(() => {
    setMessages(savedMessages)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const onQuerySelect = (query: string) => {
    append({
      role: 'user',
      content: query
    })
  }

  const handleUpdateAndReloadMessage = async (
    messageId: string,
    newContent: string
  ) => {
    setMessages(currentMessages =>
      currentMessages.map(msg =>
        msg.id === messageId ? { ...msg, content: newContent } : msg
      )
    )

    try {
      const messageIndex = messages.findIndex(msg => msg.id === messageId)
      if (messageIndex === -1) return

      const messagesUpToEdited = messages.slice(0, messageIndex + 1)

      setMessages(messagesUpToEdited)

      setData(undefined)

      await reload({
        body: {
          chatId: id,
          regenerate: true
        }
      })
    } catch (error) {
      console.error('Failed to reload after message update:', error)
      toast.error(`Failed to reload conversation: ${(error as Error).message}`)
    }
  }

  const handleReloadFrom = async (
    messageId: string,
    options?: ChatRequestOptions
  ) => {
    const messageIndex = messages.findIndex(m => m.id === messageId)
    if (messageIndex !== -1) {
      const userMessageIndex = messages
        .slice(0, messageIndex)
        .findLastIndex(m => m.role === 'user')
      if (userMessageIndex !== -1) {
        const trimmedMessages = messages.slice(0, userMessageIndex + 1)
        setMessages(trimmedMessages)
        return await reload(options)
      }
    }
    return await reload(options)
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setData(undefined)
    handleSubmit(e)
  }

  return (
    <div
      className={cn(
        'relative flex h-full min-w-0 flex-1 flex-col',
        messages.length === 0 ? 'items-center justify-center' : ''
      )}
      data-testid="full-chat"
    >
      <ChatMessages
        sections={sections}
        data={data}
        onQuerySelect={onQuerySelect}
        isLoading={isLoading}
        chatId={id}
        addToolResult={addToolResult}
        scrollContainerRef={scrollContainerRef}
        onUpdateMessage={handleUpdateAndReloadMessage}
        reload={handleReloadFrom}
      />
      <ChatPanel
        id={id}
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={onSubmit}
        messages={messages}
        setMessages={setMessages}
        isLoading={isLoading}
        stop={stop}
        append={append}
        reload={handleReloadFrom}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        selectedProvider={selectedProvider}
        setSelectedProvider={setSelectedProvider}
        isStreaming={isStreaming}
        setIsStreaming={setIsStreaming}
        isToolCalling={isToolCalling}
        setIsToolCalling={setIsToolCalling}
        isManualToolStream={isManualToolStream}
        setIsManualToolStream={setIsManualToolStream}
        isAuthenticated={isAuthenticated}
        isAuthLoading={isAuthLoading}
        scrollContainerRef={scrollContainerRef}
      />
    </div>
  )
}
