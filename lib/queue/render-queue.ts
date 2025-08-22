import { Queue, Worker } from 'bullmq'
import Redis from 'ioredis'
import { prisma } from '@/lib/database'
import { renderVideo } from '@/lib/motion-engine/renderer'

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

export const renderQueue = new Queue('render', {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: 10,
    removeOnFail: 5,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
})

export interface RenderJobData {
  renderId: string
  projectId: string
  config: any
  format: 'mp4' | 'webm' | 'gif'
  quality: 'low' | 'medium' | 'high' | 'ultra'
  resolution: '720p' | '1080p' | '4k'
  userId: string
}

// Worker to process render jobs
const renderWorker = new Worker(
  'render',
  async (job) => {
    const data = job.data as RenderJobData
    
    try {
      // Update render status to processing
      await prisma.render.update({
        where: { id: data.renderId },
        data: {
          status: 'PROCESSING',
          startedAt: new Date(),
        },
      })

      // Update project status
      await prisma.project.update({
        where: { id: data.projectId },
        data: { status: 'RENDERING' },
      })

      // Progress callback
      const onProgress = async (progress: number) => {
        await job.updateProgress(progress)
        await prisma.render.update({
          where: { id: data.renderId },
          data: { progress },
        })
      }

      // Render the video
      const videoUrl = await renderVideo(data.config, {
        format: data.format,
        quality: data.quality,
        resolution: data.resolution,
        onProgress,
      })

      // Update render status to completed
      await prisma.render.update({
        where: { id: data.renderId },
        data: {
          status: 'COMPLETED',
          progress: 100,
          videoUrl,
          completedAt: new Date(),
        },
      })

      // Update project status and video URL
      await prisma.project.update({
        where: { id: data.projectId },
        data: {
          status: 'COMPLETED',
          videoUrl,
        },
      })

      return { videoUrl }
    } catch (error) {
      console.error('Render job failed:', error)
      
      // Update render status to failed
      await prisma.render.update({
        where: { id: data.renderId },
        data: {
          status: 'FAILED',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          completedAt: new Date(),
        },
      })

      // Update project status
      await prisma.project.update({
        where: { id: data.projectId },
        data: { status: 'FAILED' },
      })

      throw error
    }
  },
  {
    connection: redis,
    concurrency: 2, // Process 2 renders simultaneously
  }
)

renderWorker.on('completed', (job) => {
  console.log(`Render job ${job.id} completed`)
})

renderWorker.on('failed', (job, err) => {
  console.error(`Render job ${job?.id} failed:`, err)
})

export { renderWorker }
