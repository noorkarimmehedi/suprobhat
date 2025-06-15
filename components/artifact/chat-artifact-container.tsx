'use client'

import { InspectorDrawer } from '@/components/inspector/inspector-drawer'
import { InspectorPanel } from '@/components/inspector/inspector-panel'
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup
} from '@/components/ui/resizable'
import { useSidebar } from '@/components/ui/sidebar'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'
import React, { useEffect, useState } from 'react'
import { useArtifact } from './artifact-context'

interface ChatArtifactContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function ChatArtifactContainer({
  children,
  className,
  ...props
}: ChatArtifactContainerProps) {
  const { state } = useArtifact()
  const isMobile = useIsMobile()
  const [renderPanel, setRenderPanel] = useState(state.isOpen)
  const { open, openMobile, isMobile: isMobileSidebar } = useSidebar()

  useEffect(() => {
    if (state.isOpen) {
      setRenderPanel(true)
    } else {
      setRenderPanel(false)
    }
  }, [state.isOpen])

  return (
    <div
      className={cn(
        'relative flex h-full w-full flex-col overflow-hidden',
        className
      )}
      {...props}
    >
      {/* Desktop: Resizable panels (Do not render on mobile) */}
      {!isMobile && (
        <ResizablePanelGroup
          direction="horizontal"
          className="flex flex-1 min-w-0 h-full" // Responsive classes removed
        >
          <ResizablePanel
            className={cn(
              'min-w-0',
              state.isOpen && 'transition-[flex-basis] duration-200 ease-out'
            )}
          >
            {children}
          </ResizablePanel>

          {renderPanel && (
            <>
              <ResizableHandle />
              <ResizablePanel
                className={cn('overflow-hidden', {
                  'animate-slide-in-right': state.isOpen
                })}
                maxSize={50}
                minSize={30}
                defaultSize={40}
              >
                <InspectorPanel />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      )}

      {/* Mobile: full-width chat + drawer (Do not render on desktop) */}
      {isMobile && (
        <div className="flex-1 h-full">
          {' '}
          {/* Responsive classes removed */}
          {children}
          {/* ArtifactDrawer checks isMobile internally, no double check needed */}
          <InspectorDrawer />
        </div>
      )}
    </div>
  )
}
