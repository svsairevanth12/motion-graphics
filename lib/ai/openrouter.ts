import { z } from 'zod'

// Environment configuration
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'

if (!OPENROUTER_API_KEY) {
  throw new Error('OPENROUTER_API_KEY is required')
}

// Model configurations - Using best free models from OpenRouter
export const MODELS = {
  DEEPSEEK_V3: 'deepseek/deepseek-v3:free',
  DEEPSEEK_R1: 'deepseek/deepseek-r1:free',
  QWEN_CODER: 'qwen/qwen-3-coder:free',
  LLAMA_VISION: 'meta-llama/llama-3.2-11b-vision-instruct:free',
  DEEPSEEK_CHAT: 'deepseek/deepseek-chat:free',
} as const

// Type definitions
export interface MotionSpec {
  title: string
  description: string
  duration: number
  aspectRatio: '16:9' | '9:16' | '1:1'
  style: string
  mood: string
  colorScheme: string[]
  elements: MotionElement[]
  transitions: TransitionSpec[]
  audio?: AudioSpec
}

export interface MotionElement {
  type: 'text' | 'shape' | 'image' | 'video' | 'particle'
  content: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  timing: { start: number; end: number }
  animations: AnimationSpec[]
  style: ElementStyle
}

export interface AnimationSpec {
  property: string
  keyframes: { time: number; value: any; easing?: string }[]
  duration: number
  delay?: number
}

export interface TransitionSpec {
  type: 'fade' | 'slide' | 'zoom' | 'wipe' | 'morph'
  duration: number
  easing: string
  direction?: string
}

export interface ElementStyle {
  color?: string
  backgroundColor?: string
  fontSize?: number
  fontFamily?: string
  fontWeight?: string
  opacity?: number
  rotation?: number
  scale?: number
}

export interface AudioSpec {
  type: 'background' | 'effect'
  mood: string
  volume: number
  fadeIn?: number
  fadeOut?: number
}

export interface Scene {
  id: string
  title: string
  description: string
  duration: number
  elements: MotionElement[]
  background: {
    type: 'color' | 'gradient' | 'image'
    value: string | string[]
  }
  camera?: {
    position: { x: number; y: number; z: number }
    rotation: { x: number; y: number; z: number }
    animations: AnimationSpec[]
  }
}

export interface StyleSuggestion {
  name: string
  description: string
  colorPalette: string[]
  typography: {
    primary: string
    secondary: string
    accent: string
  }
  animations: string[]
  effects: string[]
  mood: string
  examples: string[]
}

// Validation schemas
const MotionSpecSchema = z.object({
  title: z.string(),
  description: z.string(),
  duration: z.number().min(1).max(300),
  aspectRatio: z.enum(['16:9', '9:16', '1:1']),
  style: z.string(),
  mood: z.string(),
  colorScheme: z.array(z.string()),
  elements: z.array(z.any()),
  transitions: z.array(z.any()),
  audio: z.any().optional(),
})

const SceneSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  duration: z.number(),
  elements: z.array(z.any()),
  background: z.object({
    type: z.enum(['color', 'gradient', 'image']),
    value: z.union([z.string(), z.array(z.string())]),
  }),
  camera: z.any().optional(),
})

const StyleSuggestionSchema = z.object({
  name: z.string(),
  description: z.string(),
  colorPalette: z.array(z.string()),
  typography: z.object({
    primary: z.string(),
    secondary: z.string(),
    accent: z.string(),
  }),
  animations: z.array(z.string()),
  effects: z.array(z.string()),
  mood: z.string(),
  examples: z.array(z.string()),
})

// Token usage tracking
interface TokenUsage {
  model: string
  promptTokens: number
  completionTokens: number
  totalTokens: number
  cost?: number
}

class TokenTracker {
  private usage: TokenUsage[] = []

  track(usage: TokenUsage) {
    this.usage.push({
      ...usage,
      cost: this.calculateCost(usage),
    })
  }

