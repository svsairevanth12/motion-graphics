import { MotionProject, MotionScene } from './core'
import { getSceneComposer } from './scene-composer'
import { getMotionEngine } from './core'

export interface RenderOptions {
  format: 'mp4' | 'webm' | 'gif' | 'lottie' | 'frames'
  quality: 'draft' | 'preview' | 'low' | 'medium' | 'high' | 'ultra'
  resolution: '480p' | '720p' | '1080p' | '1440p' | '4k'
  fps?: number
  onProgress?: (progress: number, stage: string) => void
  onStageChange?: (stage: RenderStage) => void
  outputPath?: string
  preview?: boolean
}

export interface RenderJob {
  id: string
  project: MotionProject
  options: RenderOptions
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  currentStage: RenderStage
  startTime?: Date
  endTime?: Date
  outputUrl?: string
  error?: string
}

export type RenderStage =
  | 'initializing'
  | 'composing'
  | 'rendering'
  | 'encoding'
  | 'optimizing'
  | 'finalizing'

export interface RenderStats {
  totalFrames: number
  renderedFrames: number
  averageFrameTime: number
  estimatedTimeRemaining: number
  memoryUsage: number
  cpuUsage: number
}

export class MotionRenderer {
  private jobs = new Map<string, RenderJob>()
  private activeJobs = new Set<string>()
  private maxConcurrentJobs = 2
  private sceneComposer = getSceneComposer()
  private motionEngine = getMotionEngine()

  // Main rendering method
  async renderProject(
    project: MotionProject,
    options: RenderOptions
  ): Promise<string> {
    const jobId = this.generateId()
    const job: RenderJob = {
      id: jobId,
      project,
      options,
      status: 'pending',
      progress: 0,
      currentStage: 'initializing',
      startTime: new Date(),
    }

    this.jobs.set(jobId, job)

    try {
      if (options.preview) {
        return await this.renderPreview(job)
      } else {
        return await this.renderFinal(job)
      }
    } catch (error) {
      job.status = 'failed'
      job.error = error instanceof Error ? error.message : 'Unknown error'
      job.endTime = new Date()
      throw error
    }
  }

  private async renderPreview(job: RenderJob): Promise<string> {
    this.updateJobStage(job, 'composing')

    // Generate preview frames (lower quality, fewer frames)
    const previewFrames = Math.min(job.project.duration, 150) // Max 5 seconds at 30fps
    const frameStep = Math.max(1, Math.floor(job.project.duration / previewFrames))

    const frames: string[] = []

    for (let frame = 0; frame < job.project.duration; frame += frameStep) {
      const frameData = await this.renderFrame(job.project, frame, true)
      frames.push(frameData)

      const progress = (frame / job.project.duration) * 100
      this.updateJobProgress(job, progress)
    }

    this.updateJobStage(job, 'finalizing')

    // For preview, return a data URL or temporary URL
    const previewUrl = await this.createPreviewVideo(frames, job.options)

    job.status = 'completed'
    job.outputUrl = previewUrl
    job.endTime = new Date()

    return previewUrl
  }

  private async renderFinal(job: RenderJob): Promise<string> {
    this.updateJobStage(job, 'composing')

    // Load project into motion engine
    this.motionEngine.loadProject(job.project)

    const totalFrames = job.project.duration
    const frames: string[] = []

    this.updateJobStage(job, 'rendering')

    // Render all frames
    for (let frame = 0; frame < totalFrames; frame++) {
      const frameData = await this.renderFrame(job.project, frame, false)
      frames.push(frameData)

      const progress = (frame / totalFrames) * 80 // 80% for rendering
      this.updateJobProgress(job, progress)

      job.options.onProgress?.(progress, 'rendering')
    }

    this.updateJobStage(job, 'encoding')

    // Encode video
    const videoUrl = await this.encodeVideo(frames, job.options)

    this.updateJobProgress(job, 90)

    this.updateJobStage(job, 'optimizing')

    // Optimize output
    const optimizedUrl = await this.optimizeOutput(videoUrl, job.options)

    this.updateJobProgress(job, 100)

    this.updateJobStage(job, 'finalizing')

    job.status = 'completed'
    job.outputUrl = optimizedUrl
    job.endTime = new Date()

    return optimizedUrl
  }

  private async renderFrame(
    project: MotionProject,
    frame: number,
    preview: boolean = false
  ): Promise<string> {
    // Find active scene at this frame
    const activeScene = this.findActiveScene(project, frame)
    if (!activeScene) {
      return this.createBlankFrame(project.width, project.height)
    }

    // Compose the scene
    const composition = this.sceneComposer.composeScene(activeScene, frame)

    // Render composition to canvas/image data
    const frameData = await this.renderComposition(composition, preview)

    return frameData
  }

