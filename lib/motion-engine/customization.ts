import { MotionProject, MotionElement, Animation, Effect } from './core'
import { getMotionEngine } from './core'
import { getTimelineManager } from './timeline'

export interface PropertyBinding {
  id: string
  elementId: string
  property: string
  expression?: string
  controller?: PropertyController
  enabled: boolean
}

export interface PropertyController {
  type: 'slider' | 'color' | 'dropdown' | 'checkbox' | 'vector2' | 'vector3'
  label: string
  min?: number
  max?: number
  step?: number
  options?: string[]
  defaultValue: any
  currentValue: any
}

export interface CustomizationPreset {
  id: string
  name: string
  description: string
  bindings: PropertyBinding[]
  thumbnail?: string
  category: string
  tags: string[]
}

export interface UndoRedoState {
  id: string
  timestamp: Date
  action: string
  data: any
  projectState: MotionProject
}

export class CustomizationEngine {
  private motionEngine = getMotionEngine()
  private timelineManager = getTimelineManager()
  private bindings = new Map<string, PropertyBinding>()
  private presets: CustomizationPreset[] = []
  private undoStack: UndoRedoState[] = []
  private redoStack: UndoRedoState[] = []
  private maxUndoSteps = 50
  private autoSaveInterval: NodeJS.Timeout | null = null
  private changeListeners: Function[] = []

  constructor() {
    this.setupAutoSave()
    this.initializeDefaultBindings()
  }

  // Property binding system
  createBinding(
    elementId: string,
    property: string,
    controller: PropertyController
  ): PropertyBinding {
    const binding: PropertyBinding = {
      id: this.generateId(),
      elementId,
      property,
      controller,
      enabled: true,
    }

    this.bindings.set(binding.id, binding)
    this.saveState('Create Binding', { binding })
    this.notifyChange()

    return binding
  }

  updateBinding(bindingId: string, updates: Partial<PropertyBinding>): boolean {
    const binding = this.bindings.get(bindingId)
    if (!binding) return false

    const oldBinding = { ...binding }
    Object.assign(binding, updates)

    this.saveState('Update Binding', { bindingId, oldBinding, newBinding: binding })
    this.notifyChange()

    return true
  }

  removeBinding(bindingId: string): boolean {
    const binding = this.bindings.get(bindingId)
    if (!binding) return false

    this.bindings.delete(bindingId)
    this.saveState('Remove Binding', { binding })
    this.notifyChange()

    return true
  }

  getBinding(bindingId: string): PropertyBinding | undefined {
    return this.bindings.get(bindingId)
  }

  getBindingsForElement(elementId: string): PropertyBinding[] {
    return Array.from(this.bindings.values()).filter(
      binding => binding.elementId === elementId
    )
  }

  getAllBindings(): PropertyBinding[] {
    return Array.from(this.bindings.values())
  }

  // Dynamic property updates
  updateControllerValue(bindingId: string, value: any): void {
    const binding = this.bindings.get(bindingId)
    if (!binding || !binding.enabled) return

    const oldValue = binding.controller?.currentValue
    if (binding.controller) {
      binding.controller.currentValue = value
    }

    // Apply the value to the element property
    this.applyBindingValue(binding, value)

    this.saveState('Update Controller Value', { 
      bindingId, 
      oldValue, 
      newValue: value 
    })
    this.notifyChange()
  }

  private applyBindingValue(binding: PropertyBinding, value: any): void {
    const project = this.motionEngine.getProject()
    if (!project) return

    // Find the element
    let targetElement: MotionElement | null = null
    for (const scene of project.scenes) {
      const element = scene.elements.find(el => el.id === binding.elementId)
      if (element) {
        targetElement = element
        break
      }
    }

    if (!targetElement) return

    // Apply the value to the property
    this.setNestedProperty(targetElement.properties, binding.property, value)

    // If there's an expression, evaluate it
    if (binding.expression) {
      const evaluatedValue = this.evaluateExpression(binding.expression, value)
      this.setNestedProperty(targetElement.properties, binding.property, evaluatedValue)
    }
  }

