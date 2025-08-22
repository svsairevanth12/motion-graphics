import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { 
  analyzePrompt, 
  enhancePrompt, 
  generateScenes, 
  suggestStyles,
  generateColorScheme,
  calculateTiming,
  getOpenRouterClient,
  OpenRouterError
} from '@/lib/ai/openrouter'
import { z } from 'zod'

// Request schemas for different AI operations
const analyzeSchema = z.object({
  action: z.literal('analyze'),
  prompt: z.string().min(1).max(2000),
})

const enhanceSchema = z.object({
  action: z.literal('enhance'),
  prompt: z.string().min(1).max(1000),
})

const generateScenesSchema = z.object({
  action: z.literal('generateScenes'),
  spec: z.object({
    title: z.string(),
    description: z.string(),
    duration: z.number(),
    aspectRatio: z.enum(['16:9', '9:16', '1:1']),
    style: z.string(),
    mood: z.string(),
    colorScheme: z.array(z.string()),
    elements: z.array(z.any()),
    transitions: z.array(z.any()),
  }),
})

const suggestStylesSchema = z.object({
  action: z.literal('suggestStyles'),
  content: z.string().min(1).max(1000),
})

const generateColorSchemeSchema = z.object({
  action: z.literal('generateColorScheme'),
  description: z.string().min(1).max(500),
})

const calculateTimingSchema = z.object({
  action: z.literal('calculateTiming'),
  elements: z.array(z.any()),
  totalDuration: z.number().min(1).max(300),
})

const healthCheckSchema = z.object({
  action: z.literal('healthCheck'),
})

const usageSchema = z.object({
  action: z.literal('usage'),
})

const requestSchema = z.discriminatedUnion('action', [
  analyzeSchema,
  enhanceSchema,
  generateScenesSchema,
  suggestStylesSchema,
  generateColorSchemeSchema,
  calculateTimingSchema,
  healthCheckSchema,
  usageSchema,
])

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = requestSchema.parse(body)

    const client = getOpenRouterClient()

    switch (data.action) {
      case 'analyze': {
        const result = await analyzePrompt(data.prompt)
        return NextResponse.json({
          success: true,
          data: result,
        })
      }

      case 'enhance': {
        const result = await enhancePrompt(data.prompt)
        return NextResponse.json({
          success: true,
          data: { enhancedPrompt: result },
        })
      }

      case 'generateScenes': {
        const result = await generateScenes(data.spec)
        return NextResponse.json({
          success: true,
          data: { scenes: result },
        })
      }

      case 'suggestStyles': {
        const result = await suggestStyles(data.content)
        return NextResponse.json({
          success: true,
          data: { styles: result },
        })
      }

      case 'generateColorScheme': {
        const result = await generateColorScheme(data.description)
        return NextResponse.json({
          success: true,
          data: { colors: result },
        })
      }

      case 'calculateTiming': {
        const result = await calculateTiming(data.elements, data.totalDuration)
        return NextResponse.json({
          success: true,
          data: { elements: result },
        })
      }

      case 'healthCheck': {
        const isHealthy = await client.healthCheck()
        return NextResponse.json({
          success: true,
          data: { 
            healthy: isHealthy,
            models: client.getModelCapabilities(),
          },
        })
      }

      case 'usage': {
        const usage = client.getTokenUsage()
        return NextResponse.json({
          success: true,
          data: usage,
        })
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('AI API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid request format', 
          details: error.errors 
        },
        { status: 400 }
      )
    }

    if (error instanceof OpenRouterError) {
      return NextResponse.json(
        { 
          error: error.message,
          model: error.model,
          retryable: error.retryable,
        },
        { status: error.statusCode || 500 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint for health checks and usage stats
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    const client = getOpenRouterClient()

    if (action === 'health') {
      const isHealthy = await client.healthCheck()
      return NextResponse.json({
        success: true,
        healthy: isHealthy,
        models: client.getModelCapabilities(),
        timestamp: new Date().toISOString(),
      })
    }

    if (action === 'usage') {
      const usage = client.getTokenUsage()
      return NextResponse.json({
        success: true,
        usage,
        timestamp: new Date().toISOString(),
      })
    }

    return NextResponse.json(
      { error: 'Invalid action. Use ?action=health or ?action=usage' },
      { status: 400 }
    )
  } catch (error) {
    console.error('AI API GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
