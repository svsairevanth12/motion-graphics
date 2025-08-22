'use client'

import { useEffect, useCallback } from 'react'

type ShortcutMap = Record<string, () => void>

interface UseKeyboardShortcutsOptions {
  enabled?: boolean
  preventDefault?: boolean
  stopPropagation?: boolean
}

export function useKeyboardShortcuts(
  shortcuts: ShortcutMap,
  options: UseKeyboardShortcutsOptions = {}
) {
  const {
    enabled = true,
    preventDefault = true,
    stopPropagation = true,
  } = options

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return

    // Don't trigger shortcuts when typing in inputs
    const target = event.target as HTMLElement
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.contentEditable === 'true'
    ) {
      return
    }

    // Build the key combination string
    const parts: string[] = []
    
    if (event.ctrlKey || event.metaKey) parts.push('Ctrl')
    if (event.altKey) parts.push('Alt')
    if (event.shiftKey) parts.push('Shift')
    
    // Handle special keys
    let key = event.key
    if (key === ' ') key = 'Space'
    if (key === 'ArrowLeft') key = 'ArrowLeft'
    if (key === 'ArrowRight') key = 'ArrowRight'
    if (key === 'ArrowUp') key = 'ArrowUp'
    if (key === 'ArrowDown') key = 'ArrowDown'
    if (key === 'Escape') key = 'Escape'
    if (key === 'Enter') key = 'Enter'
    if (key === 'Backspace') key = 'Backspace'
    if (key === 'Delete') key = 'Delete'
    if (key === 'Tab') key = 'Tab'
    if (key === 'Home') key = 'Home'
    if (key === 'End') key = 'End'
    if (key === 'PageUp') key = 'PageUp'
    if (key === 'PageDown') key = 'PageDown'
    
    parts.push(key)
    
    const combination = parts.join('+')
    
    // Check for exact match first
    if (shortcuts[combination]) {
      if (preventDefault) event.preventDefault()
      if (stopPropagation) event.stopPropagation()
      shortcuts[combination]()
      return
    }
    
    // Check for key-only match (for simple keys like Space, Delete, etc.)
    if (shortcuts[key] && !event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey) {
      if (preventDefault) event.preventDefault()
      if (stopPropagation) event.stopPropagation()
      shortcuts[key]()
      return
    }
  }, [shortcuts, enabled, preventDefault, stopPropagation])

  useEffect(() => {
    if (!enabled) return

    document.addEventListener('keydown', handleKeyDown)
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown, enabled])
}

// Common shortcut combinations
export const COMMON_SHORTCUTS = {
  // File operations
  NEW: 'Ctrl+n',
  OPEN: 'Ctrl+o',
  SAVE: 'Ctrl+s',
  SAVE_AS: 'Ctrl+Shift+s',
  
  // Edit operations
  UNDO: 'Ctrl+z',
  REDO: 'Ctrl+y',
  CUT: 'Ctrl+x',
  COPY: 'Ctrl+c',
  PASTE: 'Ctrl+v',
  SELECT_ALL: 'Ctrl+a',
  
  // Playback
  PLAY_PAUSE: 'Space',
  FRAME_BACK: 'ArrowLeft',
  FRAME_FORWARD: 'ArrowRight',
  GO_TO_START: 'Home',
  GO_TO_END: 'End',
  
  // View
  ZOOM_IN: '+',
  ZOOM_OUT: '-',
  ZOOM_FIT: '0',
  TOGGLE_GRID: 'g',
  TOGGLE_GUIDES: 'Ctrl+;',
  
  // Selection
  DESELECT: 'Escape',
  DELETE: 'Delete',
  DUPLICATE: 'Ctrl+d',
  
  // Timeline
  SPLIT_CLIP: 's',
  TRIM_START: 'q',
  TRIM_END: 'w',
  
  // Tools
  SELECT_TOOL: 'v',
  PAN_TOOL: 'h',
  TEXT_TOOL: 't',
  SHAPE_TOOL: 'r',
} as const

// Hook for common editor shortcuts
export function useEditorShortcuts(handlers: Partial<Record<keyof typeof COMMON_SHORTCUTS, () => void>>) {
  const shortcuts: ShortcutMap = {}
  
  Object.entries(handlers).forEach(([action, handler]) => {
    const shortcut = COMMON_SHORTCUTS[action as keyof typeof COMMON_SHORTCUTS]
    if (shortcut && handler) {
      shortcuts[shortcut] = handler
    }
  })
  
  useKeyboardShortcuts(shortcuts)
}

// Hook for timeline-specific shortcuts
export function useTimelineShortcuts(handlers: {
  onPlay?: () => void
  onPause?: () => void
  onFrameBack?: () => void
  onFrameForward?: () => void
  onGoToStart?: () => void
  onGoToEnd?: () => void
  onSplit?: () => void
  onDelete?: () => void
}) {
  const shortcuts: ShortcutMap = {}
  
  if (handlers.onPlay || handlers.onPause) {
    shortcuts['Space'] = handlers.onPlay || handlers.onPause || (() => {})
  }
  if (handlers.onFrameBack) shortcuts['ArrowLeft'] = handlers.onFrameBack
  if (handlers.onFrameForward) shortcuts['ArrowRight'] = handlers.onFrameForward
  if (handlers.onGoToStart) shortcuts['Home'] = handlers.onGoToStart
  if (handlers.onGoToEnd) shortcuts['End'] = handlers.onGoToEnd
  if (handlers.onSplit) shortcuts['s'] = handlers.onSplit
  if (handlers.onDelete) shortcuts['Delete'] = handlers.onDelete
  
  useKeyboardShortcuts(shortcuts)
}

// Hook for canvas-specific shortcuts
export function useCanvasShortcuts(handlers: {
  onZoomIn?: () => void
  onZoomOut?: () => void
  onZoomFit?: () => void
  onToggleGrid?: () => void
  onToggleGuides?: () => void
  onDeselect?: () => void
  onDelete?: () => void
  onDuplicate?: () => void
}) {
  const shortcuts: ShortcutMap = {}
  
  if (handlers.onZoomIn) shortcuts['+'] = handlers.onZoomIn
  if (handlers.onZoomOut) shortcuts['-'] = handlers.onZoomOut
  if (handlers.onZoomFit) shortcuts['0'] = handlers.onZoomFit
  if (handlers.onToggleGrid) shortcuts['g'] = handlers.onToggleGrid
  if (handlers.onToggleGuides) shortcuts['Ctrl+;'] = handlers.onToggleGuides
  if (handlers.onDeselect) shortcuts['Escape'] = handlers.onDeselect
  if (handlers.onDelete) shortcuts['Delete'] = handlers.onDelete
  if (handlers.onDuplicate) shortcuts['Ctrl+d'] = handlers.onDuplicate
  
  useKeyboardShortcuts(shortcuts)
}
