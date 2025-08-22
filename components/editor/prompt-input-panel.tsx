'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Sparkles, 
  Wand2, 
  History, 
  Template, 
  ChevronLeft, 
  ChevronRight,
  Copy,
  Plus,
  Lightbulb
} from 'lucide-react'
import { useAIWorkflow } from '@/hooks/use-ai'
import { MotionProject } from '@/lib/motion-engine'

interface PromptInputPanelProps {
  onPromptSubmit: (prompt: string, options: any) => void
  project?: MotionProject | null
}

interface PromptSuggestion {
  text: string
  category: string
  description: string
}

interface PromptTemplate {
  id: string
  name: string
  description: string
  prompt: string
  category: string
  tags: string[]
}

const EXAMPLE_PROMPTS = [
  {
    text: "Create a modern logo animation with smooth transitions and particle effects",
    category: "Logo",
    description: "Professional logo reveal with particles"
  },
  {
    text: "Design an energetic social media intro with vibrant colors and dynamic text",
    category: "Social Media",
    description: "Eye-catching intro for social platforms"
  },
  {
    text: "Make a corporate presentation opener with clean typography and subtle animations",
    category: "Corporate",
    description: "Professional business presentation"
  },
  {
    text: "Build a tech product demo with futuristic elements and glowing effects",
    category: "Tech",
    description: "High-tech product showcase"
  },
  {
    text: "Create a celebration animation with confetti, sparkles, and festive colors",
    category: "Celebration",
    description: "Party and celebration themed"
  }
]

const PROMPT_TEMPLATES = [
  {
    id: 'logo-reveal',
    name: 'Logo Reveal',
    description: 'Professional logo animation template',
    prompt: 'Create a [STYLE] logo animation for [COMPANY_TYPE] with [COLORS] colors, featuring [ANIMATION_TYPE] and [EFFECTS]',
    category: 'Logo',
    tags: ['logo', 'branding', 'reveal']
  },
  {
    id: 'social-intro',
    name: 'Social Media Intro',
    description: 'Engaging social media opener',
    prompt: 'Design a [DURATION] second [PLATFORM] intro with [MOOD] energy, [COLORS] color scheme, and [TEXT_STYLE] typography',
    category: 'Social',
    tags: ['social', 'intro', 'engagement']
  },
  {
    id: 'product-demo',
    name: 'Product Demo',
    description: 'Product showcase animation',
    prompt: 'Create a [PRODUCT_TYPE] demonstration video with [STYLE] aesthetics, highlighting [FEATURES] with [ANIMATION_STYLE] animations',
    category: 'Product',
    tags: ['product', 'demo', 'showcase']
  }
]

