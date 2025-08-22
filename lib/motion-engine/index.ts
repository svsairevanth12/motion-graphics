// Core engine exports
export {
  MotionEngine,
  getMotionEngine,
  type MotionProject,
  type MotionScene,
  type MotionElement,
  type ElementType,
  type ElementProperties,
  type Animation,
  type Keyframe,
  type EasingType,
  type Effect,
  type EffectType,
  type SceneBackground,
  type SceneTransition,
  type TransitionType,
  type CameraSettings,
  type GlobalSettings,
  type AudioSettings,
  type ProjectMetadata,
} from './core'

// Scene composition exports
export {
  SceneComposer,
  getSceneComposer,
  type CompositionLayer,
  type BlendMode,
  type MaskSettings,
  type SceneComposition,
  type ActiveTransition,
} from './scene-composer'

// Timeline management exports
export {
  TimelineManager,
  getTimelineManager,
  type TimelineState,
  type TimelineTrack,
  type TimelineAnimation,
  type TimelineKeyframe,
  type TimelineMarker,
  type TimelineSelection,
} from './timeline'

// Transition system exports
export {
  TransitionSystem,
  getTransitionSystem,
  type TransitionEffect,
  type TransitionPreset,
} from './transitions'

// Effects library exports
export {
  EffectLibrary,
  getEffectLibrary,
  type EffectDefinition,
  type EffectParameter,
  type EffectPreset,
} from './effects'

// Rendering pipeline exports
export {
  MotionRenderer,
  getMotionRenderer,
  renderVideo,
  type RenderOptions,
  type RenderJob,
  type RenderStage,
  type RenderStats,
} from './renderer'

// Customization layer exports
export {
  CustomizationEngine,
  getCustomizationEngine,
  type PropertyBinding,
  type PropertyController,
  type CustomizationPreset,
  type UndoRedoState,
} from './customization'

// Animation components exports
export {
  TextAnimation,
  TextAnimationPresets,
  type TextAnimationProps,
} from './components/text-animation'

export {
  ShapeAnimation,
  ShapeAnimationPresets,
  type ShapeAnimationProps,
} from './components/shape-animation'

export {
  ParticleSystem,
  ParticleSystemPresets,
  type ParticleSystemProps,
} from './components/particle-system'

export {
  ImageAnimation,
  ImageAnimationPresets,
  type ImageAnimationProps,
} from './components/image-animation'

export {
  LogoAnimation,
  LogoAnimationPresets,
  type LogoAnimationProps,
} from './components/logo-animation'

