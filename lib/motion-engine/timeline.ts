import { MotionProject, MotionScene, MotionElement, Animation, Keyframe } from './core'
import { getMotionEngine } from './core'

export interface TimelineState {
  currentFrame: number
  totalFrames: number
  playbackSpeed: number
  isPlaying: boolean
  looping: boolean
  selectedElements: string[]
  selectedKeyframes: string[]
  zoom: number
  scrollPosition: number
}

export interface TimelineTrack {
  id: string
  elementId: string
  elementName: string
  elementType: string
  layer: number
  startFrame: number
  endFrame: number
  duration: number
  color: string
  locked: boolean
  visible: boolean
  animations: TimelineAnimation[]
}

export interface TimelineAnimation {
  id: string
  property: string
  keyframes: TimelineKeyframe[]
  color: string
  visible: boolean
}

export interface TimelineKeyframe {
  id: string
  frame: number
  value: any
  selected: boolean
  easing: string
  interpolation: 'linear' | 'bezier' | 'hold' | 'auto'
}

export interface TimelineMarker {
  id: string
  frame: number
  label: string
  color: string
  type: 'scene' | 'custom' | 'audio' | 'comment'
}

export interface TimelineSelection {
  type: 'element' | 'keyframe' | 'timeRange'
  items: string[]
  startFrame?: number
  endFrame?: number
}

export class TimelineManager {
  private motionEngine = getMotionEngine()
  private state: TimelineState
  private tracks: TimelineTrack[] = []
  private markers: TimelineMarker[] = []
  private selection: TimelineSelection | null = null
  private undoStack: TimelineState[] = []
  private redoStack: TimelineState[] = []
  private maxUndoSteps = 50

  constructor() {
    this.state = {
      currentFrame: 0,
      totalFrames: 300,
      playbackSpeed: 1,
      isPlaying: false,
      looping: false,
      selectedElements: [],
      selectedKeyframes: [],
      zoom: 1,
      scrollPosition: 0,
    }

    this.setupEventListeners()
  }

  private setupEventListeners(): void {
    this.motionEngine.on('projectLoad', (project: MotionProject) => {
      this.loadProjectTimeline(project)
    })

    this.motionEngine.on('frameUpdate', (frame: number) => {
      this.setCurrentFrame(frame)
    })
  }

  // Timeline state management
  getState(): TimelineState {
    return { ...this.state }
  }

  setState(updates: Partial<TimelineState>): void {
    this.saveStateToUndo()
    this.state = { ...this.state, ...updates }
    this.emitStateChange()
  }

  // Project timeline loading
  loadProjectTimeline(project: MotionProject): void {
    this.state.totalFrames = project.duration
    this.state.currentFrame = 0
    this.tracks = []
    this.markers = []

    // Create tracks for all elements across all scenes
    project.scenes.forEach(scene => {
      this.addSceneMarker(scene)
      scene.elements.forEach(element => {
        this.addElementTrack(element, scene)
      })
    })

    this.emitTimelineUpdate()
  }

  private addSceneMarker(scene: MotionScene): void {
    this.markers.push({
      id: `scene-${scene.id}`,
      frame: scene.startFrame,
      label: scene.title,
      color: '#3b82f6',
      type: 'scene',
    })
  }

  private addElementTrack(element: MotionElement, scene: MotionScene): void {
    const track: TimelineTrack = {
      id: `track-${element.id}`,
      elementId: element.id,
      elementName: element.name,
      elementType: element.type,
      layer: element.layer,
      startFrame: element.startFrame,
      endFrame: element.endFrame,
      duration: element.endFrame - element.startFrame,
      color: this.getElementColor(element.type),
      locked: element.locked,
      visible: element.visible,
      animations: element.animations.map(anim => this.createTimelineAnimation(anim)),
    }

    this.tracks.push(track)
  }

  private createTimelineAnimation(animation: Animation): TimelineAnimation {
    return {
      id: animation.id,
      property: animation.property,
      keyframes: animation.keyframes.map(kf => ({
        id: `kf-${kf.frame}-${animation.id}`,
        frame: kf.frame,
        value: kf.value,
        selected: false,
        easing: kf.easing || animation.easing,
        interpolation: 'auto',
      })),
      color: this.getPropertyColor(animation.property),
      visible: true,
    }
  }