  getTotal() {
    return this.usage.reduce((total, usage) => ({
      promptTokens: total.promptTokens + usage.promptTokens,
      completionTokens: total.completionTokens + usage.completionTokens,
      totalTokens: total.totalTokens + usage.totalTokens,
      cost: (total.cost || 0) + (usage.cost || 0),
    }), { promptTokens: 0, completionTokens: 0, totalTokens: 0, cost: 0 })
  }

  private calculateCost(usage: TokenUsage): number {
    // All models are FREE - no cost calculation needed
    const costs = {
      [MODELS.DEEPSEEK_V3]: { input: 0, output: 0 },
      [MODELS.DEEPSEEK_R1]: { input: 0, output: 0 },
      [MODELS.QWEN_CODER]: { input: 0, output: 0 },
      [MODELS.LLAMA_VISION]: { input: 0, output: 0 },
      [MODELS.DEEPSEEK_CHAT]: { input: 0, output: 0 },
    }

    const modelCost = costs[usage.model as keyof typeof costs]
    if (!modelCost) return 0

    return (usage.promptTokens / 1000) * modelCost.input +
           (usage.completionTokens / 1000) * modelCost.output
  }

  reset() {
    this.usage = []
  }
}

// Error handling
class OpenRouterError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public model?: string,
    public retryable: boolean = false
  ) {
    super(message)
    this.name = 'OpenRouterError'
  }
}

// Retry logic with exponential backoff
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      
      if (error instanceof OpenRouterError && !error.retryable) {
        throw error
      }

      if (attempt === maxRetries) {
        break
      }

      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError!
}

// Main OpenRouter client
export class OpenRouterClient {
  private tokenTracker = new TokenTracker()
  private requestQueue: Promise<any>[] = []
  private maxConcurrentRequests = 5

  private async makeRequest(
    model: string,
    messages: Array<{ role: string; content: string }>,
    options: {
      temperature?: number
      maxTokens?: number
      topP?: number
    } = {}
  ) {
    // Rate limiting
    if (this.requestQueue.length >= this.maxConcurrentRequests) {
      await Promise.race(this.requestQueue)
    }

    const requestPromise = this.executeRequest(model, messages, options)
    this.requestQueue.push(requestPromise)
    
    try {
      const result = await requestPromise
      return result
    } finally {
      const index = this.requestQueue.indexOf(requestPromise)
      if (index > -1) {
        this.requestQueue.splice(index, 1)
      }
    }
  }

  private async executeRequest(
    model: string,
    messages: Array<{ role: string; content: string }>,
    options: {
      temperature?: number
      maxTokens?: number
      topP?: number
    }
  ) {
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'AI Motion Graphics Generator',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 4000,
        top_p: options.topP ?? 1,
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new OpenRouterError(
        error.error?.message || `HTTP ${response.status}`,
        response.status,
        model,
        response.status >= 500 || response.status === 429
      )
    }

    const data = await response.json()
    
    // Track token usage
    if (data.usage) {
      this.tokenTracker.track({
        model,
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      })
    }

