'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProjectWithDetails } from '@/types'
import { formatDate, formatDuration } from '@/lib/utils'
import { Play, Edit, MoreHorizontal, Clock, Calendar } from 'lucide-react'
import Link from 'next/link'

interface ProjectCardProps {
  project: ProjectWithDetails
}

export function ProjectCard({ project }: ProjectCardProps) {
  const statusColors = {
    DRAFT: 'bg-gray-100 text-gray-800',
    RENDERING: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-green-100 text-green-800',
    FAILED: 'bg-red-100 text-red-800',
  }

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg line-clamp-1">{project.title}</CardTitle>
            <CardDescription className="line-clamp-2">
              {project.description}
            </CardDescription>
          </div>
          <Badge 
            variant="secondary" 
            className={statusColors[project.status]}
          >
            {project.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Thumbnail placeholder */}
        <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
          {project.thumbnailUrl ? (
            <img 
              src={project.thumbnailUrl} 
              alt={project.title}
              className="w-full h-full object-cover rounded-md"
            />
          ) : (
            <Play className="h-8 w-8 text-muted-foreground" />
          )}
        </div>

        {/* Project info */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-4">
            {project.duration && (
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{formatDuration(project.duration)}</span>
              </div>
            )}
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(project.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <Button asChild size="sm" className="flex-1">
            <Link href={`/editor/customize?id=${project.id}`}>
              <Edit className="mr-2 h-3 w-3" />
              Edit
            </Link>
          </Button>
          
          {project.status === 'COMPLETED' && project.videoUrl && (
            <Button asChild variant="outline" size="sm">
              <Link href={project.videoUrl} target="_blank">
                <Play className="mr-2 h-3 w-3" />
                Play
              </Link>
            </Button>
          )}
          
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
