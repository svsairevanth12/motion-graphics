import { Effect, EffectType } from './core'
import { interpolate } from 'remotion'

export interface EffectDefinition {
  type: EffectType
  name: string
  description: string
  category: 'visual' | 'distortion' | 'color' | 'blur' | 'stylize'
  parameters: EffectParameter[]
  apply: (element: any, params: Record<string, any>, frame: number) => any
  preview?: string // Base64 encoded preview
}

export interface EffectParameter {
  name: string
  type: 'number' | 'boolean' | 'color' | 'select' | 'range'
  defaultValue: any
  min?: number
  max?: number
  step?: number
  options?: string[]
  description: string
}

export interface EffectPreset {
  id: string
  name: string
  description: string
  effectType: EffectType
  parameters: Record<string, any>
  category: string
  tags: string[]
}

export class EffectLibrary {
  private effects = new Map<EffectType, EffectDefinition>()
  private presets: EffectPreset[] = []

  constructor() {
    this.initializeEffects()
    this.initializePresets()
  }

  private initializeEffects(): void {
    // Blur effect
    this.effects.set('blur', {
      type: 'blur',
      name: 'Blur',
      description: 'Apply gaussian blur to element',
      category: 'blur',
      parameters: [
        {
          name: 'amount',
          type: 'range',
          defaultValue: 5,
          min: 0,
          max: 50,
          step: 0.1,
          description: 'Blur intensity',
        },
        {
          name: 'directional',
          type: 'boolean',
          defaultValue: false,
          description: 'Enable directional blur',
        },
        {
          name: 'angle',
          type: 'range',
          defaultValue: 0,
          min: 0,
          max: 360,
          step: 1,
          description: 'Blur direction angle',
        },
      ],
      apply: (element, params, frame) => ({
        ...element,
        filter: {
          ...element.filter,
          blur: params.directional 
            ? `blur(${params.amount}px) blur-direction(${params.angle}deg)`
            : `blur(${params.amount}px)`,
        },
      }),
    })

    // Glow effect
    this.effects.set('glow', {
      type: 'glow',
      name: 'Glow',
      description: 'Add outer glow to element',
      category: 'visual',
      parameters: [
        {
          name: 'color',
          type: 'color',
          defaultValue: '#ffffff',
          description: 'Glow color',
        },
        {
          name: 'intensity',
          type: 'range',
          defaultValue: 1,
          min: 0,
          max: 5,
          step: 0.1,
          description: 'Glow intensity',
        },
        {
          name: 'size',
          type: 'range',
          defaultValue: 10,
          min: 0,
          max: 100,
          step: 1,
          description: 'Glow size',
        },
        {
          name: 'softness',
          type: 'range',
          defaultValue: 0.5,
          min: 0,
          max: 1,
          step: 0.01,
          description: 'Glow edge softness',
        },
      ],
      apply: (element, params, frame) => ({
        ...element,
        boxShadow: `0 0 ${params.size}px ${params.size * params.softness}px ${params.color}`,
        filter: {
          ...element.filter,
          brightness: 1 + params.intensity * 0.2,
        },
      }),
    })

    // Shadow effect
    this.effects.set('shadow', {
      type: 'shadow',
      name: 'Drop Shadow',
      description: 'Add drop shadow to element',
      category: 'visual',
      parameters: [
        {
          name: 'offsetX',
          type: 'range',
          defaultValue: 5,
          min: -50,
          max: 50,
          step: 1,
          description: 'Horizontal shadow offset',
        },
        {
          name: 'offsetY',
          type: 'range',
          defaultValue: 5,
          min: -50,
          max: 50,
          step: 1,
          description: 'Vertical shadow offset',
        },
        {
          name: 'blur',
          type: 'range',
          defaultValue: 10,
          min: 0,
          max: 50,
          step: 1,
          description: 'Shadow blur amount',
        },
        {
          name: 'color',
          type: 'color',
          defaultValue: '#000000',
          description: 'Shadow color',
        },
        {
          name: 'opacity',
          type: 'range',
          defaultValue: 0.5,
          min: 0,
          max: 1,
          step: 0.01,
          description: 'Shadow opacity',
        },
      ],
      apply: (element, params, frame) => ({
        ...element,
        boxShadow: `${params.offsetX}px ${params.offsetY}px ${params.blur}px ${params.color}${Math.round(params.opacity * 255).toString(16).padStart(2, '0')}`,
      }),
    })

    // Outline effect
    this.effects.set('outline', {
      type: 'outline',
      name: 'Outline',
      description: 'Add outline stroke to element',
      category: 'visual',
      parameters: [
        {
          name: 'width',
          type: 'range',
          defaultValue: 2,
          min: 0,
          max: 20,
          step: 0.5,
          description: 'Outline width',
        },
        {
          name: 'color',
          type: 'color',
          defaultValue: '#ffffff',
          description: 'Outline color',
        },
        {
          name: 'style',
          type: 'select',
          defaultValue: 'solid',
          options: ['solid', 'dashed', 'dotted'],
          description: 'Outline style',
        },
      ],
      apply: (element, params, frame) => ({
        ...element,
        border: `${params.width}px ${params.style} ${params.color}`,
      }),
    })

    // Gradient effect
    this.effects.set('gradient', {
      type: 'gradient',
      name: 'Gradient Overlay',
      description: 'Apply gradient overlay to element',
      category: 'color',
      parameters: [
        {
          name: 'type',
          type: 'select',
          defaultValue: 'linear',
          options: ['linear', 'radial'],
          description: 'Gradient type',
        },
        {
          name: 'angle',
          type: 'range',
          defaultValue: 45,
          min: 0,
          max: 360,
          step: 1,
          description: 'Gradient angle (linear only)',
        },
        {
          name: 'color1',
          type: 'color',
          defaultValue: '#ff0000',
          description: 'Start color',
        },
        {
          name: 'color2',
          type: 'color',
          defaultValue: '#0000ff',
          description: 'End color',
        },
        {
          name: 'opacity',
          type: 'range',
          defaultValue: 0.5,
          min: 0,
          max: 1,
          step: 0.01,
          description: 'Overlay opacity',
        },
      ],
      apply: (element, params, frame) => {
        const gradient = params.type === 'linear'
          ? `linear-gradient(${params.angle}deg, ${params.color1}, ${params.color2})`
          : `radial-gradient(circle, ${params.color1}, ${params.color2})`
        
        return {
          ...element,
          background: gradient,
          opacity: element.opacity * params.opacity,
        }
      },
    })

    // Noise effect
    this.effects.set('noise', {
      type: 'noise',
      name: 'Noise',
      description: 'Add noise texture to element',
      category: 'stylize',
      parameters: [
        {
          name: 'amount',
          type: 'range',
          defaultValue: 0.1,
          min: 0,
          max: 1,
          step: 0.01,
          description: 'Noise intensity',
        },
        {
          name: 'scale',
          type: 'range',
          defaultValue: 1,
          min: 0.1,
          max: 10,
          step: 0.1,
          description: 'Noise scale',
        },
        {
          name: 'animated',
          type: 'boolean',
          defaultValue: false,
          description: 'Animate noise over time',
        },
      ],
      apply: (element, params, frame) => {
        const seed = params.animated ? frame * 0.1 : 0
        return {
          ...element,
          filter: {
            ...element.filter,
            noise: {
              amount: params.amount,
              scale: params.scale,
              seed,
            },
          },
        }
      },
    })

    // Color correction effect
    this.effects.set('color-correction', {
      type: 'color-correction',
      name: 'Color Correction',
      description: 'Adjust color properties of element',
      category: 'color',
      parameters: [
        {
          name: 'brightness',
          type: 'range',
          defaultValue: 1,
          min: 0,
          max: 2,
          step: 0.01,
          description: 'Brightness adjustment',
        },
        {
          name: 'contrast',
          type: 'range',
          defaultValue: 1,
          min: 0,
          max: 2,
          step: 0.01,
          description: 'Contrast adjustment',
        },
        {
          name: 'saturation',
          type: 'range',
          defaultValue: 1,
          min: 0,
          max: 2,
          step: 0.01,
          description: 'Saturation adjustment',
        },
        {
          name: 'hue',
          type: 'range',
          defaultValue: 0,
          min: -180,
          max: 180,
          step: 1,
          description: 'Hue shift in degrees',
        },
      ],
      apply: (element, params, frame) => ({
        ...element,
        filter: {
          ...element.filter,
          brightness: params.brightness,
          contrast: params.contrast,
          saturate: params.saturation,
          'hue-rotate': `${params.hue}deg`,
        },
      }),
    })

    // Chromatic aberration effect
    this.effects.set('chromatic-aberration', {
      type: 'chromatic-aberration',
      name: 'Chromatic Aberration',
      description: 'Add chromatic aberration distortion',
      category: 'distortion',
      parameters: [
        {
          name: 'amount',
          type: 'range',
          defaultValue: 2,
          min: 0,
          max: 20,
          step: 0.1,
          description: 'Aberration intensity',
        },
        {
          name: 'angle',
          type: 'range',
          defaultValue: 0,
          min: 0,
          max: 360,
          step: 1,
          description: 'Aberration direction',
        },
      ],
      apply: (element, params, frame) => ({
        ...element,
        filter: {
          ...element.filter,
          chromaticAberration: {
            amount: params.amount,
            angle: params.angle,
          },
        },
      }),
    })
  }

