'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Play, Pause, RotateCcw, Download } from 'lucide-react'

export default function PreviewPage() {
  return (
    <div className="h-full p-6">
      <div className="h-full flex flex-col space-y-6">
        {/* Preview Area */}
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent className="h-full">
            <div className="h-full bg-black rounded-md flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-white/10 rounded-full mx-auto flex items-center justify-center">
                  <Play className="h-8 w-8 text-white" />
                </div>
                <p className="text-white/70">
                  Video preview will be displayed here
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button size="sm">
                  <Play className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Pause className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">00:00 / 00:10</span>
                <Button>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
