import { SceneTransition, TransitionType, EasingType } from './core'
import { interpolate, spring, Easing } from 'remotion'

export interface TransitionEffect {
  type: TransitionType
  apply: (progress: number, fromElement: any, toElement: any, params: any) => any
  defaultParams: Record<string, any>
  description: string
}

export interface TransitionPreset {
  id: string
  name: string
  description: string
  type: TransitionType
  duration: number
  easing: EasingType
  parameters: Record<string, any>
  preview?: string // Base64 encoded preview image
}

export class TransitionSystem {
  private effects = new Map<TransitionType, TransitionEffect>()
  private presets: TransitionPreset[] = []

  constructor() {
    this.initializeEffects()
    this.initializePresets()
  }

  private initializeEffects(): void {
    // Fade transition
    this.effects.set('fade', {
      type: 'fade',
      apply: (progress, fromElement, toElement, params) => {
        const fadeOut = 1 - progress
        const fadeIn = progress
        
        return {
          from: { ...fromElement, opacity: fromElement.opacity * fadeOut },
          to: { ...toElement, opacity: toElement.opacity * fadeIn },
        }
      },
      defaultParams: { crossFade: true },
      description: 'Smooth opacity transition between elements',
    })

    // Slide transition
    this.effects.set('slide', {
      type: 'slide',
      apply: (progress, fromElement, toElement, params) => {
        const direction = params.direction || 'left'
        const distance = params.distance || 1920
        
        let fromOffset = { x: 0, y: 0 }
        let toOffset = { x: 0, y: 0 }
        
        switch (direction) {
          case 'left':
            fromOffset.x = -distance * progress
            toOffset.x = distance * (1 - progress)
            break
          case 'right':
            fromOffset.x = distance * progress
            toOffset.x = -distance * (1 - progress)
            break
          case 'up':
            fromOffset.y = -distance * progress
            toOffset.y = distance * (1 - progress)
            break
          case 'down':
            fromOffset.y = distance * progress
            toOffset.y = -distance * (1 - progress)
            break
        }
        
        return {
          from: {
            ...fromElement,
            position: {
              x: fromElement.position.x + fromOffset.x,
              y: fromElement.position.y + fromOffset.y,
            },
          },
          to: {
            ...toElement,
            position: {
              x: toElement.position.x + toOffset.x,
              y: toElement.position.y + toOffset.y,
            },
          },
        }
      },
      defaultParams: { direction: 'left', distance: 1920 },
      description: 'Slide elements in specified direction',
    })

    // Zoom transition
    this.effects.set('zoom', {
      type: 'zoom',
      apply: (progress, fromElement, toElement, params) => {
        const zoomOut = params.zoomOut !== false
        const maxScale = params.maxScale || 2
        const minScale = params.minScale || 0.5
        
        let fromScale, toScale
        
        if (zoomOut) {
          fromScale = interpolate(progress, [0, 1], [1, maxScale])
          toScale = interpolate(progress, [0, 1], [minScale, 1])
        } else {
          fromScale = interpolate(progress, [0, 1], [1, minScale])
          toScale = interpolate(progress, [0, 1], [maxScale, 1])
        }
        
        return {
          from: {
            ...fromElement,
            scale: {
              x: fromElement.scale.x * fromScale,
              y: fromElement.scale.y * fromScale,
            },
            opacity: fromElement.opacity * (1 - progress),
          },
          to: {
            ...toElement,
            scale: {
              x: toElement.scale.x * toScale,
              y: toElement.scale.y * toScale,
            },
            opacity: toElement.opacity * progress,
          },
        }
      },
      defaultParams: { zoomOut: true, maxScale: 2, minScale: 0.5 },
      description: 'Scale-based transition with zoom effect',
    })

    // Wipe transition
    this.effects.set('wipe', {
      type: 'wipe',
      apply: (progress, fromElement, toElement, params) => {
        const direction = params.direction || 'horizontal'
        const softness = params.softness || 0.1
        
        // This would typically involve masking in the actual render
        return {
          from: {
            ...fromElement,
            mask: {
              type: 'wipe',
              progress: progress,
              direction,
              softness,
            },
          },
          to: {
            ...toElement,
            mask: {
              type: 'wipe',
              progress: 1 - progress,
              direction,
              softness,
              inverted: true,
            },
          },
        }
      },
      defaultParams: { direction: 'horizontal', softness: 0.1 },
      description: 'Directional wipe reveal transition',
    })

    // Morph transition
    this.effects.set('morph', {
      type: 'morph',
      apply: (progress, fromElement, toElement, params) => {
        const morphType = params.morphType || 'blend'
        
        if (morphType === 'blend') {
          return {
            from: {
              ...fromElement,
              opacity: fromElement.opacity * (1 - progress),
            },
            to: {
              ...toElement,
              opacity: toElement.opacity * progress,
            },
            blend: {
              mode: 'screen',
              amount: progress,
            },
          }
        }
        
        // Shape morphing would require more complex path interpolation
        return {
          from: fromElement,
          to: toElement,
          morphProgress: progress,
        }
      },
      defaultParams: { morphType: 'blend' },
      description: 'Morphing transition between shapes or elements',
    })

    // Dissolve transition
    this.effects.set('dissolve', {
      type: 'dissolve',
      apply: (progress, fromElement, toElement, params) => {
        const noiseScale = params.noiseScale || 1
        const threshold = params.threshold || 0.5
        
        return {
          from: {
            ...fromElement,
            dissolve: {
              progress: progress,
              noiseScale,
              threshold,
            },
          },
          to: {
            ...toElement,
            dissolve: {
              progress: 1 - progress,
              noiseScale,
              threshold,
              inverted: true,
            },
          },
        }
      },
      defaultParams: { noiseScale: 1, threshold: 0.5 },
      description: 'Noise-based dissolve transition',
    })

    // Push transition
    this.effects.set('push', {
      type: 'push',
      apply: (progress, fromElement, toElement, params) => {
        const direction = params.direction || 'left'
        const distance = params.distance || 1920
        
        let offset = { x: 0, y: 0 }
        
        switch (direction) {
          case 'left':
            offset.x = -distance * progress
            break
          case 'right':
            offset.x = distance * progress
            break
          case 'up':
            offset.y = -distance * progress
            break
          case 'down':
            offset.y = distance * progress
            break
        }
        
        return {
          from: {
            ...fromElement,
            position: {
              x: fromElement.position.x + offset.x,
              y: fromElement.position.y + offset.y,
            },
          },
          to: {
            ...toElement,
            position: {
              x: toElement.position.x + offset.x - distance,
              y: toElement.position.y + offset.y,
            },
          },
        }
      },
      defaultParams: { direction: 'left', distance: 1920 },
      description: 'Push one element out while bringing another in',
    })
  }

