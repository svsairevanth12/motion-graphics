import { z } from 'zod'
import { interpolate, spring, Easing } from 'remotion'

// Core types for the motion graphics engine
export interface MotionProject {
  id: string
  title: string
  description?: string
  duration: number // in frames
  fps: number
  width: number
  height: number
  backgroundColor: string
  scenes: MotionScene[]
  globalSettings: GlobalSettings
  metadata: ProjectMetadata
}

export interface MotionScene {
  id: string
  title: string
  startFrame: number
  endFrame: number
  duration: number
  elements: MotionElement[]
  background: SceneBackground
  transitions: SceneTransition[]
  camera?: CameraSettings
}

export interface MotionElement {
  id: string
  type: ElementType
  name: string
  startFrame: number
  endFrame: number
  layer: number
  visible: boolean
  locked: boolean
  properties: ElementProperties
  animations: Animation[]
  effects: Effect[]
}

export type ElementType = 
  | 'text' 
  | 'shape' 
  | 'image' 
  | 'video' 
  | 'audio'
  | 'particle'
  | 'logo'
  | 'group'

export interface ElementProperties {
  position: { x: number; y: number; z?: number }
  scale: { x: number; y: number; z?: number }
  rotation: { x: number; y: number; z: number }
  opacity: number
  anchor: { x: number; y: number }
  size: { width: number; height: number }
  [key: string]: any // Allow custom properties
}

export interface Animation {
  id: string
  property: string
  keyframes: Keyframe[]
  easing: EasingType
  duration: number
  delay: number
  loop: boolean
  yoyo: boolean
}

export interface Keyframe {
  frame: number
  value: any
  easing?: EasingType
  tension?: number
  friction?: number
}

export type EasingType = 
  | 'linear'
  | 'ease'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'spring'
  | 'bounce'
  | 'elastic'
  | 'back'
  | 'cubic-bezier'

export interface Effect {
  id: string
  type: EffectType
  enabled: boolean
  parameters: Record<string, any>
  startFrame?: number
  endFrame?: number
}

export type EffectType =
  | 'blur'
  | 'glow'
  | 'shadow'
  | 'outline'
  | 'gradient'
  | 'noise'
  | 'distortion'
  | 'color-correction'
  | 'chromatic-aberration'

export interface SceneBackground {
  type: 'color' | 'gradient' | 'image' | 'video'
  value: string | GradientBackground | MediaBackground
}

export interface GradientBackground {
  type: 'linear' | 'radial'
  colors: Array<{ color: string; position: number }>
  angle?: number
  center?: { x: number; y: number }
}

export interface MediaBackground {
  src: string
  fit: 'cover' | 'contain' | 'fill' | 'stretch'
  position: { x: number; y: number }
  scale: number
  opacity: number
}

export interface SceneTransition {
  id: string
  type: TransitionType
  duration: number
  easing: EasingType
  direction?: 'in' | 'out' | 'cross'
  parameters: Record<string, any>
}

export type TransitionType =
  | 'fade'
  | 'slide'
  | 'zoom'
  | 'wipe'
  | 'morph'
  | 'dissolve'
  | 'push'
  | 'reveal'
  | 'iris'
  | 'flip'

export interface CameraSettings {
  position: { x: number; y: number; z: number }
  target: { x: number; y: number; z: number }
  fov: number
  near: number
  far: number
  animations: Animation[]
}

export interface GlobalSettings {
  motionBlur: boolean
  antialiasing: boolean
  quality: 'draft' | 'preview' | 'final'
  colorSpace: 'sRGB' | 'Rec2020' | 'P3'
  frameRate: number
  audioSettings: AudioSettings
}

export interface AudioSettings {
  sampleRate: number
  bitDepth: number
  channels: number
  masterVolume: number
}

export interface ProjectMetadata {
  createdAt: Date
  updatedAt: Date
  version: string
  author?: string
  tags: string[]
  thumbnail?: string
}

// Validation schemas
export const MotionProjectSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  duration: z.number().positive(),
  fps: z.number().positive(),
  width: z.number().positive(),
  height: z.number().positive(),
  backgroundColor: z.string(),
  scenes: z.array(z.any()),
  globalSettings: z.any(),
  metadata: z.any(),
})

// Core motion graphics engine class
export class MotionEngine {
  private project: MotionProject | null = null
  private currentFrame: number = 0
  private isPlaying: boolean = false
  private playbackSpeed: number = 1
  private previewQuality: 'low' | 'medium' | 'high' = 'medium'
  
  // Event system
  private eventListeners: Map<string, Function[]> = new Map()

  constructor() {
    this.initializeEngine()
  }

  private initializeEngine() {
    // Initialize the motion graphics engine
    this.setupEventSystem()
  }

  private setupEventSystem() {
    // Set up event listeners for real-time updates
    const events = [
      'frameUpdate',
      'playbackStateChange',
      'projectLoad',
      'elementUpdate',
      'sceneChange',
      'renderProgress'
    ]
    
    events.forEach(event => {
      this.eventListeners.set(event, [])
    })
  }

  // Project management
  loadProject(project: MotionProject): void {
    this.project = MotionProjectSchema.parse(project)
    this.currentFrame = 0
    this.emit('projectLoad', this.project)
  }

  createProject(config: Partial<MotionProject>): MotionProject {
    const defaultProject: MotionProject = {
      id: this.generateId(),
      title: 'Untitled Project',
      duration: 300, // 10 seconds at 30fps
      fps: 30,
      width: 1920,
      height: 1080,
      backgroundColor: '#000000',
      scenes: [],
      globalSettings: {
        motionBlur: true,
        antialiasing: true,
        quality: 'preview',
        colorSpace: 'sRGB',
        frameRate: 30,
        audioSettings: {
          sampleRate: 48000,
          bitDepth: 24,
          channels: 2,
          masterVolume: 1.0,
        },
      },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0.0',
        tags: [],
      },
      ...config,
    }

