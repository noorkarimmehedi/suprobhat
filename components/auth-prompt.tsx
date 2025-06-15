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
}

export function AuthPrompt({ children, trigger }: AuthPromptProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handleSignIn = () => {
    setOpen(false)
    router.push('/auth/login')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
                setOpen(false)
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