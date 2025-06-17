import { useCurrentUserImage } from '@/hooks/use-current-user-image'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger
} from './ui/collapsible'
import { IconLogo } from './ui/icons'
import { Separator } from './ui/separator'

interface CollapsibleMessageProps {
  children: React.ReactNode
  role: 'user' | 'assistant'
  isCollapsible?: boolean
  isOpen?: boolean
  header?: React.ReactNode
  onOpenChange?: (open: boolean) => void
  showBorder?: boolean
  showIcon?: boolean
}

export function CollapsibleMessage({
  children,
  role,
  isCollapsible = false,
  isOpen = true,
  header,
  onOpenChange,
  showBorder = true,
  showIcon = true
}: CollapsibleMessageProps) {
  const content = <div className="flex-1">{children}</div>
  const userImage = useCurrentUserImage()

  // Determine alignment based on role
  const isUserMessage = role === 'user'
  const containerAlignment = isUserMessage ? 'justify-end' : 'justify-start'
  const contentAlignment = isUserMessage ? 'items-end' : 'items-start'

  return (
    <div className={cn('flex', containerAlignment)}>
      {showIcon && !isUserMessage && (
        <div className="relative flex flex-col items-center">
          <div className="w-5">
            <IconLogo className="size-5" />
          </div>
        </div>
      )}

      {isCollapsible ? (
        <div
          className={cn(
            'flex-1 rounded-2xl p-4',
            showBorder && 'border border-border/50',
            isUserMessage 
              ? 'max-w-[85%] sm:max-w-[80%] md:max-w-[75%]' 
              : 'max-w-[90%] sm:max-w-[85%] md:max-w-[80%]'
          )}
        >
          <Collapsible
            open={isOpen}
            onOpenChange={onOpenChange}
            className="w-full"
          >
            <div className="flex items-center justify-between w-full gap-2">
              {header && <div className="text-sm w-full">{header}</div>}
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className="rounded-md p-1 hover:bg-accent group"
                  aria-label={isOpen ? 'Collapse' : 'Expand'}
                >
                  <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="data-[state=closed]:animate-collapse-up data-[state=open]:animate-collapse-down">
              <Separator className="my-4 border-border/50" />
              {content}
            </CollapsibleContent>
          </Collapsible>
        </div>
      ) : (
        <div
          className={cn(
            'flex-1 rounded-2xl',
            role === 'assistant' ? 'px-0' : 'px-3',
            isUserMessage 
              ? 'max-w-[85%] sm:max-w-[80%] md:max-w-[75%]' 
              : 'max-w-[90%] sm:max-w-[85%] md:max-w-[80%]'
          )}
        >
          {content}
        </div>
      )}

      {showIcon && isUserMessage && (
        <div className="relative flex flex-col items-center ml-2">
          <div className="w-5">
            <Avatar className="size-5">
              <AvatarImage src={userImage || undefined} alt="User" />
              <AvatarFallback className="text-[10px]">U</AvatarFallback>
            </Avatar>
          </div>
        </div>
      )}
    </div>
  )
}