  private findActiveScene(project: MotionProject, frame: number): MotionScene | null {
    return project.scenes.find(scene =>
      frame >= scene.startFrame && frame <= scene.endFrame
    ) || null
  }

  private async renderComposition(composition: any, preview: boolean): Promise<string> {
    // This would integrate with Remotion or canvas rendering
    // For now, return a placeholder
    return `data:image/png;base64,${this.generatePlaceholderFrame()}`
  }

  private createBlankFrame(width: number, height: number): string {
    // Create a blank frame
    return `data:image/png;base64,${this.generatePlaceholderFrame()}`
  }

  private generatePlaceholderFrame(): string {
    // Generate a base64 encoded placeholder frame
    return 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
  }

  private async createPreviewVideo(frames: string[], options: RenderOptions): Promise<string> {
    // Create a preview video from frames
    // This would use FFmpeg or similar
    return `/api/previews/${this.generateId()}.${options.format}`
  }

  private async encodeVideo(frames: string[], options: RenderOptions): Promise<string> {
    // Encode frames into video using FFmpeg
    const { format, quality, resolution } = options
    const dimensions = this.getResolutionDimensions(resolution)
    const qualitySettings = this.getQualitySettings(quality)

    // This would call FFmpeg with appropriate settings
    return `/api/videos/${this.generateId()}.${format}`
  }

  private async optimizeOutput(videoUrl: string, options: RenderOptions): Promise<string> {
    // Optimize the output video
    if (options.format === 'gif') {
      return this.optimizeGif(videoUrl)
    } else if (options.format === 'lottie') {
      return this.generateLottie(videoUrl)
    }

    return videoUrl
  }

  private async optimizeGif(videoUrl: string): Promise<string> {
    // Convert video to optimized GIF
    return videoUrl.replace('.mp4', '.gif')
  }

  private async generateLottie(videoUrl: string): Promise<string> {
    // Generate Lottie animation from video
    return videoUrl.replace('.mp4', '.json')
  }

  // Job management
  private updateJobStage(job: RenderJob, stage: RenderStage): void {
    job.currentStage = stage
    job.options.onStageChange?.(stage)
  }

  private updateJobProgress(job: RenderJob, progress: number): void {
    job.progress = Math.min(100, Math.max(0, progress))
  }

  // Utility methods
  getResolutionDimensions(resolution: string) {
    switch (resolution) {
      case '480p':
        return { width: 854, height: 480 }
      case '720p':
        return { width: 1280, height: 720 }
      case '1080p':
        return { width: 1920, height: 1080 }
      case '1440p':
        return { width: 2560, height: 1440 }
      case '4k':
        return { width: 3840, height: 2160 }
      default:
        return { width: 1920, height: 1080 }
    }
  }

  getQualitySettings(quality: string) {
    switch (quality) {
      case 'draft':
        return { bitrate: '500K', crf: 35, preset: 'ultrafast' }
      case 'preview':
        return { bitrate: '1M', crf: 30, preset: 'fast' }
      case 'low':
        return { bitrate: '2M', crf: 28, preset: 'medium' }
      case 'medium':
        return { bitrate: '4M', crf: 23, preset: 'medium' }
      case 'high':
        return { bitrate: '8M', crf: 18, preset: 'slow' }
      case 'ultra':
        return { bitrate: '16M', crf: 15, preset: 'slower' }
      default:
        return { bitrate: '4M', crf: 23, preset: 'medium' }
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  // Public methods for job management
  getJob(jobId: string): RenderJob | undefined {
    return this.jobs.get(jobId)
  }

  getAllJobs(): RenderJob[] {
    return Array.from(this.jobs.values())
  }

  cancelJob(jobId: string): boolean {
    const job = this.jobs.get(jobId)
    if (job && job.status === 'processing') {
      job.status = 'failed'
      job.error = 'Cancelled by user'
      job.endTime = new Date()
      this.activeJobs.delete(jobId)
      return true
    }
    return false
  }

  clearCompletedJobs(): void {
    for (const [jobId, job] of this.jobs.entries()) {
      if (job.status === 'completed' || job.status === 'failed') {
        this.jobs.delete(jobId)
      }
    }
  }
}

// Singleton instance
let motionRendererInstance: MotionRenderer | null = null

export function getMotionRenderer(): MotionRenderer {
  if (!motionRendererInstance) {
    motionRendererInstance = new MotionRenderer()
  }
  return motionRendererInstance
}

// Convenience functions
export async function renderVideo(
  project: MotionProject,
  options: RenderOptions
): Promise<string> {
  return getMotionRenderer().renderProject(project, options)
}

export default MotionRenderer
