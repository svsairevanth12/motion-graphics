import React, { useMemo } from 'react'
import { interpolate, useCurrentFrame, useVideoConfig, random } from 'remotion'
import { MotionElement } from '../core'

export interface ParticleSystemProps {
  element: MotionElement
  particleType: 'confetti' | 'sparkles' | 'smoke' | 'bubbles' | 'stars' | 'custom'
  particleCount?: number
  emissionConfig?: {
    rate: number // particles per second
    burst?: boolean
    burstCount?: number
    duration?: number
  }
  particleConfig?: {
    size: { min: number; max: number }
    speed: { min: number; max: number }
    lifetime: { min: number; max: number }
    colors: string[]
    gravity: number
    wind: number
    rotation: boolean
    fade: boolean
    scale: boolean
  }
  style?: React.CSSProperties
}

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  rotation: number
  rotationSpeed: number
  lifetime: number
  maxLifetime: number
  birthFrame: number
}

export const ParticleSystem: React.FC<ParticleSystemProps> = ({
  element,
  particleType,
  particleCount = 50,
  emissionConfig = {},
  particleConfig = {},
  style = {},
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  
  const {
    rate = 10,
    burst = false,
    burstCount = 20,
    duration = 120,
  } = emissionConfig

  const {
    size = { min: 2, max: 8 },
    speed = { min: 1, max: 5 },
    lifetime = { min: 60, max: 120 },
    colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'],
    gravity = 0.1,
    wind = 0,
    rotation = true,
    fade = true,
    scale = true,
  } = particleConfig

  // Don't render if outside element's time range
  if (frame < element.startFrame || frame > element.endFrame) {
    return null
  }

  const particles = useMemo(() => {
    const particleArray: Particle[] = []
    const startFrame = element.startFrame
    const endFrame = Math.min(element.endFrame, startFrame + duration)
    
    if (burst) {
      // Burst emission at the start
      for (let i = 0; i < burstCount; i++) {
        const particle = createParticle(i, startFrame, particleType, size, speed, lifetime, colors)
        particleArray.push(particle)
      }
    } else {
      // Continuous emission
      const totalFrames = endFrame - startFrame
      const totalParticles = Math.floor((totalFrames / fps) * rate)
      
      for (let i = 0; i < Math.min(totalParticles, particleCount); i++) {
        const birthFrame = startFrame + (i / rate) * fps
        const particle = createParticle(i, birthFrame, particleType, size, speed, lifetime, colors)
        particleArray.push(particle)
      }
    }
    
    return particleArray
  }, [element.startFrame, element.endFrame, particleType, particleCount, burst, burstCount, rate, duration, fps])

  const createParticle = (
    id: number,
    birthFrame: number,
    type: string,
    sizeRange: { min: number; max: number },
    speedRange: { min: number; max: number },
    lifetimeRange: { min: number; max: number },
    colorPalette: string[]
  ): Particle => {
    const seed = id + birthFrame
    
    // Base position at element center
    const baseX = element.properties.position.x + element.properties.size.width / 2
    const baseY = element.properties.position.y + element.properties.size.height / 2
    
    // Add some randomness to initial position
    const x = baseX + random(seed) * 40 - 20
    const y = baseY + random(seed + 1) * 40 - 20
    
    // Velocity based on particle type
    let vx, vy
    
    switch (type) {
      case 'confetti':
        vx = (random(seed + 2) - 0.5) * speedRange.max * 2
        vy = -random(seed + 3) * speedRange.max - speedRange.min
        break
      case 'sparkles':
        const angle = random(seed + 2) * Math.PI * 2
        const speed = random(seed + 3) * (speedRange.max - speedRange.min) + speedRange.min
        vx = Math.cos(angle) * speed
        vy = Math.sin(angle) * speed
        break
      case 'smoke':
        vx = (random(seed + 2) - 0.5) * speedRange.max * 0.5
        vy = -random(seed + 3) * speedRange.max - speedRange.min * 0.5
        break
      case 'bubbles':
        vx = (random(seed + 2) - 0.5) * speedRange.max * 0.3
        vy = -random(seed + 3) * speedRange.max - speedRange.min
        break
      default:
        vx = (random(seed + 2) - 0.5) * speedRange.max
        vy = (random(seed + 3) - 0.5) * speedRange.max
    }
    
    return {
      id,
      x,
      y,
      vx,
      vy,
      size: random(seed + 4) * (sizeRange.max - sizeRange.min) + sizeRange.min,
      color: colorPalette[Math.floor(random(seed + 5) * colorPalette.length)],
      rotation: 0,
      rotationSpeed: rotation ? (random(seed + 6) - 0.5) * 10 : 0,
      lifetime: 0,
      maxLifetime: random(seed + 7) * (lifetimeRange.max - lifetimeRange.min) + lifetimeRange.min,
      birthFrame,
    }
  }

  const updateParticle = (particle: Particle, currentFrame: number): Particle => {
    const age = currentFrame - particle.birthFrame
    
    if (age < 0 || age > particle.maxLifetime) {
      return particle // Particle not born yet or dead
    }
    
    // Update position
    const newX = particle.x + particle.vx * age
    const newY = particle.y + particle.vy * age + gravity * age * age * 0.5
    
    // Apply wind
    const windX = particle.x + wind * age
    
    // Update rotation
    const newRotation = particle.rotation + particle.rotationSpeed * age
    
    return {
      ...particle,
      x: windX || newX,
      y: newY,
      rotation: newRotation,
      lifetime: age,
    }
  }

  const renderParticle = (particle: Particle) => {
    const updatedParticle = updateParticle(particle, frame)
    
    // Check if particle is alive
    if (updatedParticle.lifetime < 0 || updatedParticle.lifetime > updatedParticle.maxLifetime) {
      return null
    }
    
    const lifeProgress = updatedParticle.lifetime / updatedParticle.maxLifetime
    
    // Calculate opacity based on lifetime
    let opacity = 1
    if (fade) {
      if (lifeProgress < 0.1) {
        opacity = lifeProgress / 0.1 // Fade in
      } else if (lifeProgress > 0.8) {
        opacity = (1 - lifeProgress) / 0.2 // Fade out
      }
    }
    
    // Calculate scale based on lifetime
    let currentScale = 1
    if (scale) {
      if (particleType === 'bubbles') {
        currentScale = interpolate(lifeProgress, [0, 1], [0.5, 1.5])
      } else if (particleType === 'sparkles') {
        currentScale = interpolate(lifeProgress, [0, 0.5, 1], [0, 1, 0])
      }
    }
    
    const particleStyle: React.CSSProperties = {
      position: 'absolute',
      left: updatedParticle.x,
      top: updatedParticle.y,
      width: updatedParticle.size * currentScale,
      height: updatedParticle.size * currentScale,
      backgroundColor: updatedParticle.color,
      opacity: opacity * (element.properties.opacity || 1),
      transform: `rotate(${updatedParticle.rotation}deg)`,
      pointerEvents: 'none',
    }
    
    // Particle shape based on type
    switch (particleType) {
      case 'confetti':
        particleStyle.borderRadius = '2px'
        break
      case 'sparkles':
        particleStyle.borderRadius = '50%'
        particleStyle.boxShadow = `0 0 ${updatedParticle.size}px ${updatedParticle.color}`
        break
      case 'smoke':
        particleStyle.borderRadius = '50%'
        particleStyle.filter = 'blur(1px)'
        break
      case 'bubbles':
        particleStyle.borderRadius = '50%'
        particleStyle.border = `1px solid ${updatedParticle.color}`
        particleStyle.backgroundColor = 'transparent'
        break
      case 'stars':
        // Render as star shape using CSS
        particleStyle.clipPath = 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
        break
      default:
        particleStyle.borderRadius = '50%'
    }
    
    return (
      <div
        key={`${particle.id}-${particle.birthFrame}`}
        style={particleStyle}
      />
    )
  }

  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    overflow: 'hidden',
    ...style,
  }

  return (
    <div style={baseStyle}>
      {particles.map(particle => renderParticle(particle))}
    </div>
  )
}

