'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { 
  useAnalyzePrompt, 
  useEnhancePrompt, 
  useSuggestStyles, 
  useGenerateColorScheme,
  useAIHealth,
  useAIUsage,
  useAIWorkflow
} from '@/hooks/use-ai'
import { 
  Sparkles, 
  Wand2, 
  Palette, 
  Clock, 
  Brain, 
  Activity,
  DollarSign,
  Zap
} from 'lucide-react'

export function AIAssistant() {
  const [prompt, setPrompt] = useState('')
  const [options, setOptions] = useState({
    enhance: true,
    generateStyles: true,
    generateColors: true,
    optimizeTiming: true,
  })

  const analyzePrompt = useAnalyzePrompt()
  const enhancePrompt = useEnhancePrompt()
  const suggestStyles = useSuggestStyles()
  const generateColorScheme = useGenerateColorScheme()
  const aiWorkflow = useAIWorkflow()
  const aiHealth = useAIHealth()
  const aiUsage = useAIUsage()

  const handleAnalyze = async () => {
    if (!prompt.trim()) return
    
    try {
      await analyzePrompt.mutateAsync(prompt)
    } catch (error) {
      console.error('Analysis failed:', error)
    }
  }

  const handleEnhance = async () => {
    if (!prompt.trim()) return
    
    try {
      const enhanced = await enhancePrompt.mutateAsync(prompt)
      setPrompt(enhanced)
    } catch (error) {
      console.error('Enhancement failed:', error)
    }
  }

  const handleFullWorkflow = async () => {
    if (!prompt.trim()) return
    
    try {
      await aiWorkflow.runFullWorkflow(prompt, options)
    } catch (error) {
      console.error('Workflow failed:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* AI Health Status */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              AI System Status
            </CardTitle>
            <Badge variant={aiHealth.data?.healthy ? 'default' : 'destructive'}>
              {aiHealth.data?.healthy ? 'Online' : 'Offline'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="space-y-1">
              <div className="flex items-center text-muted-foreground">
                <Brain className="mr-1 h-3 w-3" />
                Models
              </div>
              <div className="font-medium">5 FREE Models</div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center text-muted-foreground">
                <Zap className="mr-1 h-3 w-3" />
                Tokens Used
              </div>
              <div className="font-medium">{aiUsage.data?.totalTokens?.toLocaleString() || '0'}</div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center text-muted-foreground">
                <DollarSign className="mr-1 h-3 w-3" />
                Cost
              </div>
              <div className="font-medium text-green-600">FREE! 🎉</div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center text-muted-foreground">
                <Clock className="mr-1 h-3 w-3" />
                Last Check
              </div>
              <div className="font-medium">
                {aiHealth.data?.timestamp ? 
                  new Date(aiHealth.data.timestamp).toLocaleTimeString() : 
                  'Never'
                }
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main AI Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sparkles className="mr-2 h-5 w-5" />
            AI Motion Graphics Assistant
            <Badge variant="secondary" className="ml-2 text-green-600">FREE</Badge>
          </CardTitle>
          <CardDescription>
            Describe your motion graphics idea and let AI help you create it using FREE models
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Prompt Input */}
          <div className="space-y-2">
            <Label htmlFor="prompt">Describe your motion graphics</Label>
            <Textarea
              id="prompt"
              placeholder="e.g., Create a modern logo animation for a tech startup with blue colors, smooth transitions, and particle effects"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          {/* Options */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">AI Processing Options</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enhance"
                  checked={options.enhance}
                  onCheckedChange={(checked) => setOptions(prev => ({ ...prev, enhance: checked }))}
                />
                <Label htmlFor="enhance" className="text-sm">Enhance prompt</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="styles"
                  checked={options.generateStyles}
                  onCheckedChange={(checked) => setOptions(prev => ({ ...prev, generateStyles: checked }))}
                />
                <Label htmlFor="styles" className="text-sm">Generate styles</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="colors"
                  checked={options.generateColors}
                  onCheckedChange={(checked) => setOptions(prev => ({ ...prev, generateColors: checked }))}
                />
                <Label htmlFor="colors" className="text-sm">Generate colors</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="timing"
                  checked={options.optimizeTiming}
                  onCheckedChange={(checked) => setOptions(prev => ({ ...prev, optimizeTiming: checked }))}
                />
                <Label htmlFor="timing" className="text-sm">Optimize timing</Label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={handleAnalyze}
              disabled={!prompt.trim() || analyzePrompt.isPending}
              variant="outline"
            >
              <Brain className="mr-2 h-4 w-4" />
              {analyzePrompt.isPending ? 'Analyzing...' : 'Analyze Only'}
            </Button>
            
            <Button 
              onClick={handleEnhance}
              disabled={!prompt.trim() || enhancePrompt.isPending}
              variant="outline"
            >
              <Wand2 className="mr-2 h-4 w-4" />
              {enhancePrompt.isPending ? 'Enhancing...' : 'Enhance Prompt'}
            </Button>
            
            <Button 
              onClick={handleFullWorkflow}
              disabled={!prompt.trim() || aiWorkflow.isLoading}
              className="flex-1"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {aiWorkflow.isLoading ? 'Processing...' : 'Full AI Workflow'}
            </Button>
          </div>

          {/* Progress Indicator */}
          {aiWorkflow.isLoading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing with AI...</span>
                <span>Please wait</span>
              </div>
              <Progress value={undefined} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      <Tabs defaultValue="analysis" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="styles">Styles</TabsTrigger>
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="raw">Raw Data</TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="space-y-4">
          {analyzePrompt.data && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Motion Specification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Title</Label>
                    <p className="text-sm text-muted-foreground">{analyzePrompt.data.title}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Style</Label>
                    <p className="text-sm text-muted-foreground">{analyzePrompt.data.style}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Duration</Label>
                    <p className="text-sm text-muted-foreground">{analyzePrompt.data.duration}s</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Aspect Ratio</Label>
                    <p className="text-sm text-muted-foreground">{analyzePrompt.data.aspectRatio}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm text-muted-foreground">{analyzePrompt.data.description}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="styles" className="space-y-4">
          {suggestStyles.data && (
            <div className="grid gap-4">
              {suggestStyles.data.map((style, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{style.name}</CardTitle>
                    <CardDescription>{style.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <Label className="text-sm font-medium">Mood</Label>
                        <p className="text-sm text-muted-foreground">{style.mood}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Color Palette</Label>
                        <div className="flex gap-2 mt-1">
                          {style.colorPalette.map((color, i) => (
                            <div
                              key={i}
                              className="w-6 h-6 rounded border"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="colors" className="space-y-4">
          {generateColorScheme.data && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Palette className="mr-2 h-5 w-5" />
                  Generated Color Scheme
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  {generateColorScheme.data.map((color, index) => (
                    <div key={index} className="text-center">
                      <div
                        className="w-16 h-16 rounded-lg border shadow-sm"
                        style={{ backgroundColor: color }}
                      />
                      <p className="text-xs mt-2 font-mono">{color}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="raw" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Raw AI Responses</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-96">
                {JSON.stringify({
                  analysis: analyzePrompt.data,
                  styles: suggestStyles.data,
                  colors: generateColorScheme.data,
                }, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
