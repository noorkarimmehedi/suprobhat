'use client'

import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ShineButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: LucideIcon
  iconUrl?: string
  children: React.ReactNode
  variant?: 'default' | 'outline'
}

export const ShineButton = forwardRef<HTMLButtonElement, ShineButtonProps>(
  ({ className, icon: Icon, iconUrl, children, variant = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'flex overflow-hidden items-center text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-2 py-2 whitespace-pre md:flex group relative justify-center gap-2 rounded-md transition-all duration-300 ease-out',
          variant === 'default' 
            ? 'bg-black text-white shadow hover:bg-black/90 hover:ring-2 hover:ring-black hover:ring-offset-2'
            : 'bg-transparent border border-input text-foreground hover:bg-accent hover:text-accent-foreground',
          className
        )}
        {...props}
      >
        <span
          className="absolute right-0 -mt-12 h-32 w-8 translate-x-12 rotate-12 bg-white opacity-10 transition-all duration-1000 ease-out group-hover:-translate-x-40"
        />
        <div className="flex items-center">
          {Icon && <Icon className="w-4 h-4" />}
          {iconUrl && (
            <img 
              src={iconUrl}
              alt="Button icon"
              className={cn(
                'w-4 h-4',
                variant === 'default' ? 'brightness-0 invert' : ''
              )}
            />
          )}
          <span className={cn('ml-1', variant === 'default' ? 'text-white' : '')}>
            {children}
          </span>
        </div>
      </button>
    )
  }
)

ShineButton.displayName = 'ShineButton' 