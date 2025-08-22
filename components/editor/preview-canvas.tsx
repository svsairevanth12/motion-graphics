'use client'

import React, { forwardRef, useRef, useEffect, useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Grid3X3,
  Ruler,
  Move,
  MousePointer,
  Hand
} from 'lucide-react'
import { MotionProject } from '@/lib/motion-engine'
import { cn } from '@/lib/utils'

interface PreviewCanvasProps {
  project?: MotionProject | null
  currentFrame: number
  isPlaying: boolean
  zoom: number
  panOffset: { x: number; y: number }
  showGrid: boolean
  showGuides: boolean
  selectedElementId?: string | null
  onElementSelect: (elementId: string | null) => void
  onElementUpdate: (elementId: string, updates: any) => void
  onPlaybackChange: (playing: boolean) => void
  onFrameChange: (frame: number) => void
  onZoomChange: (zoom: number) => void
  onPanChange: (offset: { x: number; y: number }) => void
}

interface CanvasElement {
  id: string
  type: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  opacity: number
  visible: boolean
}

export const PreviewCanvas = forwardRef<HTMLDivElement, PreviewCanvasProps>(({
  project,
  currentFrame,
  isPlaying,
  zoom,
  panOffset,
  showGrid,
  showGuides,
  selectedElementId,
  onElementSelect,
  onElementUpdate,
  onPlaybackChange,
  onFrameChange,
  onZoomChange,
  onPanChange,
}, ref) => {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [tool, setTool] = useState<'select' | 'pan'>('select')
  const [canvasElements, setCanvasElements] = useState<CanvasElement[]>([])

  // Convert project elements to canvas elements
  useEffect(() => {
    if (!project) return

    const elements: CanvasElement[] = []
    
    project.scenes.forEach(scene => {
      if (currentFrame >= scene.startFrame && currentFrame <= scene.endFrame) {
        scene.elements.forEach(element => {
          if (currentFrame >= element.startFrame && currentFrame <= element.endFrame) {
            elements.push({
              id: element.id,
              type: element.type,
              x: element.properties.position.x,
              y: element.properties.position.y,
              width: element.properties.size.width,
              height: element.properties.size.height,
              rotation: element.properties.rotation.z,
              opacity: element.properties.opacity,
              visible: element.visible,
            })
          }
        })
      }
    })

    setCanvasElements(elements)
  }, [project, currentFrame])

  // Playback controls
  const handlePlayPause = () => {
    onPlaybackChange(!isPlaying)
  }

  const handleFrameBack = () => {
    onFrameChange(Math.max(0, currentFrame - 1))
  }

  const handleFrameForward = () => {
    onFrameChange(Math.min(project?.duration || 300, currentFrame + 1))
  }

  const handleReset = () => {
    onFrameChange(0)
    onPlaybackChange(false)
  }

  // Zoom controls
  const handleZoomIn = () => {
    onZoomChange(Math.min(5, zoom * 1.2))
  }

  const handleZoomOut = () => {
    onZoomChange(Math.max(0.1, zoom / 1.2))
  }

  const handleZoomReset = () => {
    onZoomChange(1)
    onPanChange({ x: 0, y: 0 })
  }

  // Mouse interactions
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = (e.clientX - rect.left - panOffset.x) / zoom
    const y = (e.clientY - rect.top - panOffset.y) / zoom

    if (tool === 'pan') {
      setIsDragging(true)
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y })
      return
    }

    // Check if clicking on an element
    const clickedElement = canvasElements
      .slice()
      .reverse() // Check top elements first
      .find(element => {
        return x >= element.x && 
               x <= element.x + element.width &&
               y >= element.y && 
               y <= element.y + element.height
      })

    if (clickedElement) {
      onElementSelect(clickedElement.id)
      setIsDragging(true)
      setDragStart({ x: x - clickedElement.x, y: y - clickedElement.y })
    } else {
      onElementSelect(null)
    }
  }, [tool, zoom, panOffset, canvasElements, onElementSelect])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return

    if (tool === 'pan') {
      const newPanOffset = {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      }
      onPanChange(newPanOffset)
      return
    }

    if (selectedElementId) {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return

      const x = (e.clientX - rect.left - panOffset.x) / zoom
      const y = (e.clientY - rect.top - panOffset.y) / zoom

      const newX = x - dragStart.x
      const newY = y - dragStart.y

      onElementUpdate(selectedElementId, {
        properties: {
          position: { x: newX, y: newY }
        }
      })
    }
  }, [isDragging, tool, selectedElementId, zoom, panOffset, dragStart, onPanChange, onElementUpdate])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Timeline scrubber
  const handleTimelineChange = (value: number[]) => {
    onFrameChange(value[0])
  }

  const formatTime = (frame: number) => {
    const fps = project?.fps || 30
    const seconds = frame / fps
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    const frames = frame % fps
    
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`
  }

  const canvasWidth = project?.width || 1920
  const canvasHeight = project?.height || 1080
  const totalFrames = project?.duration || 300

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Canvas Controls */}
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-2">
          {/* Playback Controls */}
          <div className="flex items-center gap-1 border rounded-md p-1">
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleFrameBack}>
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handlePlayPause}>
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleFrameForward}>
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          {/* Frame Counter */}
          <Badge variant="secondary">
            {formatTime(currentFrame)} / {formatTime(totalFrames)}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {/* Tools */}
          <div className="flex items-center gap-1 border rounded-md p-1">
            <Button 
              variant={tool === 'select' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setTool('select')}
            >
              <MousePointer className="h-4 w-4" />
            </Button>
            <Button 
              variant={tool === 'pan' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setTool('pan')}
            >
              <Hand className="h-4 w-4" />
            </Button>
          </div>

          {/* View Controls */}
          <div className="flex items-center gap-1 border rounded-md p-1">
            <Button variant="ghost" size="sm" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleZoomReset}>
              {Math.round(zoom * 100)}%
            </Button>
            <Button variant="ghost" size="sm" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>

          {/* Overlay Controls */}
          <div className="flex items-center gap-1 border rounded-md p-1">
            <Button 
              variant={showGrid ? 'default' : 'ghost'} 
              size="sm"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button 
              variant={showGuides ? 'default' : 'ghost'} 
              size="sm"
            >
              <Ruler className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 overflow-hidden relative bg-muted/20">
        <div
          ref={canvasRef}
          className="w-full h-full relative cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{
            cursor: tool === 'pan' ? 'grab' : isDragging ? 'grabbing' : 'default'
          }}
        >
          {/* Canvas Content */}
          <div
            className="absolute bg-white shadow-lg border"
            style={{
              width: canvasWidth * zoom,
              height: canvasHeight * zoom,
              left: '50%',
              top: '50%',
              transform: `translate(-50%, -50%) translate(${panOffset.x}px, ${panOffset.y}px)`,
            }}
          >
            {/* Grid Overlay */}
            {showGrid && (
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, #000 1px, transparent 1px),
                    linear-gradient(to bottom, #000 1px, transparent 1px)
                  `,
                  backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
                }}
              />
            )}

            {/* Canvas Elements */}
            {canvasElements.map((element) => (
              <div
                key={element.id}
                className={cn(
                  "absolute border-2 transition-colors",
                  selectedElementId === element.id 
                    ? "border-primary bg-primary/10" 
                    : "border-transparent hover:border-primary/50"
                )}
                style={{
                  left: element.x * zoom,
                  top: element.y * zoom,
                  width: element.width * zoom,
                  height: element.height * zoom,
                  transform: `rotate(${element.rotation}deg)`,
                  opacity: element.opacity,
                  display: element.visible ? 'block' : 'none',
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  onElementSelect(element.id)
                }}
              >
                {/* Element Content Preview */}
                <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 rounded flex items-center justify-center text-xs font-medium">
                  {element.type}
                </div>

                {/* Selection Handles */}
                {selectedElementId === element.id && (
                  <>
                    <div className="absolute -top-1 -left-1 w-2 h-2 bg-primary border border-white rounded-full" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary border border-white rounded-full" />
                    <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-primary border border-white rounded-full" />
                    <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-primary border border-white rounded-full" />
                  </>
                )}
              </div>
            ))}

            {/* Guides Overlay */}
            {showGuides && selectedElementId && (
              <div className="absolute inset-0 pointer-events-none">
                {/* Center guides */}
                <div 
                  className="absolute w-full border-t border-dashed border-primary/50"
                  style={{ top: '50%' }}
                />
                <div 
                  className="absolute h-full border-l border-dashed border-primary/50"
                  style={{ left: '50%' }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="p-4 border-t bg-card">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Timeline</span>
            <span>Frame {currentFrame} of {totalFrames}</span>
          </div>
          <Slider
            value={[currentFrame]}
            onValueChange={handleTimelineChange}
            max={totalFrames}
            min={0}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>00:00:00</span>
            <span>{formatTime(totalFrames)}</span>
          </div>
        </div>
      </div>
    </div>
  )
})

PreviewCanvas.displayName = 'PreviewCanvas'