    return data.choices[0]?.message?.content
  }

  getTokenUsage() {
    return this.tokenTracker.getTotal()
  }

  resetTokenUsage() {
    this.tokenTracker.reset()
  }

  // Prompt templates
  private getAnalyzePromptTemplate(userInput: string): string {
    return `You are an expert motion graphics designer and AI assistant. Analyze the following user input and extract a structured motion graphics specification.

User Input: "${userInput}"

Please analyze this input and provide a JSON response with the following structure:
{
  "title": "Brief descriptive title",
  "description": "Detailed description of the motion graphics",
  "duration": number (in seconds, 1-300),
  "aspectRatio": "16:9" | "9:16" | "1:1",
  "style": "visual style (modern, corporate, creative, etc.)",
  "mood": "emotional tone (energetic, calm, professional, etc.)",
  "colorScheme": ["#color1", "#color2", "#color3"],
  "elements": [
    {
      "type": "text" | "shape" | "image" | "video" | "particle",
      "content": "element content or description",
      "timing": {"start": number, "end": number},
      "animations": ["fade-in", "slide", "scale", etc.]
    }
  ],
  "transitions": [
    {
      "type": "fade" | "slide" | "zoom" | "wipe" | "morph",
      "duration": number,
      "easing": "ease-in-out" | "ease-in" | "ease-out" | "linear"
    }
  ]
}

Focus on extracting concrete, actionable specifications from the user's natural language input. If information is missing, make reasonable assumptions based on best practices for motion graphics.`
  }

  private getEnhancePromptTemplate(basicPrompt: string): string {
    return `You are a creative motion graphics expert. Take this basic prompt and enhance it with rich creative details, specific visual elements, and professional motion graphics techniques.

Basic Prompt: "${basicPrompt}"

Enhance this prompt by adding:
1. Specific visual details and imagery
2. Color psychology and palette suggestions
3. Animation techniques and timing
4. Typography and layout considerations
5. Mood and atmosphere details
6. Professional motion graphics effects
7. Audio/music suggestions

Provide an enhanced, detailed prompt that a motion graphics artist could use to create a compelling video. Make it vivid, specific, and technically informed while maintaining the original intent.

Enhanced Prompt:`
  }

  private getGenerateScenesTemplate(spec: MotionSpec): string {
    return `You are a motion graphics director. Based on this specification, create a detailed scene-by-scene breakdown for a ${spec.duration}-second motion graphics video.

Specification:
- Title: ${spec.title}
- Description: ${spec.description}
- Style: ${spec.style}
- Mood: ${spec.mood}
- Aspect Ratio: ${spec.aspectRatio}
- Duration: ${spec.duration} seconds

Create a JSON array of scenes with this structure:
[
  {
    "id": "scene_1",
    "title": "Scene title",
    "description": "What happens in this scene",
    "duration": number (seconds),
    "elements": [
      {
        "type": "text" | "shape" | "image" | "video" | "particle",
        "content": "element content",
        "position": {"x": number, "y": number},
        "size": {"width": number, "height": number},
        "timing": {"start": number, "end": number},
        "animations": [
          {
            "property": "opacity" | "scale" | "position" | "rotation",
            "keyframes": [{"time": number, "value": any, "easing": "string"}],
            "duration": number
          }
        ]
      }
    ],
    "background": {
      "type": "color" | "gradient" | "image",
      "value": "color code or description"
    }
  }
]

Ensure scenes flow logically, timing adds up to ${spec.duration} seconds, and each scene serves the overall narrative. Include smooth transitions between scenes.`
  }

  private getSuggestStylesTemplate(content: string): string {
    return `You are a visual design expert specializing in motion graphics. Based on this content description, suggest 3-5 distinct visual styles that would work well.

Content: "${content}"

For each style, provide a JSON object with this structure:
{
  "name": "Style name",
  "description": "Detailed description of the visual approach",
  "colorPalette": ["#color1", "#color2", "#color3", "#color4"],
  "typography": {
    "primary": "Font family for headlines",
    "secondary": "Font family for body text",
    "accent": "Font family for emphasis"
  },
  "animations": ["animation technique 1", "animation technique 2"],
  "effects": ["visual effect 1", "visual effect 2"],
  "mood": "Overall emotional tone",
  "examples": ["Reference 1", "Reference 2"]
}

Consider:
- Target audience and context
- Brand personality and message
- Technical feasibility
- Current design trends
- Accessibility and readability

Provide an array of style suggestions:`
  }

  // Main AI methods
  async analyzePrompt(userInput: string): Promise<MotionSpec> {
    const prompt = this.getAnalyzePromptTemplate(userInput)

    const response = await withRetry(async () => {
      return await this.makeRequest(
        MODELS.DEEPSEEK_V3,
        [{ role: 'user', content: prompt }],
        { temperature: 0.3, maxTokens: 3000 }
      )
    })

    try {
      const parsed = JSON.parse(response)
      return MotionSpecSchema.parse(parsed)
    } catch (error) {
      throw new OpenRouterError(
        `Failed to parse motion specification: ${error}`,
        undefined,
        MODELS.DEEPSEEK_V3,
        false
      )
    }
  }

  async enhancePrompt(basicPrompt: string): Promise<string> {
    const prompt = this.getEnhancePromptTemplate(basicPrompt)

    const response = await withRetry(async () => {
      return await this.makeRequest(
        MODELS.DEEPSEEK_CHAT,
        [{ role: 'user', content: prompt }],
        { temperature: 0.8, maxTokens: 2000 }
      )
    })

    if (!response || response.trim().length < 50) {
      throw new OpenRouterError(
        'Enhanced prompt is too short or empty',
        undefined,
        MODELS.DEEPSEEK_CHAT,
        false
      )
    }

    return response.trim()
  }

  async generateScenes(spec: MotionSpec): Promise<Scene[]> {
    const prompt = this.getGenerateScenesTemplate(spec)

    const response = await withRetry(async () => {
      return await this.makeRequest(
        MODELS.QWEN_CODER,
        [{ role: 'user', content: prompt }],
        { temperature: 0.4, maxTokens: 4000 }
      )
    })

    try {
      const parsed = JSON.parse(response)
      if (!Array.isArray(parsed)) {
        throw new Error('Response is not an array')
      }

      return parsed.map(scene => SceneSchema.parse(scene))
    } catch (error) {
      throw new OpenRouterError(
        `Failed to parse scenes: ${error}`,
        undefined,
        MODELS.QWEN_CODER,
        false
      )
    }
  }

  async suggestStyles(content: string): Promise<StyleSuggestion[]> {
    const prompt = this.getSuggestStylesTemplate(content)

    const response = await withRetry(async () => {
      return await this.makeRequest(
        MODELS.LLAMA_VISION,
        [{ role: 'user', content: prompt }],
        { temperature: 0.7, maxTokens: 3000 }
      )
    })

    try {
      const parsed = JSON.parse(response)
      if (!Array.isArray(parsed)) {
        throw new Error('Response is not an array')
      }

      return parsed.map(style => StyleSuggestionSchema.parse(style))
    } catch (error) {
      throw new OpenRouterError(
        `Failed to parse style suggestions: ${error}`,
        undefined,
        MODELS.LLAMA_VISION,
        false
      )
    }
  }

  // Utility methods
  async generateColorScheme(description: string): Promise<string[]> {
    const prompt = `Generate a cohesive color palette of 4-6 colors for this motion graphics project: "${description}".

    Consider:
    - Color psychology and mood
    - Accessibility and contrast
    - Modern design trends
    - Brand-appropriate colors

    Return only a JSON array of hex color codes: ["#color1", "#color2", "#color3", "#color4"]`

    const response = await withRetry(async () => {
      return await this.makeRequest(
        MODELS.DEEPSEEK_CHAT,
        [{ role: 'user', content: prompt }],
        { temperature: 0.5, maxTokens: 500 }
      )
    })

    try {
      const colors = JSON.parse(response)
      if (!Array.isArray(colors) || colors.length < 3) {
        throw new Error('Invalid color array')
      }
      return colors
    } catch (error) {
      // Fallback to default color scheme
      return ['#2563eb', '#7c3aed', '#dc2626', '#059669', '#ea580c']
    }
  }

  async calculateTiming(elements: MotionElement[], totalDuration: number): Promise<MotionElement[]> {
    const prompt = `Optimize the timing for these motion graphics elements to fit within ${totalDuration} seconds:

${JSON.stringify(elements, null, 2)}

Rules:
1. Elements should have smooth, natural timing
2. Important elements get more screen time
3. Transitions should feel organic
4. Total duration must not exceed ${totalDuration} seconds
5. Consider animation principles (anticipation, follow-through, etc.)

Return the elements array with optimized timing (start/end times) as JSON.`

    const response = await withRetry(async () => {
      return await this.makeRequest(
        MODELS.QWEN_CODER,
        [{ role: 'user', content: prompt }],
        { temperature: 0.3, maxTokens: 3000 }
      )
    })

    try {
      const optimizedElements = JSON.parse(response)
      if (!Array.isArray(optimizedElements)) {
        throw new Error('Response is not an array')
      }
      return optimizedElements
    } catch (error) {
      // Return original elements if optimization fails
      return elements
    }
  }

  // Batch processing for multiple prompts
  async batchAnalyze(prompts: string[]): Promise<MotionSpec[]> {
    const results = await Promise.allSettled(
      prompts.map(prompt => this.analyzePrompt(prompt))
    )

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value
      } else {
        console.error(`Failed to analyze prompt ${index}:`, result.reason)
        // Return a basic fallback spec
        return {
          title: `Project ${index + 1}`,
          description: prompts[index],
          duration: 10,
          aspectRatio: '16:9' as const,
          style: 'modern',
          mood: 'neutral',
          colorScheme: ['#2563eb', '#7c3aed', '#dc2626'],
          elements: [],
          transitions: [],
        }
      }
    })
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.makeRequest(
        MODELS.DEEPSEEK_CHAT,
        [{ role: 'user', content: 'Respond with "OK" if you can process this request.' }],
        { temperature: 0, maxTokens: 10 }
      )
      return response?.trim().toLowerCase().includes('ok') || false
    } catch (error) {
      console.error('OpenRouter health check failed:', error)
      return false
    }
  }

  // Get model capabilities
  getModelCapabilities() {
    return {
      [MODELS.DEEPSEEK_V3]: {
        name: 'DeepSeek V3',
        strengths: ['Complex reasoning', 'Detailed analysis', 'Creative writing'],
        maxTokens: 8192,
        costPer1kTokens: { input: 0, output: 0 },
        free: true,
      },
      [MODELS.DEEPSEEK_R1]: {
        name: 'DeepSeek R1',
        strengths: ['Reasoning', 'Problem solving', 'Mathematical thinking'],
        maxTokens: 8192,
        costPer1kTokens: { input: 0, output: 0 },
        free: true,
      },
      [MODELS.QWEN_CODER]: {
        name: 'Qwen 3 Coder',
        strengths: ['Code generation', 'Structured output', 'Programming'],
        maxTokens: 8192,
        costPer1kTokens: { input: 0, output: 0 },
        free: true,
      },
      [MODELS.LLAMA_VISION]: {
        name: 'Llama 3.2 11B Vision',
        strengths: ['Visual understanding', 'Image analysis', 'Multimodal reasoning'],
        maxTokens: 4096,
        costPer1kTokens: { input: 0, output: 0 },
        free: true,
      },
      [MODELS.DEEPSEEK_CHAT]: {
        name: 'DeepSeek Chat',
        strengths: ['Conversational AI', 'Creative writing', 'General tasks'],
        maxTokens: 4096,
        costPer1kTokens: { input: 0, output: 0 },
        free: true,
      },
    }
  }
}

