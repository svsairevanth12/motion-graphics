'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  Settings, 
  Palette, 
  Type, 
  Layers, 
  Download,
  Monitor,
  Smartphone,
  Square,
  Play,
  Zap,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2
} from 'lucide-react'
import { MotionProject } from '@/lib/motion-engine'
import { ColorPicker } from '@/components/ui/color-picker'

interface CustomizationPanelProps {
  project?: MotionProject | null
  selectedElementId?: string | null
  onProjectUpdate: (project: MotionProject) => void
  onElementUpdate: (elementId: string, updates: any) => void
}

const PRESET_DIMENSIONS = [
  { name: 'YouTube', width: 1920, height: 1080, ratio: '16:9', icon: Monitor },
  { name: 'Instagram Post', width: 1080, height: 1080, ratio: '1:1', icon: Square },
  { name: 'Instagram Story', width: 1080, height: 1920, ratio: '9:16', icon: Smartphone },
  { name: 'TikTok', width: 1080, height: 1920, ratio: '9:16', icon: Smartphone },
  { name: 'Twitter', width: 1200, height: 675, ratio: '16:9', icon: Monitor },
]

const ANIMATION_PRESETS = [
  { name: 'Smooth', easing: 'ease', speed: 1, description: 'Gentle and fluid' },
  { name: 'Snappy', easing: 'ease-out', speed: 1.5, description: 'Quick and responsive' },
  { name: 'Bouncy', easing: 'bounce', speed: 0.8, description: 'Playful with bounce' },
  { name: 'Elastic', easing: 'elastic', speed: 0.7, description: 'Spring-like motion' },
]

const EXPORT_FORMATS = [
  { id: 'mp4', name: 'MP4', description: 'Best for web and social media' },
  { id: 'webm', name: 'WebM', description: 'Optimized for web browsers' },
  { id: 'gif', name: 'GIF', description: 'Animated image format' },
  { id: 'lottie', name: 'Lottie', description: 'JSON animation for web/mobile' },
]

const QUALITY_OPTIONS = [
  { id: 'draft', name: 'Draft', description: 'Fast preview quality' },
  { id: 'preview', name: 'Preview', description: 'Good for review' },
  { id: 'high', name: 'High', description: 'Production quality' },
  { id: 'ultra', name: 'Ultra', description: 'Maximum quality' },
]

