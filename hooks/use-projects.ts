'use client'

import { useQuery } from '@tanstack/react-query'
import { ProjectWithDetails } from '@/types'

export function useProjects() {
  return useQuery<ProjectWithDetails[]>({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await fetch('/api/projects')
      if (!response.ok) {
        throw new Error('Failed to fetch projects')
      }
      const data = await response.json()
      return data.projects
    },
  })
}

export function useProject(id: string) {
  return useQuery<ProjectWithDetails>({
    queryKey: ['project', id],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch project')
      }
      const data = await response.json()
      return data.project
    },
    enabled: !!id,
  })
}
