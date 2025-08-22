import OpenAI from 'openai'

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set in environment variables')
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface MotionGraphicsConfig {
  scenes: Scene[]
  globalSettings: GlobalSettings
  audio?: AudioConfig
}

export interface Scene {
  id: string
  duration: number
  elements: Element[]
  transitions: Transition[]
  background: Background
}

export interface Element {
  id: string
  type: 'text' | 'shape' | 'image' | 'video'
  properties: Record<string, any>
  animations: Animation[]
  startTime: number
  endTime: number
}

export interface Animation {
  property: string
  keyframes: Keyframe[]
  easing: string
}

export interface Keyframe {
  time: number
  value: any
}

export interface Transition {
  type: 'fade' | 'slide' | 'zoom' | 'wipe'
  duration: number
  easing: string
}

export interface Background {
  type: 'color' | 'gradient' | 'image' | 'video'
  value: string | GradientConfig
}

export interface GradientConfig {
  type: 'linear' | 'radial'
  colors: string[]
  direction?: number
}

export interface GlobalSettings {
  width: number
  height: number
  fps: number
  duration: number
  backgroundColor: string
}

export interface AudioConfig {
  url?: string
  volume: number
  fadeIn?: number
  fadeOut?: number
}

export async function generateMotionGraphicsConfig(
  prompt: string,
  options: {
    style?: string
    duration?: number
    aspectRatio?: string
  } = {}
): Promise<MotionGraphicsConfig> {
  const { style = 'modern', duration = 10, aspectRatio = '16:9' } = options

  const [width, height] = aspectRatio === '16:9' 
    ? [1920, 1080]
    : aspectRatio === '9:16'
    ? [1080, 1920]
    : [1080, 1080]

  const systemPrompt = `You are an AI that generates motion graphics configurations for video creation.
  Create a detailed JSON configuration that includes scenes, elements, animations, and transitions.
  
  The configuration should be optimized for ${style} style and ${duration} seconds duration.
  Use ${width}x${height} resolution (${aspectRatio} aspect ratio).
  
  Include:
  - Multiple scenes with smooth transitions
  - Text elements with typography animations
  - Shape elements with geometric animations
  - Color schemes that match the style
  - Timing that creates engaging pacing
  - Professional easing functions
  
  Return only valid JSON that matches the MotionGraphicsConfig interface.`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 4000,
  })

  const configText = completion.choices[0]?.message?.content
  if (!configText) {
    throw new Error('Failed to generate configuration')
  }

  try {
    return JSON.parse(configText) as MotionGraphicsConfig
  } catch (error) {
    throw new Error('Invalid configuration generated')
  }
}
