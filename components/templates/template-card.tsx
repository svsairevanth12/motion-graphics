'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TemplateWithDetails } from '@/types'
import { Eye, Download, Star } from 'lucide-react'

interface TemplateCardProps {
  template: TemplateWithDetails
}

export function TemplateCard({ template }: TemplateCardProps) {
  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        {/* Thumbnail */}
        <div className="aspect-video bg-muted rounded-md flex items-center justify-center mb-3">
          {template.thumbnailUrl ? (
            <img 
              src={template.thumbnailUrl} 
              alt={template.title}
              className="w-full h-full object-cover rounded-md"
            />
          ) : (
            <Eye className="h-8 w-8 text-muted-foreground" />
          )}
        </div>
        
        <div className="space-y-1">
          <CardTitle className="text-lg line-clamp-1">{template.title}</CardTitle>
          <CardDescription className="line-clamp-2">
            {template.description}
          </CardDescription>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          <Badge variant="secondary">{template.category}</Badge>
          {template.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Download className="h-3 w-3" />
            <span>{template._count?.projects || 0} uses</span>
          </div>
          {template.user && (
            <span>by {template.user.name}</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <Button size="sm" className="flex-1">
            Use Template
          </Button>
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