  // Playback control
  play(): void {
    this.setState({ isPlaying: true })
    this.motionEngine.play()
  }

  pause(): void {
    this.setState({ isPlaying: false })
    this.motionEngine.pause()
  }

  stop(): void {
    this.setState({ isPlaying: false, currentFrame: 0 })
    this.motionEngine.stop()
  }

  setCurrentFrame(frame: number): void {
    const clampedFrame = Math.max(0, Math.min(frame, this.state.totalFrames))
    this.setState({ currentFrame: clampedFrame })
    this.motionEngine.seekToFrame(clampedFrame)
  }

  setPlaybackSpeed(speed: number): void {
    this.setState({ playbackSpeed: speed })
    this.motionEngine.setPlaybackSpeed(speed)
  }

  toggleLooping(): void {
    this.setState({ looping: !this.state.looping })
  }

  // Timeline navigation
  goToNextKeyframe(): void {
    const nextKeyframe = this.findNextKeyframe(this.state.currentFrame)
    if (nextKeyframe) {
      this.setCurrentFrame(nextKeyframe.frame)
    }
  }

  goToPreviousKeyframe(): void {
    const prevKeyframe = this.findPreviousKeyframe(this.state.currentFrame)
    if (prevKeyframe) {
      this.setCurrentFrame(prevKeyframe.frame)
    }
  }

  goToNextMarker(): void {
    const nextMarker = this.markers.find(marker => marker.frame > this.state.currentFrame)
    if (nextMarker) {
      this.setCurrentFrame(nextMarker.frame)
    }
  }

  goToPreviousMarker(): void {
    const prevMarker = [...this.markers]
      .reverse()
      .find(marker => marker.frame < this.state.currentFrame)
    if (prevMarker) {
      this.setCurrentFrame(prevMarker.frame)
    }
  }

  // Keyframe management
  addKeyframe(elementId: string, property: string, frame: number, value: any): void {
    const track = this.tracks.find(t => t.elementId === elementId)
    if (!track) return

    const animation = track.animations.find(a => a.property === property)
    if (!animation) {
      // Create new animation track
      const newAnimation: TimelineAnimation = {
        id: this.generateId(),
        property,
        keyframes: [],
        color: this.getPropertyColor(property),
        visible: true,
      }
      track.animations.push(newAnimation)
    }

    const targetAnimation = track.animations.find(a => a.property === property)!
    
    // Check if keyframe already exists at this frame
    const existingKeyframe = targetAnimation.keyframes.find(kf => kf.frame === frame)
    if (existingKeyframe) {
      existingKeyframe.value = value
    } else {
      targetAnimation.keyframes.push({
        id: this.generateId(),
        frame,
        value,
        selected: false,
        easing: 'ease',
        interpolation: 'auto',
      })
      
      // Sort keyframes by frame
      targetAnimation.keyframes.sort((a, b) => a.frame - b.frame)
    }

    this.emitTimelineUpdate()
  }

  removeKeyframe(keyframeId: string): void {
    this.tracks.forEach(track => {
      track.animations.forEach(animation => {
        const index = animation.keyframes.findIndex(kf => kf.id === keyframeId)
        if (index > -1) {
          animation.keyframes.splice(index, 1)
        }
      })
    })
    this.emitTimelineUpdate()
  }

  moveKeyframe(keyframeId: string, newFrame: number): void {
    this.tracks.forEach(track => {
      track.animations.forEach(animation => {
        const keyframe = animation.keyframes.find(kf => kf.id === keyframeId)
        if (keyframe) {
          keyframe.frame = newFrame
          animation.keyframes.sort((a, b) => a.frame - b.frame)
        }
      })
    })
    this.emitTimelineUpdate()
  }

  // Selection management
  selectElement(elementId: string, addToSelection = false): void {
    if (addToSelection) {
      if (!this.state.selectedElements.includes(elementId)) {
        this.setState({
          selectedElements: [...this.state.selectedElements, elementId]
        })
      }
    } else {
      this.setState({ selectedElements: [elementId] })
    }
  }

  selectKeyframe(keyframeId: string, addToSelection = false): void {
    if (addToSelection) {
      if (!this.state.selectedKeyframes.includes(keyframeId)) {
        this.setState({
          selectedKeyframes: [...this.state.selectedKeyframes, keyframeId]
        })
      }
    } else {
      this.setState({ selectedKeyframes: [keyframeId] })
    }
  }

