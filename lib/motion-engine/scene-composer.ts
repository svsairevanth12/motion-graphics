import { MotionScene, MotionElement, SceneTransition, MotionProject } from './core'
import { getMotionEngine } from './core'

export interface CompositionLayer {
  element: MotionElement
  computedProperties: any
  visible: boolean
  blendMode: BlendMode
  mask?: MaskSettings
}

export type BlendMode = 
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'soft-light'
  | 'hard-light'
  | 'color-dodge'
  | 'color-burn'
  | 'darken'
  | 'lighten'
  | 'difference'
  | 'exclusion'

export interface MaskSettings {
  type: 'alpha' | 'luminance' | 'shape'
  inverted: boolean
  feather: number
  expansion: number
  path?: string // SVG path for shape masks
}

export interface SceneComposition {
  scene: MotionScene
  layers: CompositionLayer[]
  activeTransitions: ActiveTransition[]
  frame: number
  timestamp: number
}

export interface ActiveTransition {
  transition: SceneTransition
  progress: number
  startFrame: number
  endFrame: number
  fromScene?: MotionScene
  toScene?: MotionScene
}

export class SceneComposer {
  private motionEngine = getMotionEngine()
  private compositionCache = new Map<string, SceneComposition>()
  private maxCacheSize = 100

  // Main composition method
  composeScene(scene: MotionScene, frame: number): SceneComposition {
    const cacheKey = `${scene.id}-${frame}`
    
    // Check cache first
    if (this.compositionCache.has(cacheKey)) {
      return this.compositionCache.get(cacheKey)!
    }

    const composition = this.createComposition(scene, frame)
    
    // Cache the composition
    this.cacheComposition(cacheKey, composition)
    
    return composition
  }

  private createComposition(scene: MotionScene, frame: number): SceneComposition {
    // Filter elements that are active at this frame
    const activeElements = scene.elements.filter(element => 
      frame >= element.startFrame && frame <= element.endFrame && element.visible
    )

    // Sort elements by layer (higher layer = rendered on top)
    activeElements.sort((a, b) => a.layer - b.layer)

    // Create composition layers
    const layers: CompositionLayer[] = activeElements.map(element => {
      const computedProperties = this.motionEngine.calculateElementPropertiesAtFrame(element, frame)
      
      return {
        element,
        computedProperties,
        visible: this.isElementVisible(element, frame),
        blendMode: this.getElementBlendMode(element),
        mask: this.getElementMask(element, frame),
      }
    })

    // Calculate active transitions
    const activeTransitions = this.calculateActiveTransitions(scene, frame)

    return {
      scene,
      layers,
      activeTransitions,
      frame,
      timestamp: Date.now(),
    }
  }

  private isElementVisible(element: MotionElement, frame: number): boolean {
    // Check if element is within its time range
    if (frame < element.startFrame || frame > element.endFrame) {
      return false
    }

    // Check opacity
    const properties = this.motionEngine.calculateElementPropertiesAtFrame(element, frame)
    if (properties.opacity <= 0) {
      return false
    }

    // Check if element is locked (locked elements are not visible in preview)
    if (element.locked) {
      return false
    }

    return element.visible
  }

  private getElementBlendMode(element: MotionElement): BlendMode {
    // Get blend mode from element properties or effects
    const blendEffect = element.effects.find(effect => effect.type === 'blend')
    if (blendEffect && blendEffect.enabled) {
      return blendEffect.parameters.mode || 'normal'
    }
    return 'normal'
  }

  private getElementMask(element: MotionElement, frame: number): MaskSettings | undefined {
    // Check for mask effects
    const maskEffect = element.effects.find(effect => effect.type === 'mask')
    if (!maskEffect || !maskEffect.enabled) {
      return undefined
    }

    return {
      type: maskEffect.parameters.type || 'alpha',
      inverted: maskEffect.parameters.inverted || false,
      feather: maskEffect.parameters.feather || 0,
      expansion: maskEffect.parameters.expansion || 0,
      path: maskEffect.parameters.path,
    }
  }

  private calculateActiveTransitions(scene: MotionScene, frame: number): ActiveTransition[] {
    const activeTransitions: ActiveTransition[] = []

    scene.transitions.forEach(transition => {
      const startFrame = this.getTransitionStartFrame(transition, scene)
      const endFrame = startFrame + transition.duration

      if (frame >= startFrame && frame <= endFrame) {
        const progress = (frame - startFrame) / transition.duration
        
        activeTransitions.push({
          transition,
          progress,
          startFrame,
          endFrame,
          fromScene: this.getPreviousScene(scene),
          toScene: this.getNextScene(scene),
        })
      }
    })

    return activeTransitions
  }

  private getTransitionStartFrame(transition: SceneTransition, scene: MotionScene): number {
    // Transitions can start at scene boundaries or at specific times
    if (transition.direction === 'in') {
      return scene.startFrame
    } else if (transition.direction === 'out') {
      return scene.endFrame - transition.duration
    } else {
      // Cross transition - starts in the middle
      return scene.startFrame + (scene.duration - transition.duration) / 2
    }
  }

  private getPreviousScene(currentScene: MotionScene): MotionScene | undefined {
    const project = this.motionEngine.getProject()
    if (!project) return undefined

    const currentIndex = project.scenes.findIndex(scene => scene.id === currentScene.id)
    return currentIndex > 0 ? project.scenes[currentIndex - 1] : undefined
  }