    this.loadProject(defaultProject)
    return defaultProject
  }

  getProject(): MotionProject | null {
    return this.project
  }

  // Playback control
  play(): void {
    if (!this.project) return
    this.isPlaying = true
    this.emit('playbackStateChange', { playing: true, frame: this.currentFrame })
  }

  pause(): void {
    this.isPlaying = false
    this.emit('playbackStateChange', { playing: false, frame: this.currentFrame })
  }

  stop(): void {
    this.isPlaying = false
    this.currentFrame = 0
    this.emit('playbackStateChange', { playing: false, frame: this.currentFrame })
  }

  seekToFrame(frame: number): void {
    if (!this.project) return
    this.currentFrame = Math.max(0, Math.min(frame, this.project.duration))
    this.emit('frameUpdate', this.currentFrame)
  }

  setPlaybackSpeed(speed: number): void {
    this.playbackSpeed = Math.max(0.1, Math.min(speed, 4.0))
  }

  // Frame calculation and interpolation
  calculateElementPropertiesAtFrame(element: MotionElement, frame: number): ElementProperties {
    const properties = { ...element.properties }
    
    // Apply animations
    element.animations.forEach(animation => {
      const animatedValue = this.calculateAnimationValue(animation, frame)
      if (animatedValue !== undefined) {
        this.setNestedProperty(properties, animation.property, animatedValue)
      }
    })

    return properties
  }

  private calculateAnimationValue(animation: Animation, frame: number): any {
    if (animation.keyframes.length === 0) return undefined
    
    const adjustedFrame = frame - animation.delay
    if (adjustedFrame < 0) return undefined

    // Handle looping
    let currentFrame = adjustedFrame
    if (animation.loop && animation.duration > 0) {
      currentFrame = adjustedFrame % animation.duration
      if (animation.yoyo && Math.floor(adjustedFrame / animation.duration) % 2 === 1) {
        currentFrame = animation.duration - currentFrame
      }
    }

    // Find surrounding keyframes
    const keyframes = animation.keyframes.sort((a, b) => a.frame - b.frame)
    
    if (currentFrame <= keyframes[0].frame) {
      return keyframes[0].value
    }
    
    if (currentFrame >= keyframes[keyframes.length - 1].frame) {
      return keyframes[keyframes.length - 1].value
    }

    // Interpolate between keyframes
    for (let i = 0; i < keyframes.length - 1; i++) {
      const current = keyframes[i]
      const next = keyframes[i + 1]
      
      if (currentFrame >= current.frame && currentFrame <= next.frame) {
        const progress = (currentFrame - current.frame) / (next.frame - current.frame)
        const easedProgress = this.applyEasing(progress, next.easing || animation.easing)
        
        return this.interpolateValue(current.value, next.value, easedProgress)
      }
    }

    return undefined
  }

  private applyEasing(progress: number, easing: EasingType): number {
    switch (easing) {
      case 'linear':
        return progress
      case 'ease':
        return interpolate(progress, [0, 1], [0, 1], { easing: Easing.ease })
      case 'ease-in':
        return interpolate(progress, [0, 1], [0, 1], { easing: Easing.in(Easing.ease) })
      case 'ease-out':
        return interpolate(progress, [0, 1], [0, 1], { easing: Easing.out(Easing.ease) })
      case 'ease-in-out':
        return interpolate(progress, [0, 1], [0, 1], { easing: Easing.inOut(Easing.ease) })
      case 'spring':
        return spring({ frame: progress * 30, fps: 30 })
      case 'bounce':
        return interpolate(progress, [0, 1], [0, 1], { easing: Easing.bounce })
      default:
        return progress
    }
  }

  private interpolateValue(from: any, to: any, progress: number): any {
    if (typeof from === 'number' && typeof to === 'number') {
      return interpolate(progress, [0, 1], [from, to])
    }
    
    if (typeof from === 'object' && typeof to === 'object') {
      const result: any = {}
      for (const key in from) {
        if (key in to) {
          result[key] = this.interpolateValue(from[key], to[key], progress)
        } else {
          result[key] = from[key]
        }
      }
      return result
    }
    
    return progress < 0.5 ? from : to
  }

  private setNestedProperty(obj: any, path: string, value: any): void {
    const keys = path.split('.')
    let current = obj
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!(keys[i] in current)) {
        current[keys[i]] = {}
      }
      current = current[keys[i]]
    }
    
    current[keys[keys.length - 1]] = value
  }

  // Event system
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(callback)
  }

  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach(callback => callback(data))
    }
  }

  // Utility methods
  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  getCurrentFrame(): number {
    return this.currentFrame
  }

  isProjectPlaying(): boolean {
    return this.isPlaying
  }

  getPlaybackSpeed(): number {
    return this.playbackSpeed
  }

  setPreviewQuality(quality: 'low' | 'medium' | 'high'): void {
    this.previewQuality = quality
  }

  getPreviewQuality(): 'low' | 'medium' | 'high' {
    return this.previewQuality
  }
}

// Singleton instance
let motionEngineInstance: MotionEngine | null = null

export function getMotionEngine(): MotionEngine {
  if (!motionEngineInstance) {
    motionEngineInstance = new MotionEngine()
  }
  return motionEngineInstance
}

export default MotionEngine
