import { User, Project, Template, Render } from '@prisma/client'

export type { User, Project, Template, Render }

export interface ProjectWithDetails extends Project {
  user: Pick<User, 'id' | 'name' | 'image'>
  template?: Pick<Template, 'id' | 'title'>
  renders: Render[]
  _count?: {
    renders: number
  }
}

export interface TemplateWithDetails extends Template {
  user?: Pick<User, 'id' | 'name' | 'image'>
  _count?: {
    projects: number
  }
}

export interface RenderWithProject extends Render {
  project: Pick<Project, 'id' | 'title' | 'userId'>
}

export interface CreateProjectData {
  prompt: string
  style?: string
  duration?: number
  aspectRatio?: '16:9' | '9:16' | '1:1'
}

export interface CreateTemplateData {
  title: string
  description?: string
  category: string
  config: any
  isPublic?: boolean
  tags?: string[]
}

export interface RenderOptions {
  format?: 'mp4' | 'webm' | 'gif'
  quality?: 'low' | 'medium' | 'high' | 'ultra'
  resolution?: '720p' | '1080p' | '4k'
}

export interface MotionGraphicsElement {
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

export interface Scene {
  id: string
  duration: number
  elements: MotionGraphicsElement[]
  transitions: Transition[]
  background: Background
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

export interface MotionGraphicsConfig {
  scenes: Scene[]
  globalSettings: GlobalSettings
  audio?: AudioConfig
}