  private evaluateExpression(expression: string, value: any): any {
    try {
      // Simple expression evaluation
      // In a real implementation, you'd use a proper expression parser
      const func = new Function('value', `return ${expression}`)
      return func(value)
    } catch (error) {
      console.warn('Failed to evaluate expression:', expression, error)
      return value
    }
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

  // Real-time preview updates
  enableRealTimePreview(): void {
    this.motionEngine.on('frameUpdate', () => {
      this.updatePreview()
    })
  }

  private updatePreview(): void {
    // Trigger preview update in the UI
    this.notifyChange()
  }

  // Undo/Redo system
  private saveState(action: string, data: any): void {
    const project = this.motionEngine.getProject()
    if (!project) return

    const state: UndoRedoState = {
      id: this.generateId(),
      timestamp: new Date(),
      action,
      data,
      projectState: JSON.parse(JSON.stringify(project)), // Deep clone
    }

    this.undoStack.push(state)
    if (this.undoStack.length > this.maxUndoSteps) {
      this.undoStack.shift()
    }

    // Clear redo stack when new action is performed
    this.redoStack = []
  }

  undo(): boolean {
    if (this.undoStack.length === 0) return false

    const currentProject = this.motionEngine.getProject()
    if (!currentProject) return false

    // Save current state to redo stack
    const currentState: UndoRedoState = {
      id: this.generateId(),
      timestamp: new Date(),
      action: 'Current State',
      data: {},
      projectState: JSON.parse(JSON.stringify(currentProject)),
    }
    this.redoStack.push(currentState)

    // Restore previous state
    const previousState = this.undoStack.pop()!
    this.motionEngine.loadProject(previousState.projectState)

    this.notifyChange()
    return true
  }

  redo(): boolean {
    if (this.redoStack.length === 0) return false

    const currentProject = this.motionEngine.getProject()
    if (!currentProject) return false

    // Save current state to undo stack
    const currentState: UndoRedoState = {
      id: this.generateId(),
      timestamp: new Date(),
      action: 'Current State',
      data: {},
      projectState: JSON.parse(JSON.stringify(currentProject)),
    }
    this.undoStack.push(currentState)

    // Restore next state
    const nextState = this.redoStack.pop()!
    this.motionEngine.loadProject(nextState.projectState)

    this.notifyChange()
    return true
  }

  canUndo(): boolean {
    return this.undoStack.length > 0
  }

  canRedo(): boolean {
    return this.redoStack.length > 0
  }

  getUndoHistory(): UndoRedoState[] {
    return [...this.undoStack]
  }

  // Preset management
  saveAsPreset(name: string, description: string, category: string = 'custom'): CustomizationPreset {
    const preset: CustomizationPreset = {
      id: this.generateId(),
      name,
      description,
      bindings: Array.from(this.bindings.values()).map(binding => ({ ...binding })),
      category,
      tags: [],
    }

    this.presets.push(preset)
    return preset
  }

  loadPreset(presetId: string): boolean {
    const preset = this.presets.find(p => p.id === presetId)
    if (!preset) return false

    // Clear current bindings
    this.bindings.clear()

    // Load preset bindings
    preset.bindings.forEach(binding => {
      this.bindings.set(binding.id, { ...binding })
    })

    this.saveState('Load Preset', { presetId })
    this.notifyChange()

    return true
  }

  getPresets(): CustomizationPreset[] {
    return [...this.presets]
  }

  deletePreset(presetId: string): boolean {
    const index = this.presets.findIndex(p => p.id === presetId)
    if (index === -1) return false

    this.presets.splice(index, 1)
    return true
  }

  // Auto-save functionality
  private setupAutoSave(): void {
    this.autoSaveInterval = setInterval(() => {
      this.autoSave()
    }, 30000) // Auto-save every 30 seconds
  }

  private autoSave(): void {
    const project = this.motionEngine.getProject()
    if (!project) return

    // Save to localStorage or send to server
    const saveData = {
      project,
      bindings: Array.from(this.bindings.values()),
      timestamp: new Date().toISOString(),
    }

    localStorage.setItem('motion-graphics-autosave', JSON.stringify(saveData))
  }

  loadAutoSave(): boolean {
    try {
      const saveData = localStorage.getItem('motion-graphics-autosave')
      if (!saveData) return false

      const parsed = JSON.parse(saveData)
      
      // Load project
      this.motionEngine.loadProject(parsed.project)
      
      // Load bindings
      this.bindings.clear()
      parsed.bindings.forEach((binding: PropertyBinding) => {
        this.bindings.set(binding.id, binding)
      })

      this.notifyChange()
      return true
    } catch (error) {
      console.error('Failed to load auto-save:', error)
      return false
    }
  }

  // Default bindings for common properties
  private initializeDefaultBindings(): void {
    // These would be common property bindings that users often want to customize
    const defaultControllers = [
      {
        property: 'opacity',
        controller: {
          type: 'slider' as const,
          label: 'Opacity',
          min: 0,
          max: 1,
          step: 0.01,
          defaultValue: 1,
          currentValue: 1,
        },
      },
      {
        property: 'scale.x',
        controller: {
          type: 'slider' as const,
          label: 'Scale X',
          min: 0,
          max: 3,
          step: 0.01,
          defaultValue: 1,
          currentValue: 1,
        },
      },
      {
        property: 'scale.y',
        controller: {
          type: 'slider' as const,
          label: 'Scale Y',
          min: 0,
          max: 3,
          step: 0.01,
          defaultValue: 1,
          currentValue: 1,
        },
      },
    ]

    // Store as templates for quick binding creation
    this.defaultControllers = defaultControllers
  }

  private defaultControllers: any[] = []

  getDefaultControllers(): any[] {
    return [...this.defaultControllers]
  }

  // Event system
  onChange(callback: Function): void {
    this.changeListeners.push(callback)
  }

  offChange(callback: Function): void {
    const index = this.changeListeners.indexOf(callback)
    if (index > -1) {
      this.changeListeners.splice(index, 1)
    }
  }

  private notifyChange(): void {
    this.changeListeners.forEach(callback => {
      try {
        callback()
      } catch (error) {
        console.error('Error in change listener:', error)
      }
    })
  }

  // Utility methods
  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  // Cleanup
  destroy(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval)
    }
    this.changeListeners = []
    this.bindings.clear()
  }
}

// Singleton instance
let customizationEngineInstance: CustomizationEngine | null = null

export function getCustomizationEngine(): CustomizationEngine {
  if (!customizationEngineInstance) {
    customizationEngineInstance = new CustomizationEngine()
  }
  return customizationEngineInstance
}

export default CustomizationEngine
