'use client'

import { useMutation, useQuery } from '@tanstack/react-query'
import { MotionSpec, Scene, StyleSuggestion, MotionElement } from '@/lib/ai/openrouter'

interface AIResponse<T> {
  success: boolean
  data: T
  error?: string
}

// Hook for analyzing prompts
export function useAnalyzePrompt() {
  return useMutation<MotionSpec, Error, string>({
    mutationFn: async (prompt: string) => {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'analyze', prompt }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to analyze prompt')
      }

      const result: AIResponse<MotionSpec> = await response.json()
      return result.data
    },
  })
}

// Hook for enhancing prompts
export function useEnhancePrompt() {
  return useMutation<string, Error, string>({
    mutationFn: async (prompt: string) => {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'enhance', prompt }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to enhance prompt')
      }

      const result: AIResponse<{ enhancedPrompt: string }> = await response.json()
      return result.data.enhancedPrompt
    },
  })
}

// Hook for generating scenes
export function useGenerateScenes() {
  return useMutation<Scene[], Error, MotionSpec>({
    mutationFn: async (spec: MotionSpec) => {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generateScenes', spec }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate scenes')
      }

      const result: AIResponse<{ scenes: Scene[] }> = await response.json()
      return result.data.scenes
    },
  })
}

// Hook for suggesting styles
export function useSuggestStyles() {
  return useMutation<StyleSuggestion[], Error, string>({
    mutationFn: async (content: string) => {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'suggestStyles', content }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to suggest styles')
      }

      const result: AIResponse<{ styles: StyleSuggestion[] }> = await response.json()
      return result.data.styles
    },
  })
}

// Hook for generating color schemes
export function useGenerateColorScheme() {
  return useMutation<string[], Error, string>({
    mutationFn: async (description: string) => {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generateColorScheme', description }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate color scheme')
      }

      const result: AIResponse<{ colors: string[] }> = await response.json()
      return result.data.colors
    },
  })
}

// Hook for calculating timing
export function useCalculateTiming() {
  return useMutation<MotionElement[], Error, { elements: MotionElement[]; totalDuration: number }>({
    mutationFn: async ({ elements, totalDuration }) => {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'calculateTiming', elements, totalDuration }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to calculate timing')
      }

      const result: AIResponse<{ elements: MotionElement[] }> = await response.json()
      return result.data.elements
    },
  })
}

// Hook for AI health check
export function useAIHealth() {
  return useQuery({
    queryKey: ['ai-health'],
    queryFn: async () => {
      const response = await fetch('/api/ai?action=health')
      
      if (!response.ok) {
        throw new Error('Failed to check AI health')
      }

      const result = await response.json()
      return result
    },
    refetchInterval: 5 * 60 * 1000, // Check every 5 minutes
    staleTime: 2 * 60 * 1000, // Consider stale after 2 minutes
  })
}

// Hook for AI usage stats
export function useAIUsage() {
  return useQuery({
    queryKey: ['ai-usage'],
    queryFn: async () => {
      const response = await fetch('/api/ai?action=usage')
      
      if (!response.ok) {
        throw new Error('Failed to get AI usage')
      }

      const result = await response.json()
      return result.usage
    },
    refetchInterval: 30 * 1000, // Update every 30 seconds
  })
}

// Composite hook for the full AI workflow
export function useAIWorkflow() {
  const analyzePrompt = useAnalyzePrompt()
  const enhancePrompt = useEnhancePrompt()
  const generateScenes = useGenerateScenes()
  const suggestStyles = useSuggestStyles()
  const generateColorScheme = useGenerateColorScheme()
  const calculateTiming = useCalculateTiming()

  const runFullWorkflow = async (prompt: string, options: {
    enhance?: boolean
    generateStyles?: boolean
    generateColors?: boolean
    optimizeTiming?: boolean
  } = {}) => {
    try {
      // Step 1: Enhance prompt if requested
      let finalPrompt = prompt
      if (options.enhance) {
        finalPrompt = await enhancePrompt.mutateAsync(prompt)
      }

      // Step 2: Analyze prompt to get motion spec
      const motionSpec = await analyzePrompt.mutateAsync(finalPrompt)

      // Step 3: Generate style suggestions if requested
      let styles: StyleSuggestion[] = []
      if (options.generateStyles) {
        styles = await suggestStyles.mutateAsync(finalPrompt)
      }

      // Step 4: Generate color scheme if requested
      if (options.generateColors) {
        const colors = await generateColorScheme.mutateAsync(motionSpec.description)
        motionSpec.colorScheme = colors
      }

      // Step 5: Generate scenes
      const scenes = await generateScenes.mutateAsync(motionSpec)

      // Step 6: Optimize timing if requested
      if (options.optimizeTiming && motionSpec.elements.length > 0) {
        const optimizedElements = await calculateTiming.mutateAsync({
          elements: motionSpec.elements,
          totalDuration: motionSpec.duration,
        })
        motionSpec.elements = optimizedElements
      }

      return {
        originalPrompt: prompt,
        enhancedPrompt: options.enhance ? finalPrompt : null,
        motionSpec,
        scenes,
        styles: options.generateStyles ? styles : [],
      }
    } catch (error) {
      console.error('AI workflow error:', error)
      throw error
    }
  }

  return {
    runFullWorkflow,
    isLoading: analyzePrompt.isPending || 
               enhancePrompt.isPending || 
               generateScenes.isPending || 
               suggestStyles.isPending || 
               generateColorScheme.isPending || 
               calculateTiming.isPending,
    error: analyzePrompt.error || 
           enhancePrompt.error || 
           generateScenes.error || 
           suggestStyles.error || 
           generateColorScheme.error || 
           calculateTiming.error,
  }
}