  clearSelection(): void {
    this.setState({ selectedElements: [], selectedKeyframes: [] })
  }

  // Timeline view management
  setZoom(zoom: number): void {
    this.setState({ zoom: Math.max(0.1, Math.min(zoom, 10)) })
  }

  setScrollPosition(position: number): void {
    this.setState({ scrollPosition: Math.max(0, position) })
  }

  fitTimelineToWindow(): void {
    // Calculate zoom level to fit entire timeline in view
    const zoom = 1 // This would be calculated based on window size
    this.setState({ zoom, scrollPosition: 0 })
  }

  // Utility methods
  private findNextKeyframe(currentFrame: number): TimelineKeyframe | null {
    let nextKeyframe: TimelineKeyframe | null = null
    let minDistance = Infinity

    this.tracks.forEach(track => {
      track.animations.forEach(animation => {
        animation.keyframes.forEach(keyframe => {
          if (keyframe.frame > currentFrame) {
            const distance = keyframe.frame - currentFrame
            if (distance < minDistance) {
              minDistance = distance
              nextKeyframe = keyframe
            }
          }
        })
      })
    })

    return nextKeyframe
  }

  private findPreviousKeyframe(currentFrame: number): TimelineKeyframe | null {
    let prevKeyframe: TimelineKeyframe | null = null
    let minDistance = Infinity

    this.tracks.forEach(track => {
      track.animations.forEach(animation => {
        animation.keyframes.forEach(keyframe => {
          if (keyframe.frame < currentFrame) {
            const distance = currentFrame - keyframe.frame
            if (distance < minDistance) {
              minDistance = distance
              prevKeyframe = keyframe
            }
          }
        })
      })
    })

    return prevKeyframe
  }

  private getElementColor(elementType: string): string {
    const colors = {
      text: '#10b981',
      shape: '#3b82f6',
      image: '#f59e0b',
      video: '#ef4444',
      audio: '#8b5cf6',
      particle: '#ec4899',
      logo: '#06b6d4',
      group: '#6b7280',
    }
    return colors[elementType as keyof typeof colors] || '#6b7280'
  }

  private getPropertyColor(property: string): string {
    const colors = {
      'position.x': '#ef4444',
      'position.y': '#10b981',
      'position.z': '#3b82f6',
      'scale.x': '#f59e0b',
      'scale.y': '#f59e0b',
      'scale.z': '#f59e0b',
      'rotation.x': '#8b5cf6',
      'rotation.y': '#8b5cf6',
      'rotation.z': '#8b5cf6',
      opacity: '#6b7280',
    }
    return colors[property as keyof typeof colors] || '#6b7280'
  }

  // Undo/Redo system
  private saveStateToUndo(): void {
    this.undoStack.push({ ...this.state })
    if (this.undoStack.length > this.maxUndoSteps) {
      this.undoStack.shift()
    }
    this.redoStack = [] // Clear redo stack when new action is performed
  }

  undo(): boolean {
    if (this.undoStack.length === 0) return false
    
    this.redoStack.push({ ...this.state })
    const previousState = this.undoStack.pop()!
    this.state = previousState
    this.emitStateChange()
    return true
  }

  redo(): boolean {
    if (this.redoStack.length === 0) return false
    
    this.undoStack.push({ ...this.state })
    const nextState = this.redoStack.pop()!
    this.state = nextState
    this.emitStateChange()
    return true
  }

  // Event emission
  private emitStateChange(): void {
    // Emit timeline state change event
  }

  private emitTimelineUpdate(): void {
    // Emit timeline structure update event
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  // Getters
  getTracks(): TimelineTrack[] {
    return [...this.tracks]
  }

  getMarkers(): TimelineMarker[] {
    return [...this.markers]
  }

  getSelectedElements(): string[] {
    return [...this.state.selectedElements]
  }

  getSelectedKeyframes(): string[] {
    return [...this.state.selectedKeyframes]
  }
}

// Singleton instance
let timelineManagerInstance: TimelineManager | null = null

export function getTimelineManager(): TimelineManager {
  if (!timelineManagerInstance) {
    timelineManagerInstance = new TimelineManager()
  }
  return timelineManagerInstance
}

export default TimelineManager