// Preset configurations for common particle effects
export const ParticleSystemPresets = {
  confettiExplosion: {
    particleType: 'confetti' as const,
    particleCount: 100,
    emissionConfig: {
      burst: true,
      burstCount: 100,
    },
    particleConfig: {
      size: { min: 3, max: 8 },
      speed: { min: 3, max: 8 },
      lifetime: { min: 90, max: 180 },
      colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'],
      gravity: 0.15,
      rotation: true,
      fade: true,
    },
  },
  
  sparkleTrail: {
    particleType: 'sparkles' as const,
    particleCount: 30,
    emissionConfig: {
      rate: 15,
      duration: 120,
    },
    particleConfig: {
      size: { min: 2, max: 6 },
      speed: { min: 1, max: 3 },
      lifetime: { min: 30, max: 60 },
      colors: ['#ffffff', '#ffff00', '#ffd700'],
      gravity: 0,
      fade: true,
      scale: true,
    },
  },
  
  smokeRising: {
    particleType: 'smoke' as const,
    particleCount: 20,
    emissionConfig: {
      rate: 8,
      duration: 180,
    },
    particleConfig: {
      size: { min: 5, max: 15 },
      speed: { min: 1, max: 2 },
      lifetime: { min: 120, max: 240 },
      colors: ['#666666', '#888888', '#aaaaaa'],
      gravity: -0.05,
      wind: 0.5,
      fade: true,
      scale: true,
    },
  },
  
  bubbleFloat: {
    particleType: 'bubbles' as const,
    particleCount: 15,
    emissionConfig: {
      rate: 5,
      duration: 150,
    },
    particleConfig: {
      size: { min: 8, max: 20 },
      speed: { min: 0.5, max: 1.5 },
      lifetime: { min: 180, max: 300 },
      colors: ['#87ceeb', '#add8e6', '#b0e0e6'],
      gravity: -0.02,
      fade: true,
      scale: true,
    },
  },
  
  starField: {
    particleType: 'stars' as const,
    particleCount: 50,
    emissionConfig: {
      burst: true,
      burstCount: 50,
    },
    particleConfig: {
      size: { min: 3, max: 8 },
      speed: { min: 0, max: 1 },
      lifetime: { min: 300, max: 600 },
      colors: ['#ffffff', '#ffff00', '#ffd700', '#87ceeb'],
      gravity: 0,
      rotation: true,
      fade: true,
    },
  },
}

export default ParticleSystem
