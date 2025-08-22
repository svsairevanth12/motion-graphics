'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Layers, 
  Type, 
  Square, 
  Image, 
  Music, 
  Palette,
  Settings
} from 'lucide-react'

export function EditorSidebar() {
  return (
    <div className="w-80 border-r border-border bg-card">
      <Tabs defaultValue="layers" className="h-full">
        <TabsList className="grid w-full grid-cols-4 rounded-none border-b">
          <TabsTrigger value="layers">
            <Layers className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="elements">
            <Type className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="assets">
            <Image className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4" />
          </TabsTrigger>
        </TabsList>

        <TabsContent value="layers" className="p-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Layers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm text-muted-foreground">
                No layers yet. Add elements to see them here.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="elements" className="p-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Elements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Type className="mr-2 h-4 w-4" />
                Text
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Square className="mr-2 h-4 w-4" />
                Shape
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Image className="mr-2 h-4 w-4" />
                Image
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Music className="mr-2 h-4 w-4" />
                Audio
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assets" className="p-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Assets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Upload images, videos, and audio files here.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="p-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Project Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Configure project settings and export options.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