  private initializePresets(): void {
    this.presets = [
      {
        id: 'soft-glow',
        name: 'Soft Glow',
        description: 'Gentle white glow effect',
        effectType: 'glow',
        parameters: {
          color: '#ffffff',
          intensity: 0.8,
          size: 15,
          softness: 0.7,
        },
        category: 'glow',
        tags: ['soft', 'subtle', 'white'],
      },
      {
        id: 'neon-glow',
        name: 'Neon Glow',
        description: 'Bright neon glow effect',
        effectType: 'glow',
        parameters: {
          color: '#00ffff',
          intensity: 2,
          size: 25,
          softness: 0.3,
        },
        category: 'glow',
        tags: ['neon', 'bright', 'cyan'],
      },
      {
        id: 'dramatic-shadow',
        name: 'Dramatic Shadow',
        description: 'Strong drop shadow for emphasis',
        effectType: 'shadow',
        parameters: {
          offsetX: 10,
          offsetY: 10,
          blur: 20,
          color: '#000000',
          opacity: 0.8,
        },
        category: 'shadow',
        tags: ['dramatic', 'strong', 'emphasis'],
      },
      {
        id: 'vintage-look',
        name: 'Vintage Look',
        description: 'Retro color grading',
        effectType: 'color-correction',
        parameters: {
          brightness: 0.9,
          contrast: 1.2,
          saturation: 0.8,
          hue: 10,
        },
        category: 'color',
        tags: ['vintage', 'retro', 'warm'],
      },
    ]
  }