  private getNextScene(currentScene: MotionScene): MotionScene | undefined {
    const project = this.motionEngine.getProject()
    if (!project) return undefined

    const currentIndex = project.scenes.findIndex(scene => scene.id === currentScene.id)
    return currentIndex < project.scenes.length - 1 ? project.scenes[currentIndex + 1] : undefined
  }

  // Composition utilities
  getLayerAtPosition(composition: SceneComposition, x: number, y: number): CompositionLayer | null {
    // Find the topmost layer at the given position
    for (let i = composition.layers.length - 1; i >= 0; i--) {
      const layer = composition.layers[i]
      if (this.isPointInLayer(layer, x, y)) {
        return layer
      }
    }
    return null
  }

  private isPointInLayer(layer: CompositionLayer, x: number, y: number): boolean {
    const props = layer.computedProperties
    const bounds = this.getLayerBounds(layer)
    
    return x >= bounds.left && x <= bounds.right && 
           y >= bounds.top && y <= bounds.bottom
  }

  getLayerBounds(layer: CompositionLayer): { left: number; top: number; right: number; bottom: number } {
    const props = layer.computedProperties
    const halfWidth = (props.size.width * props.scale.x) / 2
    const halfHeight = (props.size.height * props.scale.y) / 2
    
    return {
      left: props.position.x - halfWidth,
      top: props.position.y - halfHeight,
      right: props.position.x + halfWidth,
      bottom: props.position.y + halfHeight,
    }
  }

  // Cache management
  private cacheComposition(key: string, composition: SceneComposition): void {
    if (this.compositionCache.size >= this.maxCacheSize) {
      // Remove oldest entries
      const oldestKey = this.compositionCache.keys().next().value
      this.compositionCache.delete(oldestKey)
    }
    
    this.compositionCache.set(key, composition)
  }

  clearCache(): void {
    this.compositionCache.clear()
  }

  // Scene manipulation
  addElementToScene(scene: MotionScene, element: MotionElement): void {
    // Ensure element doesn't exceed scene boundaries
    element.startFrame = Math.max(element.startFrame, scene.startFrame)
    element.endFrame = Math.min(element.endFrame, scene.endFrame)
    
    // Add to scene
    scene.elements.push(element)
    
    // Clear cache for this scene
    this.clearSceneCache(scene.id)
  }

  removeElementFromScene(scene: MotionScene, elementId: string): void {
    const index = scene.elements.findIndex(el => el.id === elementId)
    if (index > -1) {
      scene.elements.splice(index, 1)
      this.clearSceneCache(scene.id)
    }
  }

  updateElementInScene(scene: MotionScene, elementId: string, updates: Partial<MotionElement>): void {
    const element = scene.elements.find(el => el.id === elementId)
    if (element) {
      Object.assign(element, updates)
      this.clearSceneCache(scene.id)
    }
  }

  duplicateElement(scene: MotionScene, elementId: string): MotionElement | null {
    const element = scene.elements.find(el => el.id === elementId)
    if (!element) return null

    const duplicate: MotionElement = {
      ...element,
      id: this.generateId(),
      name: `${element.name} Copy`,
      layer: element.layer + 1,
      properties: {
        ...element.properties,
        position: {
          ...element.properties.position,
          x: element.properties.position.x + 20,
          y: element.properties.position.y + 20,
        }
      },
      animations: element.animations.map(anim => ({
        ...anim,
        id: this.generateId(),
      })),
      effects: element.effects.map(effect => ({
        ...effect,
        id: this.generateId(),
      })),
    }

    this.addElementToScene(scene, duplicate)
    return duplicate
  }

  // Layer management
  moveElementToLayer(scene: MotionScene, elementId: string, newLayer: number): void {
    const element = scene.elements.find(el => el.id === elementId)
    if (element) {
      element.layer = newLayer
      this.clearSceneCache(scene.id)
    }
  }

  bringElementToFront(scene: MotionScene, elementId: string): void {
    const maxLayer = Math.max(...scene.elements.map(el => el.layer))
    this.moveElementToLayer(scene, elementId, maxLayer + 1)
  }

  sendElementToBack(scene: MotionScene, elementId: string): void {
    const minLayer = Math.min(...scene.elements.map(el => el.layer))
    this.moveElementToLayer(scene, elementId, minLayer - 1)
  }

  // Utility methods
  private clearSceneCache(sceneId: string): void {
    const keysToDelete: string[] = []
    for (const key of this.compositionCache.keys()) {
      if (key.startsWith(sceneId)) {
        keysToDelete.push(key)
      }
    }
    keysToDelete.forEach(key => this.compositionCache.delete(key))
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  // Performance monitoring
  getCompositionStats(): { cacheSize: number; cacheHitRate: number } {
    return {
      cacheSize: this.compositionCache.size,
      cacheHitRate: 0.85, // This would be calculated based on actual cache hits/misses
    }
  }
}

// Singleton instance
let sceneComposerInstance: SceneComposer | null = null

export function getSceneComposer(): SceneComposer {
  if (!sceneComposerInstance) {
    sceneComposerInstance = new SceneComposer()
  }
  return sceneComposerInstance
}

export default SceneComposer
