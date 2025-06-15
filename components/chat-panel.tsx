'use client'

import { useAuth } from '@/hooks/use-auth'
import { Model } from '@/lib/types/models'
import { cn } from '@/lib/utils'
import { Message } from 'ai'
import { ArrowUp, ChevronDown, MessageCirclePlus, Square } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import Textarea from 'react-textarea-autosize'
import { useArtifact } from './artifact/artifact-context'
import { AuthPrompt } from './auth-prompt'
import { EmptyScreen } from './empty-screen'
import { ModelSelector } from './model-selector'
import { SearchModeToggle } from './search-mode-toggle'
import { Button } from './ui/button'
import { TextHoverEffect } from './ui/hover-text-effect'

interface ChatPanelProps {
  input: string
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isLoading: boolean
  messages: Message[]
  setMessages: (messages: Message[]) => void
  query?: string
  stop: () => void
  append: (message: any) => void
  models?: Model[]
  /** Whether to show the scroll to bottom button */
  showScrollToBottomButton: boolean
  /** Reference to the scroll container */
  scrollContainerRef: React.RefObject<HTMLDivElement>
}

export function ChatPanel({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  messages,
  setMessages,
  query,
  stop,
  append,
  models,
  showScrollToBottomButton,
  scrollContainerRef
}: ChatPanelProps) {
  const [showEmptyScreen, setShowEmptyScreen] = useState(false)
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const router = useRouter()
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const isFirstRender = useRef(true)
  const [isComposing, setIsComposing] = useState(false) // Composition state
  const [enterDisabled, setEnterDisabled] = useState(false) // Disable Enter after composition ends
  const { close: closeArtifact } = useArtifact()

  const handleCompositionStart = () => setIsComposing(true)

  const handleCompositionEnd = () => {
    setIsComposing(false)
    setEnterDisabled(true)
    setTimeout(() => {
      setEnterDisabled(false)
    }, 300)
  }

  const handleNewChat = () => {
    setMessages([])
    closeArtifact()
    router.push('/')
  }

  const isToolInvocationInProgress = () => {
    if (!messages.length) return false

    const lastMessage = messages[messages.length - 1]
    if (lastMessage.role !== 'assistant' || !lastMessage.parts) return false

    const parts = lastMessage.parts
    const lastPart = parts[parts.length - 1]

    return (
      lastPart?.type === 'tool-invocation' &&
      lastPart?.toolInvocation?.state === 'call'
    )
  }

  // if query is not empty, submit the query
  useEffect(() => {
    if (isFirstRender.current && query && query.trim().length > 0) {
      append({
        role: 'user',
        content: query
      })
      isFirstRender.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  // Scroll to the bottom of the container
  const handleScrollToBottom = () => {
    const scrollContainer = scrollContainerRef.current
    if (scrollContainer) {
      scrollContainer.scrollTo({
        top: scrollContainer.scrollHeight,
        behavior: 'smooth'
      })
    }
  }

  const renderInput = () => (
    <Textarea
      ref={inputRef}
      name="input"
      rows={2}
      maxRows={5}
      tabIndex={0}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
      placeholder="Ask a question..."
      spellCheck={false}
      value={input}
      disabled={isLoading || isToolInvocationInProgress()}
      className="resize-none w-full min-h-12 bg-transparent border-0 p-4 text-sm placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      onChange={e => {
        handleInputChange(e)
        setShowEmptyScreen(e.target.value.length === 0)
      }}
      onKeyDown={e => {
        if (
          e.key === 'Enter' &&
          !e.shiftKey &&
          !isComposing &&
          !enterDisabled
        ) {
          if (input.trim().length === 0) {
            e.preventDefault()
            return
          }
          e.preventDefault()
          const textarea = e.target as HTMLTextAreaElement
          textarea.form?.requestSubmit()
        }
      }}
      onFocus={() => setShowEmptyScreen(true)}
      onBlur={() => setShowEmptyScreen(false)}
    />
  )

  const renderModelSelector = () => (
    <div className="flex items-center gap-2">
      <ModelSelector models={models || []} />
      <SearchModeToggle />
    </div>
  )

  if (isAuthLoading) {
    return null // or a loading spinner if you prefer
  }

  return (
    <div
      className={cn(
        'w-full bg-background group/form-container shrink-0',
        messages.length > 0 ? 'sticky bottom-0 px-2 pb-4' : 'px-6'
      )}
    >
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 max-w-3xl w-full mx-auto gap-2">
          <div className="max-w-3xl w-full h-[250px]">
            <TextHoverEffect
              text="Arc Lab"
              duration={0.5}
            />
          </div>
          <form
            onSubmit={handleSubmit}
            className={cn('max-w-3xl w-full mx-auto relative')}
          >
            <div className="relative flex flex-col w-full gap-2 bg-muted rounded-3xl border border-input">
              {isAuthenticated ? (
                renderInput()
              ) : (
                <AuthPrompt trigger={renderInput()}>
                  <div className="p-4 text-sm text-muted-foreground">
                    Sign in to start chatting
                  </div>
                </AuthPrompt>
              )}
              <div className="flex items-center justify-between p-3">
                {isAuthenticated ? (
                  renderModelSelector()
                ) : (
                  <AuthPrompt trigger={renderModelSelector()}>
                    <div className="text-sm text-muted-foreground">
                      Sign in to select a model
                    </div>
                  </AuthPrompt>
                )}
                <div className="flex items-center gap-2">
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!isAuthenticated || isLoading || input.trim().length === 0 || isToolInvocationInProgress()}
                    className="shrink-0 rounded-full"
                  >
                    <ArrowUp className="size-4" />
                  </Button>
                  {isLoading && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={stop}
                      className="shrink-0 rounded-full"
                    >
                      <Square className="size-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className={cn('max-w-3xl w-full mx-auto relative')}
        >
          {/* Scroll to bottom button - only shown when showScrollToBottomButton is true */}
          {showScrollToBottomButton && messages.length > 0 && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="absolute -top-10 right-4 z-20 size-8 rounded-full shadow-md"
              onClick={handleScrollToBottom}
              title="Scroll to bottom"
            >
              <ChevronDown size={16} />
            </Button>
          )}

          <div className="relative flex flex-col w-full gap-2 bg-muted rounded-3xl border border-input">
            {isAuthenticated ? (
              renderInput()
            ) : (
              <AuthPrompt trigger={renderInput()}>
                <div className="p-4 text-sm text-muted-foreground">
                  Sign in to continue chatting
                </div>
              </AuthPrompt>
            )}

            {/* Bottom menu area */}
            <div className="flex items-center justify-between p-3">
              {isAuthenticated ? (
                renderModelSelector()
              ) : (
                <AuthPrompt trigger={renderModelSelector()}>
                  <div className="text-sm text-muted-foreground">
                    Sign in to select a model
                  </div>
                </AuthPrompt>
              )}
              <div className="flex items-center gap-2">
                {messages.length > 0 && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleNewChat}
                    className="shrink-0 rounded-full group"
                    type="button"
                    disabled={isLoading || isToolInvocationInProgress()}
                  >
                    <MessageCirclePlus className="size-4 group-hover:rotate-12 transition-all" />
                  </Button>
                )}
                <Button
                  type={isLoading ? 'button' : 'submit'}
                  size={'icon'}
                  variant={'outline'}
                  className={cn(isLoading && 'animate-pulse', 'rounded-full')}
                  disabled={
                    !isAuthenticated ||
                    (input.length === 0 && !isLoading) ||
                    isToolInvocationInProgress()
                  }
                  onClick={isLoading ? stop : undefined}
                >
                  {isLoading ? <Square size={20} /> : <ArrowUp size={20} />}
                </Button>
              </div>
            </div>
          </div>

          {messages.length === 0 && (
            <EmptyScreen
              submitMessage={message => {
                handleInputChange({
                  target: { value: message }
                } as React.ChangeEvent<HTMLTextAreaElement>)
              }}
              className={cn(showEmptyScreen ? 'visible' : 'invisible')}
            />
          )}
        </form>
      )}
    </div>
  )
}
