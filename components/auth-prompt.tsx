'use client'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface AuthPromptProps {
  children: React.ReactNode
  trigger: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function AuthPrompt({ children, trigger, open, onOpenChange }: AuthPromptProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const router = useRouter()

  const handleSignIn = () => {
    if (onOpenChange) {
      onOpenChange(false)
    } else {
      setInternalOpen(false)
    }
    router.push('/auth/login')
  }

  const isControlled = open !== undefined && onOpenChange !== undefined
  const isOpen = isControlled ? open : internalOpen
  const setIsOpen = isControlled ? onOpenChange : setInternalOpen

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sign In Required</DialogTitle>
          <DialogDescription>
            Please sign in to use this feature. This helps us provide a better experience and maintain service quality.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <Button onClick={handleSignIn} className="w-full">
            Sign In
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            Don&apos;t have an account?{' '}
            <Button
              variant="link"
              className="p-0 h-auto font-normal"
              onClick={() => {
                if (onOpenChange) {
                  onOpenChange(false)
                } else {
                  setInternalOpen(false)
                }
                router.push('/auth/sign-up')
              }}
            >
              Sign up
            </Button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
} 