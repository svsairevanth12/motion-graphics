'use client'

import { useState, useEffect, useCallback } from 'react'
import { MotionProject, MotionEngineUtils } from '@/lib/motion-engine'

interface UseMotionProjectReturn {
  project: MotionProject | null
  isLoading: boolean
  error: string | null
  updateProject: (project: MotionProject) => void
  createNewProject: (config?: Partial<MotionProject>) => void
  loadProject: (projectId: string) => Promise<void>
  saveProject: () => Promise<void>
  exportProject: (format: string, quality: string) => Promise<string>
}

export function useMotionProject(): UseMotionProjectReturn {
  const [project, setProject] = useState<MotionProject | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize with a default project
  useEffect(() => {
    createNewProject()
  }, [])

  const createNewProject = useCallback((config?: Partial<MotionProject>) => {
    setIsLoading(true)
    setError(null)

    try {
      const newProject = MotionEngineUtils.createProject({
        title: 'Untitled Project',
        width: 1920,
        height: 1080,
        fps: 30,
        duration: 300, // 10 seconds
        backgroundColor: '#000000',
        ...config,
      })

      // Add a default scene
      const defaultScene = MotionEngineUtils.createScene({
        title: 'Main Scene',
        startFrame: 0,
        endFrame: newProject.duration,
        duration: newProject.duration,
      })

      // Add a sample text element
      const textElement = MotionEngineUtils.createElement('text', {
        name: 'Sample Text',
        startFrame: 0,
        endFrame: newProject.duration,
        properties: {
          position: { x: newProject.width / 2 - 100, y: newProject.height / 2 },
          size: { width: 200, height: 50 },
          fontSize: 32,
          color: '#ffffff',
          textAlign: 'center',
        },
      })

      // Add fade in/out animation
      const fadeAnimation = MotionEngineUtils.createAnimation(
        'opacity',
        [
          { frame: 0, value: 0 },
          { frame: 30, value: 1 },
          { frame: newProject.duration - 30, value: 1 },
          { frame: newProject.duration, value: 0 },
        ],
        {
          easing: 'ease-in-out',
          duration: newProject.duration,
        }
      )

      textElement.animations.push(fadeAnimation)
      defaultScene.elements.push(textElement)
      newProject.scenes.push(defaultScene)

      setProject(newProject)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateProject = useCallback((updatedProject: MotionProject) => {
    setProject(updatedProject)
    
    // Auto-save to localStorage
    try {
      localStorage.setItem('motion-graphics-project', JSON.stringify(updatedProject))
    } catch (err) {
      console.warn('Failed to auto-save project:', err)
    }
  }, [])

  const loadProject = useCallback(async (projectId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      // In a real app, this would fetch from an API
      const response = await fetch(`/api/projects/${projectId}`)
      if (!response.ok) {
        throw new Error('Failed to load project')
      }

      const projectData = await response.json()
      setProject(projectData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load project')
      
      // Try to load from localStorage as fallback
      try {
        const savedProject = localStorage.getItem('motion-graphics-project')
        if (savedProject) {
          setProject(JSON.parse(savedProject))
        }
      } catch (localErr) {
        console.warn('Failed to load from localStorage:', localErr)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const saveProject = useCallback(async () => {
    if (!project) return

    setIsLoading(true)
    setError(null)

    try {
      // Validate project before saving
      const validation = MotionEngineUtils.validateProject(project)
      if (!validation.valid) {
        throw new Error(`Project validation failed: ${validation.errors.join(', ')}`)
      }

      // In a real app, this would save to an API
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(project),
      })

      if (!response.ok) {
        throw new Error('Failed to save project')
      }

      // Also save to localStorage
      localStorage.setItem('motion-graphics-project', JSON.stringify(project))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save project')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [project])

  const exportProject = useCallback(async (format: string, quality: string): Promise<string> => {
    if (!project) throw new Error('No project to export')

    setIsLoading(true)
    setError(null)

    try {
      // In a real app, this would use the motion renderer
      const response = await fetch('/api/projects/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project,
          format,
          quality,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to export project')
      }

      const result = await response.json()
      return result.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export project')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [project])

  return {
    project,
    isLoading,
    error,
    updateProject,
    createNewProject,
    loadProject,
    saveProject,
    exportProject,
  }
}
