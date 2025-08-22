'use client'

import { useQuery } from '@tanstack/react-query'
import { TemplateWithDetails } from '@/types'

interface UseTemplatesOptions {
  category?: string
  public?: boolean
  userId?: string
}

export function useTemplates(options: UseTemplatesOptions = {}) {
  const { category, public: isPublic, userId } = options
  
  return useQuery<TemplateWithDetails[]>({
    queryKey: ['templates', { category, public: isPublic, userId }],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (category) params.set('category', category)
      if (isPublic !== undefined) params.set('public', isPublic.toString())
      if (userId) params.set('userId', userId)
      
      const response = await fetch(`/api/templates?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch templates')
      }
      const data = await response.json()
      return data.templates
    },
  })
}

export function useTemplate(id: string) {
  return useQuery<TemplateWithDetails>({
    queryKey: ['template', id],
    queryFn: async () => {
      const response = await fetch(`/api/templates/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch template')
      }
      const data = await response.json()
      return data.template
    },
    enabled: !!id,
  })
}