// Utility functions and helpers
export const MotionEngineUtils = {
  // Project creation helpers
  createProject: (config: Partial<MotionProject> = {}) => {
    const engine = getMotionEngine()
    return engine.createProject(config)
  },

  // Scene creation helpers
  createScene: (config: Partial<MotionScene> = {}): MotionScene => {
    return {
      id: generateId(),
      title: 'New Scene',
      startFrame: 0,
      endFrame: 120,
      duration: 120,
      elements: [],
      background: { type: 'color', value: '#000000' },
      transitions: [],
      ...config,
    }
  },

  // Element creation helpers
  createElement: (type: ElementType, config: Partial<MotionElement> = {}): MotionElement => {
    return {
      id: generateId(),
      type,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Element`,
      startFrame: 0,
      endFrame: 120,
      layer: 0,
      visible: true,
      locked: false,
      properties: {
        position: { x: 0, y: 0 },
        scale: { x: 1, y: 1 },
        rotation: { x: 0, y: 0, z: 0 },
        opacity: 1,
        anchor: { x: 0.5, y: 0.5 },
        size: { width: 100, height: 100 },
      },
      animations: [],
      effects: [],
      ...config,
    }
  },

  // Animation creation helpers
  createAnimation: (property: string, keyframes: Keyframe[], config: Partial<Animation> = {}): Animation => {
    return {
      id: generateId(),
      property,
      keyframes,
      easing: 'ease',
      duration: 60,
      delay: 0,
      loop: false,
      yoyo: false,
      ...config,
    }
  },

  // Keyframe creation helpers
  createKeyframe: (frame: number, value: any, config: Partial<Keyframe> = {}): Keyframe => {
    return {
      frame,
      value,
      ...config,
    }
  },

  // Effect creation helpers
  createEffect: (type: EffectType, parameters: Record<string, any> = {}): Effect => {
    return {
      id: generateId(),
      type,
      enabled: true,
      parameters,
    }
  },

  // Transition creation helpers
  createTransition: (type: TransitionType, config: Partial<SceneTransition> = {}): SceneTransition => {
    return {
      id: generateId(),
      type,
      duration: 30,
      easing: 'ease',
      direction: 'cross',
      parameters: {},
      ...config,
    }
  },

  // Validation helpers
  validateProject: (project: MotionProject): { valid: boolean; errors: string[] } => {
    const errors: string[] = []

    if (!project.title || project.title.trim() === '') {
      errors.push('Project title is required')
    }

    if (project.duration <= 0) {
      errors.push('Project duration must be positive')
    }

    if (project.fps <= 0) {
      errors.push('Project FPS must be positive')
    }

    if (project.width <= 0 || project.height <= 0) {
      errors.push('Project dimensions must be positive')
    }

    // Validate scenes
    project.scenes.forEach((scene, index) => {
      if (scene.startFrame < 0) {
        errors.push(`Scene ${index + 1}: Start frame cannot be negative`)
      }

      if (scene.endFrame <= scene.startFrame) {
        errors.push(`Scene ${index + 1}: End frame must be after start frame`)
      }

      if (scene.endFrame > project.duration) {
        errors.push(`Scene ${index + 1}: End frame exceeds project duration`)
      }
    })

    return {
      valid: errors.length === 0,
      errors,
    }
  },

  // Time conversion helpers
  framesToSeconds: (frames: number, fps: number): number => {
    return frames / fps
  },

  secondsToFrames: (seconds: number, fps: number): number => {
    return Math.round(seconds * fps)
  },

  formatTime: (frames: number, fps: number): string => {
    const totalSeconds = frames / fps
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = Math.floor(totalSeconds % 60)
    const frameNumber = frames % fps
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${frameNumber.toString().padStart(2, '0')}`
  },

  // Color utilities
  hexToRgb: (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  },

  rgbToHex: (r: number, g: number, b: number): string => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
  },

  // Interpolation utilities
  lerp: (start: number, end: number, progress: number): number => {
    return start + (end - start) * progress
  },

  easeInOut: (t: number): number => {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
  },

  // Performance utilities
  debounce: <T extends (...args: any[]) => any>(func: T, wait: number): T => {
    let timeout: NodeJS.Timeout
    return ((...args: any[]) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func.apply(null, args), wait)
    }) as T
  },

  throttle: <T extends (...args: any[]) => any>(func: T, limit: number): T => {
    let inThrottle: boolean
    return ((...args: any[]) => {
      if (!inThrottle) {
        func.apply(null, args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }) as T
  },
}

// Helper function for generating IDs
function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

// Export version information
export const MOTION_ENGINE_VERSION = '1.0.0'

// Export default configuration
export const DEFAULT_PROJECT_CONFIG: Partial<MotionProject> = {
  fps: 30,
  width: 1920,
  height: 1080,
  backgroundColor: '#000000',
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
}

// Export common presets
export const COMMON_PRESETS = {
  // Common project presets
  projects: {
    socialMedia: {
      width: 1080,
      height: 1080,
      fps: 30,
      duration: 150, // 5 seconds
    },
    youtube: {
      width: 1920,
      height: 1080,
      fps: 30,
      duration: 900, // 30 seconds
    },
    instagram: {
      width: 1080,
      height: 1920,
      fps: 30,
      duration: 450, // 15 seconds
    },
  },

  // Common animation durations (in frames at 30fps)
  durations: {
    quick: 15,    // 0.5 seconds
    normal: 30,   // 1 second
    slow: 60,     // 2 seconds
    long: 120,    // 4 seconds
  },

  // Common easing types
  easings: [
    'linear',
    'ease',
    'ease-in',
    'ease-out',
    'ease-in-out',
    'spring',
    'bounce',
  ] as EasingType[],
}