export function CustomizationPanel({ 
  project, 
  selectedElementId, 
  onProjectUpdate, 
  onElementUpdate 
}: CustomizationPanelProps) {
  const [activeTab, setActiveTab] = useState('dimensions')

  const selectedElement = selectedElementId && project ? 
    project.scenes.flatMap(scene => scene.elements).find(el => el.id === selectedElementId) : 
    null

  const handleDimensionPreset = (preset: typeof PRESET_DIMENSIONS[0]) => {
    if (!project) return
    
    const updatedProject = {
      ...project,
      width: preset.width,
      height: preset.height,
    }
    onProjectUpdate(updatedProject)
  }

  const handleCustomDimensions = (width: number, height: number) => {
    if (!project) return
    
    const updatedProject = {
      ...project,
      width,
      height,
    }
    onProjectUpdate(updatedProject)
  }

  const handleElementProperty = (property: string, value: any) => {
    if (!selectedElementId) return
    
    onElementUpdate(selectedElementId, {
      properties: {
        [property]: value
      }
    })
  }

  const handleElementVisibility = (visible: boolean) => {
    if (!selectedElementId) return
    
    onElementUpdate(selectedElementId, { visible })
  }

  const handleElementLock = (locked: boolean) => {
    if (!selectedElementId) return
    
    onElementUpdate(selectedElementId, { locked })
  }

  const handleDeleteElement = () => {
    if (!selectedElementId || !project) return
    
    const updatedProject = { ...project }
    for (const scene of updatedProject.scenes) {
      const index = scene.elements.findIndex(el => el.id === selectedElementId)
      if (index > -1) {
        scene.elements.splice(index, 1)
        break
      }
    }
    onProjectUpdate(updatedProject)
  }

  return (
    <div className="h-full flex flex-col bg-background border-l">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold flex items-center">
          <Settings className="mr-2 h-5 w-5" />
          Customization
        </h2>
        <p className="text-sm text-muted-foreground">
          Fine-tune your motion graphics
        </p>
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-5 mx-4 mt-4">
            <TabsTrigger value="dimensions" className="text-xs">Size</TabsTrigger>
            <TabsTrigger value="animation" className="text-xs">Motion</TabsTrigger>
            <TabsTrigger value="style" className="text-xs">Style</TabsTrigger>
            <TabsTrigger value="elements" className="text-xs">Layers</TabsTrigger>
            <TabsTrigger value="export" className="text-xs">Export</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 p-4">
            <TabsContent value="dimensions" className="space-y-4 mt-0">
              {/* Preset Dimensions */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Platform Presets</Label>
                <div className="grid grid-cols-1 gap-2">
                  {PRESET_DIMENSIONS.map((preset) => {
                    const Icon = preset.icon
                    const isActive = project?.width === preset.width && project?.height === preset.height
                    
                    return (
                      <Button
                        key={preset.name}
                        variant={isActive ? "default" : "outline"}
                        className="justify-start h-auto p-3"
                        onClick={() => handleDimensionPreset(preset)}
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        <div className="text-left">
                          <div className="font-medium">{preset.name}</div>
                          <div className="text-xs opacity-70">
                            {preset.width} × {preset.height} ({preset.ratio})
                          </div>
                        </div>
                      </Button>
                    )
                  })}
                </div>
              </div>

              <Separator />

              {/* Custom Dimensions */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Custom Dimensions</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="width" className="text-xs">Width</Label>
                    <Input
                      id="width"
                      type="number"
                      value={project?.width || 1920}
                      onChange={(e) => handleCustomDimensions(
                        parseInt(e.target.value) || 1920,
                        project?.height || 1080
                      )}
                    />
                  </div>
                  <div>
                    <Label htmlFor="height" className="text-xs">Height</Label>
                    <Input
                      id="height"
                      type="number"
                      value={project?.height || 1080}
                      onChange={(e) => handleCustomDimensions(
                        project?.width || 1920,
                        parseInt(e.target.value) || 1080
                      )}
                    />
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Aspect ratio: {project ? (project.width / project.height).toFixed(2) : '1.78'}:1
                </div>
              </div>

              <Separator />

              {/* Duration */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Duration</Label>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Frames: {project?.duration || 300}</span>
                    <span>Time: {((project?.duration || 300) / (project?.fps || 30)).toFixed(1)}s</span>
                  </div>
                  <Slider
                    value={[project?.duration || 300]}
                    onValueChange={([value]) => {
                      if (!project) return
                      onProjectUpdate({ ...project, duration: value })
                    }}
                    max={1800} // 60 seconds at 30fps
                    min={30}   // 1 second at 30fps
                    step={1}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="animation" className="space-y-4 mt-0">
              {/* Animation Presets */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Animation Style</Label>
                <div className="grid grid-cols-1 gap-2">
                  {ANIMATION_PRESETS.map((preset) => (
                    <Button
                      key={preset.name}
                      variant="outline"
                      className="justify-start h-auto p-3"
                    >
                      <Play className="mr-2 h-4 w-4" />
                      <div className="text-left">
                        <div className="font-medium">{preset.name}</div>
                        <div className="text-xs opacity-70">{preset.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Speed Control */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Animation Speed</Label>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Speed: 1.0x</span>
                    <Badge variant="secondary">Normal</Badge>
                  </div>
                  <Slider
                    value={[1]}
                    onValueChange={() => {}}
                    max={3}
                    min={0.1}
                    step={0.1}
                  />
                </div>
              </div>

              <Separator />

              {/* Loop Settings */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Playback</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Loop animation</span>
                    <Button variant="outline" size="sm">
                      <Zap className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Auto-play</span>
                    <Button variant="outline" size="sm">
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="style" className="space-y-4 mt-0">
              {/* Colors */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Colors</Label>
                <div className="grid grid-cols-4 gap-2">
                  {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'].map((color) => (
                    <ColorPicker key={color} defaultColor={color} />
                  ))}
                </div>
              </div>

              <Separator />

              {/* Typography */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Typography</Label>
                <div className="space-y-2">
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Font family" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inter">Inter</SelectItem>
                      <SelectItem value="roboto">Roboto</SelectItem>
                      <SelectItem value="poppins">Poppins</SelectItem>
                      <SelectItem value="montserrat">Montserrat</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Size</Label>
                      <Input type="number" placeholder="24" />
                    </div>
                    <div>
                      <Label className="text-xs">Weight</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="400" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="300">Light</SelectItem>
                          <SelectItem value="400">Regular</SelectItem>
                          <SelectItem value="600">Semibold</SelectItem>
                          <SelectItem value="700">Bold</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Effects */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Effects</Label>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Palette className="mr-2 h-4 w-4" />
                    Add Glow Effect
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Palette className="mr-2 h-4 w-4" />
                    Add Shadow
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Palette className="mr-2 h-4 w-4" />
                    Add Blur
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="elements" className="space-y-4 mt-0">
              {/* Selected Element */}
              {selectedElement && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span>{selectedElement.name}</span>
                      <Badge variant="secondary">{selectedElement.type}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Element Controls */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleElementVisibility(!selectedElement.visible)}
                      >
                        {selectedElement.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleElementLock(!selectedElement.locked)}
                      >
                        {selectedElement.locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDeleteElement}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Position */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">X Position</Label>
                        <Input
                          type="number"
                          value={selectedElement.properties.position.x}
                          onChange={(e) => handleElementProperty('position', {
                            ...selectedElement.properties.position,
                            x: parseFloat(e.target.value) || 0
                          })}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Y Position</Label>
                        <Input
                          type="number"
                          value={selectedElement.properties.position.y}
                          onChange={(e) => handleElementProperty('position', {
                            ...selectedElement.properties.position,
                            y: parseFloat(e.target.value) || 0
                          })}
                        />
                      </div>
                    </div>

                    {/* Opacity */}
                    <div className="space-y-2">
                      <Label className="text-xs">Opacity: {Math.round((selectedElement.properties.opacity || 1) * 100)}%</Label>
                      <Slider
                        value={[(selectedElement.properties.opacity || 1) * 100]}
                        onValueChange={([value]) => handleElementProperty('opacity', value / 100)}
                        max={100}
                        min={0}
                        step={1}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Layer List */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Layers</Label>
                <div className="space-y-1">
                  {project?.scenes.flatMap(scene => scene.elements).map((element) => (
                    <div
                      key={element.id}
                      className={`p-2 rounded border cursor-pointer transition-colors ${
                        selectedElementId === element.id 
                          ? 'border-primary bg-primary/10' 
                          : 'border-border hover:bg-muted/50'
                      }`}
                      onClick={() => {}}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Layers className="h-4 w-4" />
                          <span className="text-sm">{element.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {element.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3 opacity-50" />}
                          {element.locked && <Lock className="h-3 w-3 opacity-50" />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="export" className="space-y-4 mt-0">
              {/* Format Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Export Format</Label>
                <div className="grid grid-cols-1 gap-2">
                  {EXPORT_FORMATS.map((format) => (
                    <Button
                      key={format.id}
                      variant="outline"
                      className="justify-start h-auto p-3"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      <div className="text-left">
                        <div className="font-medium">{format.name}</div>
                        <div className="text-xs opacity-70">{format.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Quality Settings */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Quality</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select quality" />
                  </SelectTrigger>
                  <SelectContent>
                    {QUALITY_OPTIONS.map((quality) => (
                      <SelectItem key={quality.id} value={quality.id}>
                        <div>
                          <div className="font-medium">{quality.name}</div>
                          <div className="text-xs opacity-70">{quality.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Export Button */}
              <Button className="w-full" size="lg">
                <Download className="mr-2 h-4 w-4" />
                Export Video
              </Button>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>
    </div>
  )
}
