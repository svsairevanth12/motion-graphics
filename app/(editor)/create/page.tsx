'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { PromptInputPanel } from '@/components/editor/prompt-input-panel'
import { PreviewCanvas } from '@/components/editor/preview-canvas'
import { CustomizationPanel } from '@/components/editor/customization-panel'
import { EditorToolbar } from '@/components/editor/editor-toolbar'
import { useMotionProject } from '@/hooks/use-motion-project'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'
import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from '@/components/ui/resizable'
import { Toaster } from '@/components/ui/toaster'

export default function CreatePage() {
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentFrame, setCurrentFrame] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [showGrid, setShowGrid] = useState(true)
  const [showGuides, setShowGuides] = useState(true)

  const canvasRef = useRef<HTMLDivElement>(null)
  const { project, updateProject, isLoading } = useMotionProject()
  // Keyboard shortcuts
  useKeyboardShortcuts({
    'Space': () => setIsPlaying(!isPlaying),
    'ArrowLeft': () => setCurrentFrame(Math.max(0, currentFrame - 1)),
    'ArrowRight': () => setCurrentFrame(Math.min(project?.duration || 300, currentFrame + 1)),
    'Home': () => setCurrentFrame(0),
    'End': () => setCurrentFrame(project?.duration || 300),
    'Escape': () => setSelectedElementId(null),
    'Delete': () => selectedElementId && handleDeleteElement(selectedElementId),
    'Ctrl+Z': () => handleUndo(),
    'Ctrl+Y': () => handleRedo(),
    'Ctrl+S': () => handleSave(),
    '+': () => setZoom(Math.min(5, zoom * 1.2)),
    '-': () => setZoom(Math.max(0.1, zoom / 1.2)),
    '0': () => { setZoom(1); setPanOffset({ x: 0, y: 0 }) },
  })

  const handlePromptSubmit = useCallback(async (prompt: string, options: any) => {
    try {
      // This would integrate with the AI generation system
      console.log('Generating from prompt:', prompt, options)
      // const result = await generateFromPrompt(prompt, options)
      // updateProject(result)
    } catch (error) {
      console.error('Failed to generate from prompt:', error)
    }
  }, [updateProject])

  const handleElementSelect = useCallback((elementId: string | null) => {
    setSelectedElementId(elementId)
  }, [])

  const handleElementUpdate = useCallback((elementId: string, updates: any) => {
    if (!project) return

    // Update element in project
    const updatedProject = { ...project }
    for (const scene of updatedProject.scenes) {
      const element = scene.elements.find(el => el.id === elementId)
      if (element) {
        Object.assign(element, updates)
        break
      }
    }

    updateProject(updatedProject)
  }, [project, updateProject])

  const handleDeleteElement = useCallback((elementId: string) => {
    if (!project) return

    const updatedProject = { ...project }
    for (const scene of updatedProject.scenes) {
      const index = scene.elements.findIndex(el => el.id === elementId)
      if (index > -1) {
        scene.elements.splice(index, 1)
        break
      }
    }

    updateProject(updatedProject)
    setSelectedElementId(null)
  }, [project, updateProject])

  const handleUndo = useCallback(() => {
    // Implement undo functionality
    console.log('Undo')
  }, [])

  const handleRedo = useCallback(() => {
    // Implement redo functionality
    console.log('Redo')
  }, [])

  const handleSave = useCallback(() => {
    // Implement save functionality
    console.log('Save project')
  }, [])

  const handlePlaybackChange = useCallback((playing: boolean) => {
    setIsPlaying(playing)
  }, [])

  const handleFrameChange = useCallback((frame: number) => {
    setCurrentFrame(frame)
  }, [])

  const handleZoomChange = useCallback((newZoom: number) => {
    setZoom(newZoom)
  }, [])

  const handlePanChange = useCallback((offset: { x: number; y: number }) => {
    setPanOffset(offset)
  }, [])

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading editor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Editor Toolbar */}
      <EditorToolbar
        isPlaying={isPlaying}
        currentFrame={currentFrame}
        totalFrames={project?.duration || 300}
        zoom={zoom}
        onPlaybackChange={handlePlaybackChange}
        onFrameChange={handleFrameChange}
        onZoomChange={handleZoomChange}
        onSave={handleSave}
        onUndo={handleUndo}
        onRedo={handleRedo}
        showGrid={showGrid}
        showGuides={showGuides}
        onToggleGrid={() => setShowGrid(!showGrid)}
        onToggleGuides={() => setShowGuides(!showGuides)}
      />

      {/* Main Editor Area */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Left Panel - Prompt Input */}
          <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
            <PromptInputPanel
              onPromptSubmit={handlePromptSubmit}
              project={project}
            />
          </ResizablePanel>

          <ResizableHandle />

          {/* Center Panel - Preview Canvas */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <PreviewCanvas
              ref={canvasRef}
              project={project}
              currentFrame={currentFrame}
              isPlaying={isPlaying}
              zoom={zoom}
              panOffset={panOffset}
              showGrid={showGrid}
              showGuides={showGuides}
              selectedElementId={selectedElementId}
              onElementSelect={handleElementSelect}
              onElementUpdate={handleElementUpdate}
              onPlaybackChange={handlePlaybackChange}
              onFrameChange={handleFrameChange}
              onZoomChange={handleZoomChange}
              onPanChange={handlePanChange}
            />
          </ResizablePanel>

          <ResizableHandle />

          {/* Right Panel - Customization */}
          <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
            <CustomizationPanel
              project={project}
              selectedElementId={selectedElementId}
              onProjectUpdate={updateProject}
              onElementUpdate={handleElementUpdate}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      <Toaster />
    </div>
  )
}