  private initializePresets(): void {
    this.presets = [
      {
        id: 'fade-smooth',
        name: 'Smooth Fade',
        description: 'Gentle cross-fade transition',
        type: 'fade',
        duration: 30,
        easing: 'ease-in-out',
        parameters: { crossFade: true },
      },
      {
        id: 'slide-left-fast',
        name: 'Fast Slide Left',
        description: 'Quick slide to the left',
        type: 'slide',
        duration: 20,
        easing: 'ease-out',
        parameters: { direction: 'left', distance: 1920 },
      },
      {
        id: 'zoom-dramatic',
        name: 'Dramatic Zoom',
        description: 'Dramatic zoom in/out effect',
        type: 'zoom',
        duration: 45,
        easing: 'ease-in-out',
        parameters: { zoomOut: true, maxScale: 3, minScale: 0.3 },
      },
      {
        id: 'wipe-vertical',
        name: 'Vertical Wipe',
        description: 'Clean vertical wipe transition',
        type: 'wipe',
        duration: 25,
        easing: 'linear',
        parameters: { direction: 'vertical', softness: 0.05 },
      },
    ]
  }

  // Apply transition effect
  applyTransition(
    transition: SceneTransition,
    progress: number,
    fromElement: any,
    toElement: any
  ): any {
    const effect = this.effects.get(transition.type)
    if (!effect) {
      console.warn(`Unknown transition type: ${transition.type}`)
      return { from: fromElement, to: toElement }
    }

    // Apply easing to progress
    const easedProgress = this.applyEasing(progress, transition.easing)
    
    // Merge transition parameters with effect defaults
    const params = { ...effect.defaultParams, ...transition.parameters }
    
    return effect.apply(easedProgress, fromElement, toElement, params)
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

  // Preset management
  getPresets(): TransitionPreset[] {
    return [...this.presets]
  }

  getPreset(id: string): TransitionPreset | undefined {
    return this.presets.find(preset => preset.id === id)
  }

  addPreset(preset: Omit<TransitionPreset, 'id'>): TransitionPreset {
    const newPreset: TransitionPreset = {
      ...preset,
      id: this.generateId(),
    }
    this.presets.push(newPreset)
    return newPreset
  }

  updatePreset(id: string, updates: Partial<TransitionPreset>): boolean {
    const index = this.presets.findIndex(preset => preset.id === id)
    if (index === -1) return false
    
    this.presets[index] = { ...this.presets[index], ...updates }
    return true
  }

  deletePreset(id: string): boolean {
    const index = this.presets.findIndex(preset => preset.id === id)
    if (index === -1) return false
    
    this.presets.splice(index, 1)
    return true
  }

  // Effect management
  getAvailableEffects(): TransitionEffect[] {
    return Array.from(this.effects.values())
  }

  getEffect(type: TransitionType): TransitionEffect | undefined {
    return this.effects.get(type)
  }

  // Transition creation helpers
  createTransition(
    type: TransitionType,
    duration: number = 30,
    easing: EasingType = 'ease-in-out',
    parameters: Record<string, any> = {}
  ): SceneTransition {
    const effect = this.effects.get(type)
    const defaultParams = effect ? effect.defaultParams : {}
    
    return {
      id: this.generateId(),
      type,
      duration,
      easing,
      direction: 'cross',
      parameters: { ...defaultParams, ...parameters },
    }
  }

  createTransitionFromPreset(presetId: string): SceneTransition | null {
    const preset = this.getPreset(presetId)
    if (!preset) return null
    
    return this.createTransition(
      preset.type,
      preset.duration,
      preset.easing,
      preset.parameters
    )
  }

  // Utility methods
  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  // Transition validation
  validateTransition(transition: SceneTransition): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    
    if (!this.effects.has(transition.type)) {
      errors.push(`Unknown transition type: ${transition.type}`)
    }
    
    if (transition.duration <= 0) {
      errors.push('Transition duration must be positive')
    }
    
    if (transition.duration > 300) {
      errors.push('Transition duration is too long (max 300 frames)')
    }
    
    return {
      valid: errors.length === 0,
      errors,
    }
  }

  // Performance optimization
  precomputeTransition(
    transition: SceneTransition,
    fromElement: any,
    toElement: any,
    frameCount: number = 60
  ): any[] {
    const frames: any[] = []
    
    for (let i = 0; i <= frameCount; i++) {
      const progress = i / frameCount
      const result = this.applyTransition(transition, progress, fromElement, toElement)
      frames.push(result)
    }
    
    return frames
  }
}

// Singleton instance
let transitionSystemInstance: TransitionSystem | null = null

export function getTransitionSystem(): TransitionSystem {
  if (!transitionSystemInstance) {
    transitionSystemInstance = new TransitionSystem()
  }
  return transitionSystemInstance
}

export default TransitionSystem