// Singleton instance
let openRouterInstance: OpenRouterClient | null = null

export function getOpenRouterClient(): OpenRouterClient {
  if (!openRouterInstance) {
    openRouterInstance = new OpenRouterClient()
  }
  return openRouterInstance
}

// Convenience functions
export async function analyzePrompt(userInput: string): Promise<MotionSpec> {
  return getOpenRouterClient().analyzePrompt(userInput)
}

export async function enhancePrompt(basicPrompt: string): Promise<string> {
  return getOpenRouterClient().enhancePrompt(basicPrompt)
}

export async function generateScenes(spec: MotionSpec): Promise<Scene[]> {
  return getOpenRouterClient().generateScenes(spec)
}

export async function suggestStyles(content: string): Promise<StyleSuggestion[]> {
  return getOpenRouterClient().suggestStyles(content)
}

export async function generateColorScheme(description: string): Promise<string[]> {
  return getOpenRouterClient().generateColorScheme(description)
}

export async function calculateTiming(elements: MotionElement[], totalDuration: number): Promise<MotionElement[]> {
  return getOpenRouterClient().calculateTiming(elements, totalDuration)
}

// Export types for use in other modules
export type {
  MotionSpec,
  MotionElement,
  AnimationSpec,
  TransitionSpec,
  ElementStyle,
  AudioSpec,
  Scene,
  StyleSuggestion,
  TokenUsage,
}

export { OpenRouterError }
