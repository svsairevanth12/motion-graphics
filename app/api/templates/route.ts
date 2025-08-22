import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/database'
import { z } from 'zod'

const templateSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  category: z.string().min(1),
  config: z.object({}).passthrough(),
  isPublic: z.boolean().optional().default(false),
  tags: z.array(z.string()).optional().default([]),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const isPublic = searchParams.get('public') === 'true'
    const userId = searchParams.get('userId')

    const where: any = {}
    
    if (category) {
      where.category = category
    }
    
    if (isPublic) {
      where.isPublic = true
    } else if (userId) {
      where.OR = [
        { isPublic: true },
        { userId }
      ]
    }

    const templates = await prisma.template.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            projects: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      success: true,
      templates: templates.map(template => ({
        id: template.id,
        title: template.title,
        description: template.description,
        category: template.category,
        thumbnailUrl: template.thumbnailUrl,
        isPublic: template.isPublic,
        tags: template.tags,
        author: template.user,
        usageCount: template._count.projects,
        createdAt: template.createdAt,
      })),
    })
  } catch (error) {
    console.error('Templates fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, category, config, isPublic, tags } = templateSchema.parse(body)

    const template = await prisma.template.create({
      data: {
        title,
        description,
        category,
        config,
        isPublic,
        tags,
        userId: session.user.id,
      },
    })

    return NextResponse.json({
      success: true,
      template: {
        id: template.id,
        title: template.title,
        description: template.description,
        category: template.category,
        isPublic: template.isPublic,
        tags: template.tags,
      },
    })
  } catch (error) {
    console.error('Template creation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    )
  }
}