export function PromptInputPanel({ onPromptSubmit, project }: PromptInputPanelProps) {
  const [prompt, setPrompt] = useState('')
  const [promptHistory, setPromptHistory] = useState<string[]>([])
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<PromptSuggestion[]>([])
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const aiWorkflow = useAIWorkflow()

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [prompt])

  // Generate AI suggestions based on current prompt
  useEffect(() => {
    if (prompt.length > 10) {
      // Simulate AI suggestions - in real app, this would call AI service
      const mockSuggestions = [
        {
          text: `${prompt} with smooth transitions`,
          category: 'Enhancement',
          description: 'Add smooth transition effects'
        },
        {
          text: `${prompt} in modern style`,
          category: 'Style',
          description: 'Apply modern design aesthetics'
        },
        {
          text: `${prompt} with particle effects`,
          category: 'Effects',
          description: 'Include dynamic particle systems'
        }
      ]
      setSuggestions(mockSuggestions)
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }, [prompt])

  const handleSubmit = async () => {
    if (!prompt.trim()) return

    // Add to history
    setPromptHistory(prev => [prompt, ...prev.slice(0, 9)]) // Keep last 10

    // Submit prompt
    await onPromptSubmit(prompt, {
      enhance: true,
      generateStyles: true,
      generateColors: true,
      optimizeTiming: true
    })

    // Clear prompt
    setPrompt('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const insertTemplate = (template: PromptTemplate) => {
    setPrompt(template.prompt)
    textareaRef.current?.focus()
  }

  const insertExample = (example: string) => {
    setPrompt(example)
    textareaRef.current?.focus()
  }

  const applySuggestion = (suggestion: PromptSuggestion) => {
    setPrompt(suggestion.text)
    setShowSuggestions(false)
    textareaRef.current?.focus()
  }

  const nextExample = () => {
    setCurrentExampleIndex((prev) => (prev + 1) % EXAMPLE_PROMPTS.length)
  }

  const prevExample = () => {
    setCurrentExampleIndex((prev) => (prev - 1 + EXAMPLE_PROMPTS.length) % EXAMPLE_PROMPTS.length)
  }

  return (
    <div className="h-full flex flex-col bg-background border-r">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold flex items-center">
          <Sparkles className="mr-2 h-5 w-5" />
          AI Prompt Studio
        </h2>
        <p className="text-sm text-muted-foreground">
          Describe your vision and let AI create it
        </p>
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="prompt" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-3 mx-4 mt-4">
            <TabsTrigger value="prompt">Prompt</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="prompt" className="flex-1 p-4 space-y-4">
            {/* Main Prompt Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Describe your motion graphics</label>
              <div className="relative">
                <Textarea
                  ref={textareaRef}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g., Create a modern logo animation for a tech startup with blue colors, smooth transitions, and particle effects..."
                  className="min-h-[120px] resize-none"
                />
                {showSuggestions && suggestions.length > 0 && (
                  <Card className="absolute top-full left-0 right-0 z-10 mt-1 max-h-48 overflow-y-auto">
                    <CardContent className="p-2">
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => applySuggestion(suggestion)}
                          className="w-full text-left p-2 hover:bg-muted rounded text-sm"
                        >
                          <div className="font-medium">{suggestion.text}</div>
                          <div className="text-muted-foreground text-xs">
                            {suggestion.description}
                          </div>
                        </button>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Ctrl+Enter to generate</span>
                <span>{prompt.length}/1000</span>
              </div>
            </div>

            {/* Generate Button */}
            <Button 
              onClick={handleSubmit}
              disabled={!prompt.trim() || aiWorkflow.isLoading}
              className="w-full"
              size="lg"
            >
              {aiWorkflow.isLoading ? (
                <>
                  <Wand2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate with AI
                </>
              )}
            </Button>

            {/* Example Prompts Carousel */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Example Prompts</label>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={prevExample}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={nextExample}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Badge variant="secondary" className="mb-2">
                        {EXAMPLE_PROMPTS[currentExampleIndex].category}
                      </Badge>
                      <p className="text-sm mb-2">
                        {EXAMPLE_PROMPTS[currentExampleIndex].text}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {EXAMPLE_PROMPTS[currentExampleIndex].description}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertExample(EXAMPLE_PROMPTS[currentExampleIndex].text)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Tips */}
            <Card>
              <CardContent className="p-3">
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Pro Tips</p>
                    <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                      <li>• Be specific about colors, style, and mood</li>
                      <li>• Mention the target platform (YouTube, Instagram, etc.)</li>
                      <li>• Include animation preferences (smooth, energetic, etc.)</li>
                      <li>• Specify any text or branding elements</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="flex-1 p-4">
            <ScrollArea className="h-full">
              <div className="space-y-3">
                {PROMPT_TEMPLATES.map((template) => (
                  <Card key={template.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{template.name}</h4>
                          <p className="text-xs text-muted-foreground mb-2">
                            {template.description}
                          </p>
                          <div className="flex gap-1 mb-2">
                            {template.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-xs font-mono bg-muted p-2 rounded">
                            {template.prompt}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => insertTemplate(template)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="history" className="flex-1 p-4">
            <ScrollArea className="h-full">
              {promptHistory.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No prompt history yet</p>
                  <p className="text-xs">Your recent prompts will appear here</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {promptHistory.map((historyPrompt, index) => (
                    <Card key={index} className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <p className="text-sm flex-1">{historyPrompt}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPrompt(historyPrompt)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
