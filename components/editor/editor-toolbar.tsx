'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  RotateCcw,
  Save,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Grid3X3,
  Ruler,
  Settings,
  Share,
  Download,
  FileText,
  Folder,
  HelpCircle
} from 'lucide-react'

interface EditorToolbarProps {
  isPlaying: boolean
  currentFrame: number
  totalFrames: number
  zoom: number
  showGrid: boolean
  showGuides: boolean
  onPlaybackChange: (playing: boolean) => void
  onFrameChange: (frame: number) => void
  onZoomChange: (zoom: number) => void
  onSave: () => void
  onUndo: () => void
  onRedo: () => void
  onToggleGrid: () => void
  onToggleGuides: () => void
}

export function EditorToolbar({
  isPlaying,
  currentFrame,
  totalFrames,
  zoom,
  showGrid,
  showGuides,
  onPlaybackChange,
  onFrameChange,
  onZoomChange,
  onSave,
  onUndo,
  onRedo,
  onToggleGrid,
  onToggleGuides,
}: EditorToolbarProps) {
  const formatTime = (frame: number, fps: number = 30) => {
    const seconds = frame / fps
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    const frames = frame % fps
    
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`
  }

  const handleZoomIn = () => {
    onZoomChange(Math.min(5, zoom * 1.2))
  }

  const handleZoomOut = () => {
    onZoomChange(Math.max(0.1, zoom / 1.2))
  }

  const handleZoomReset = () => {
    onZoomChange(1)
  }

  return (
    <div className="h-14 bg-card border-b flex items-center justify-between px-4">
      {/* Left Section - File Operations */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm">
          <FileText className="h-4 w-4 mr-2" />
          New
        </Button>
        <Button variant="ghost" size="sm">
          <Folder className="h-4 w-4 mr-2" />
          Open
        </Button>
        <Button variant="ghost" size="sm" onClick={onSave}>
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
        
        <Separator orientation="vertical" className="h-6" />
        
        {/* Undo/Redo */}
        <Button variant="ghost" size="sm" onClick={onUndo}>
          <Undo className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={onRedo}>
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* Center Section - Playback Controls */}
      <div className="flex items-center gap-4">
        {/* Playback Controls */}
        <div className="flex items-center gap-1 bg-muted rounded-md p-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onFrameChange(0)}
            title="Go to start"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onFrameChange(Math.max(0, currentFrame - 1))}
            title="Previous frame"
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onPlaybackChange(!isPlaying)}
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onFrameChange(Math.min(totalFrames, currentFrame + 1))}
            title="Next frame"
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        {/* Frame Counter */}
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-mono">
            {formatTime(currentFrame)}
          </Badge>
          <span className="text-muted-foreground">/</span>
          <Badge variant="outline" className="font-mono">
            {formatTime(totalFrames)}
          </Badge>
        </div>

        {/* Frame Input */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Frame:</span>
          <input
            type="number"
            value={currentFrame}
            onChange={(e) => onFrameChange(Math.max(0, Math.min(totalFrames, parseInt(e.target.value) || 0)))}
            className="w-16 px-2 py-1 text-sm border rounded text-center"
            min={0}
            max={totalFrames}
          />
        </div>
      </div>

      {/* Right Section - View and Export */}
      <div className="flex items-center gap-2">
        {/* View Controls */}
        <div className="flex items-center gap-1 bg-muted rounded-md p-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleZoomOut}
            title="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleZoomReset}
            title="Reset zoom"
            className="min-w-[60px]"
          >
            {Math.round(zoom * 100)}%
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleZoomIn}
            title="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Overlay Controls */}
        <div className="flex items-center gap-1">
          <Button 
            variant={showGrid ? "default" : "ghost"} 
            size="sm"
            onClick={onToggleGrid}
            title="Toggle grid"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button 
            variant={showGuides ? "default" : "ghost"} 
            size="sm"
            onClick={onToggleGuides}
            title="Toggle guides"
          >
            <Ruler className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Export and Share */}
        <Button variant="ghost" size="sm">
          <Share className="h-4 w-4 mr-2" />
          Share
        </Button>
        <Button variant="default" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>

        <Separator orientation="vertical" className="h-6" />

        {/* Settings and Help */}
        <Button variant="ghost" size="sm">
          <Settings className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <HelpCircle className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
