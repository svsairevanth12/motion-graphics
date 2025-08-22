'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface ResizablePanelGroupProps {
  direction: 'horizontal' | 'vertical'
  className?: string
  children: React.ReactNode
}

interface ResizablePanelProps {
  defaultSize?: number
  minSize?: number
  maxSize?: number
  className?: string
  children: React.ReactNode
}

interface ResizableHandleProps {
  className?: string
  withHandle?: boolean
}

const ResizablePanelGroupContext = React.createContext<{
  direction: 'horizontal' | 'vertical'
  panels: Array<{ id: string; size: number; minSize: number; maxSize: number }>
  updatePanelSize: (id: string, size: number) => void
} | null>(null)

export function ResizablePanelGroup({ 
  direction, 
  className, 
  children 
}: ResizablePanelGroupProps) {
  const [panels, setPanels] = React.useState<Array<{ 
    id: string
    size: number
    minSize: number
    maxSize: number 
  }>>([])

  const updatePanelSize = React.useCallback((id: string, size: number) => {
    setPanels(prev => prev.map(panel => 
      panel.id === id ? { ...panel, size } : panel
    ))
  }, [])

  const contextValue = React.useMemo(() => ({
    direction,
    panels,
    updatePanelSize
  }), [direction, panels, updatePanelSize])

  return (
    <ResizablePanelGroupContext.Provider value={contextValue}>
      <div 
        className={cn(
          'flex h-full w-full',
          direction === 'horizontal' ? 'flex-row' : 'flex-col',
          className
        )}
      >
        {children}
      </div>
    </ResizablePanelGroupContext.Provider>
  )
}

export function ResizablePanel({ 
  defaultSize = 50, 
  minSize = 10, 
  maxSize = 90, 
  className, 
  children 
}: ResizablePanelProps) {
  const context = React.useContext(ResizablePanelGroupContext)
  const id = React.useId()
  const [size, setSize] = React.useState(defaultSize)

  React.useEffect(() => {
    if (context) {
      context.updatePanelSize(id, size)
    }
  }, [context, id, size])

  const style = React.useMemo(() => {
    if (context?.direction === 'horizontal') {
      return { width: `${size}%`, minWidth: `${minSize}%`, maxWidth: `${maxSize}%` }
    } else {
      return { height: `${size}%`, minHeight: `${minSize}%`, maxHeight: `${maxSize}%` }
    }
  }, [context?.direction, size, minSize, maxSize])

  return (
    <div 
      className={cn('flex-shrink-0', className)}
      style={style}
    >
      {children}
    </div>
  )
}

export function ResizableHandle({ className, withHandle = true }: ResizableHandleProps) {
  const context = React.useContext(ResizablePanelGroupContext)
  const [isDragging, setIsDragging] = React.useState(false)

  const handleMouseDown = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)

    const handleMouseMove = (e: MouseEvent) => {
      // Resizing logic would go here
      // This is a simplified implementation
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [])

  const isHorizontal = context?.direction === 'horizontal'

  return (
    <div
      className={cn(
        'relative flex items-center justify-center bg-border transition-colors hover:bg-border/80',
        isHorizontal ? 'w-1 cursor-col-resize' : 'h-1 cursor-row-resize',
        isDragging && 'bg-primary',
        className
      )}
      onMouseDown={handleMouseDown}
    >
      {withHandle && (
        <div
          className={cn(
            'absolute bg-border rounded-sm transition-colors hover:bg-border/80',
            isHorizontal 
              ? 'h-6 w-1' 
              : 'w-6 h-1'
          )}
        />
      )}
    </div>
  )
}
