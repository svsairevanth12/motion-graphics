'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CreateProjectData } from '@/types'

export function useCreateProject() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: CreateProjectData) => {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create project')
      }
      
      const result = await response.json()
      return result.project
    },
    onSuccess: () => {
      // Invalidate projects query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}
