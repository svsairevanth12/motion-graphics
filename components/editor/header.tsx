'use client'

import { Button } from '@/components/ui/button'
import { Save, Play, Download, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export function EditorHeader() {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/projects">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          
          <div className="h-6 w-px bg-border" />
          
          <div>
            <h1 className="font-semibold">Motion Graphics Editor</h1>
          </div>
        </div>

        <div className="ml-auto flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
          
          <Button variant="outline" size="sm">
            <Play className="mr-2 h-4 w-4" />
            Preview
          </Button>
          
          <Button size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
    </header>
  )
}
