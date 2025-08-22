import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/database'
import { renderQueue } from '@/lib/queue/render-queue'
import { z } from 'zod'

const renderSchema = z.object({
  projectId: z.string(),
  format: z.enum(['mp4', 'webm', 'gif']).optional().default('mp4'),
  quality: z.enum(['low', 'medium', 'high', 'ultra']).optional().default('high'),
  resolution: z.enum(['720p', '1080p', '4k']).optional().default('1080p'),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { projectId, format, quality, resolution } = renderSchema.parse(body)

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id,
      },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Create render record
    const render = await prisma.render.create({
      data: {
        projectId,
        status: 'PENDING',
        progress: 0,
      },
    })

    // Add to render queue
    await renderQueue.add('render-video', {
      renderId: render.id,
      projectId,
      config: project.config,
      format,
      quality,
      resolution,
      userId: session.user.id,
    })

    // Update project status
    await prisma.project.update({
      where: { id: projectId },
      data: { status: 'RENDERING' },
    })

    return NextResponse.json({
      success: true,
      render: {
        id: render.id,
        status: render.status,
        progress: render.progress,
      },
    })
  } catch (error) {
    console.error('Render error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to start render' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const renderId = searchParams.get('id')

    if (!renderId) {
      return NextResponse.json({ error: 'Render ID required' }, { status: 400 })
    }

    const render = await prisma.render.findFirst({
      where: {
        id: renderId,
        project: {
          userId: session.user.id,
        },
      },
      include: {
        project: true,
      },
    })

    if (!render) {
      return NextResponse.json({ error: 'Render not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      render: {
        id: render.id,
        status: render.status,
        progress: render.progress,
        videoUrl: render.videoUrl,
        errorMessage: render.errorMessage,
        startedAt: render.startedAt,
        completedAt: render.completedAt,
      },
    })
  } catch (error) {
    console.error('Render status error:', error)
    return NextResponse.json(
      { error: 'Failed to get render status' },
      { status: 500 }
    )
  }
}