  // Effect application
  applyEffect(element: any, effect: Effect, frame: number): any {
    const definition = this.effects.get(effect.type)
    if (!definition) {
      console.warn(`Unknown effect type: ${effect.type}`)
      return element
    }

    if (!effect.enabled) {
      return element
    }

    // Check if effect is active at this frame
    if (effect.startFrame !== undefined && frame < effect.startFrame) {
      return element
    }
    if (effect.endFrame !== undefined && frame > effect.endFrame) {
      return element
    }

    return definition.apply(element, effect.parameters, frame)
  }

  applyEffects(element: any, effects: Effect[], frame: number): any {
    return effects.reduce((result, effect) => {
      return this.applyEffect(result, effect, frame)
    }, element)
  }

  // Effect management
  getAvailableEffects(): EffectDefinition[] {
    return Array.from(this.effects.values())
  }

  getEffect(type: EffectType): EffectDefinition | undefined {
    return this.effects.get(type)
  }

  getEffectsByCategory(category: string): EffectDefinition[] {
    return Array.from(this.effects.values()).filter(effect => effect.category === category)
  }

  // Preset management
  getPresets(): EffectPreset[] {
    return [...this.presets]
  }

  getPreset(id: string): EffectPreset | undefined {
    return this.presets.find(preset => preset.id === id)
  }

  getPresetsByEffect(effectType: EffectType): EffectPreset[] {
    return this.presets.filter(preset => preset.effectType === effectType)
  }

  addPreset(preset: Omit<EffectPreset, 'id'>): EffectPreset {
    const newPreset: EffectPreset = {
      ...preset,
      id: this.generateId(),
    }
    this.presets.push(newPreset)
    return newPreset
  }

  updatePreset(id: string, updates: Partial<EffectPreset>): boolean {
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

  // Effect creation helpers
  createEffect(
    type: EffectType,
    parameters: Record<string, any> = {},
    enabled: boolean = true
  ): Effect {
    const definition = this.effects.get(type)
    const defaultParams = definition ? this.getDefaultParameters(definition) : {}
    
    return {
      id: this.generateId(),
      type,
      enabled,
      parameters: { ...defaultParams, ...parameters },
    }
  }

  createEffectFromPreset(presetId: string): Effect | null {
    const preset = this.getPreset(presetId)
    if (!preset) return null
    
    return this.createEffect(preset.effectType, preset.parameters)
  }

  private getDefaultParameters(definition: EffectDefinition): Record<string, any> {
    const defaults: Record<string, any> = {}
    definition.parameters.forEach(param => {
      defaults[param.name] = param.defaultValue
    })
    return defaults
  }

  // Utility methods
  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  // Effect validation
  validateEffect(effect: Effect): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    const definition = this.effects.get(effect.type)
    
    if (!definition) {
      errors.push(`Unknown effect type: ${effect.type}`)
      return { valid: false, errors }
    }

    // Validate parameters
    definition.parameters.forEach(paramDef => {
      const value = effect.parameters[paramDef.name]
      
      if (value === undefined || value === null) {
        errors.push(`Missing parameter: ${paramDef.name}`)
        return
      }

      // Type validation
      if (paramDef.type === 'number' || paramDef.type === 'range') {
        if (typeof value !== 'number') {
          errors.push(`Parameter ${paramDef.name} must be a number`)
        } else {
          if (paramDef.min !== undefined && value < paramDef.min) {
            errors.push(`Parameter ${paramDef.name} is below minimum value ${paramDef.min}`)
          }
          if (paramDef.max !== undefined && value > paramDef.max) {
            errors.push(`Parameter ${paramDef.name} is above maximum value ${paramDef.max}`)
          }
        }
      }

      if (paramDef.type === 'boolean' && typeof value !== 'boolean') {
        errors.push(`Parameter ${paramDef.name} must be a boolean`)
      }

      if (paramDef.type === 'select' && paramDef.options && !paramDef.options.includes(value)) {
        errors.push(`Parameter ${paramDef.name} must be one of: ${paramDef.options.join(', ')}`)
      }
    })

    return {
      valid: errors.length === 0,
      errors,
    }
  }
}

// Singleton instance
let effectLibraryInstance: EffectLibrary | null = null

export function getEffectLibrary(): EffectLibrary {
  if (!effectLibraryInstance) {
    effectLibraryInstance = new EffectLibrary()
  }
  return effectLibraryInstance
}

export default EffectLibrary
