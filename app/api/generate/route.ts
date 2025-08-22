import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/database'
import { analyzePrompt, enhancePrompt, generateScenes, suggestStyles } from '@/lib/ai/openrouter'
import { z } from 'zod'

const generateSchema = z.object({
  prompt: z.string().min(1).max(1000),
  style: z.string().optional(),
  duration: z.number().min(1).max(300).optional().default(10),
  aspectRatio: z.enum(['16:9', '9:16', '1:1']).optional().default('16:9'),
  enhancePrompt: z.boolean().optional().default(false),
  generateStyles: z.boolean().optional().default(false),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { prompt, style, duration, aspectRatio, enhancePrompt: shouldEnhance, generateStyles } = generateSchema.parse(body)

    let finalPrompt = prompt
    let styleOptions = []

    // Enhance prompt if requested
    if (shouldEnhance) {
      try {
        finalPrompt = await enhancePrompt(prompt)
      } catch (error) {
        console.warn('Failed to enhance prompt, using original:', error)
      }
    }

    // Generate style suggestions if requested
    if (generateStyles) {
      try {
        styleOptions = await suggestStyles(finalPrompt)
      } catch (error) {
        console.warn('Failed to generate styles:', error)
      }
    }

    // Analyze the prompt to get motion graphics specification
    const motionSpec = await analyzePrompt(finalPrompt)

    // Override user-specified parameters
    if (style) motionSpec.style = style
    motionSpec.duration = duration
    motionSpec.aspectRatio = aspectRatio

    // Generate detailed scenes
    const scenes = await generateScenes(motionSpec)

    // Create the final configuration
    const config = {
      ...motionSpec,
      scenes,
      metadata: {
        originalPrompt: prompt,
        enhancedPrompt: shouldEnhance ? finalPrompt : null,
        styleOptions: generateStyles ? styleOptions : null,
        generatedAt: new Date().toISOString(),
      }
    }

    // Create project in database
    const project = await prisma.project.create({
      data: {
        title: `Generated: ${prompt.slice(0, 50)}...`,
        description: prompt,
        userId: session.user.id,
        config,
        status: 'DRAFT',
        duration,
      },
    })

    return NextResponse.json({
      success: true,
      project: {
        id: project.id,
        title: project.title,
        config: project.config,
      },
      metadata: {
        enhancedPrompt: shouldEnhance ? finalPrompt : null,
        styleOptions: generateStyles ? styleOptions : null,
      },
    })
  } catch (error) {
    console.error('Generation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to generate motion graphics' },
      { status: 500 }
    )
  }
}
