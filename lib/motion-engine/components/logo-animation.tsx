import React from 'react'
import { interpolate, useCurrentFrame, useVideoConfig, spring } from 'remotion'
import { MotionElement } from '../core'

export interface LogoAnimationProps {
  element: MotionElement
  src?: string
  logoType?: 'image' | 'text' | 'svg'
  text?: string
  animationType?: '3dRotate' | 'shimmer' | 'pulse' | 'typewriter' | 'glitch' | 'neon' | 'liquid'
  animationConfig?: {
    duration?: number
    delay?: number
    easing?: 'linear' | 'ease' | 'spring' | 'bounce'
    intensity?: number
    colors?: string[]
    glowColor?: string
    shimmerSpeed?: number
    pulseScale?: number
    rotationAxis?: 'x' | 'y' | 'z'
    perspective?: number
  }
  style?: React.CSSProperties
}

export const LogoAnimation: React.FC<LogoAnimationProps> = ({
  element,
  src,
  logoType = 'image',
  text = 'LOGO',
  animationType = 'pulse',
  animationConfig = {},
  style = {},
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  
  const {
    duration = 120,
    delay = 0,
    easing = 'ease',
    intensity = 1,
    colors = ['#ffffff', '#ff0000', '#00ff00', '#0000ff'],
    glowColor = '#ffffff',
    shimmerSpeed = 1,
    pulseScale = 1.2,
    rotationAxis = 'y',
    perspective = 1000,
  } = animationConfig

  const startFrame = element.startFrame + delay
  const animationProgress = Math.max(0, Math.min(1, (frame - startFrame) / duration))

  // Don't render if outside element's time range
  if (frame < element.startFrame || frame > element.endFrame) {
    return null
  }

  const getEasedProgress = () => {
    switch (easing) {
      case 'spring':
        return spring({
          frame: frame - startFrame,
          fps,
          config: { damping: 10, stiffness: 100 }
        })
      case 'bounce':
        return interpolate(animationProgress, [0, 1], [0, 1], { 
          easing: (t) => {
            const n1 = 7.5625
            const d1 = 2.75
            if (t < 1 / d1) {
              return n1 * t * t
            } else if (t < 2 / d1) {
              return n1 * (t -= 1.5 / d1) * t + 0.75
            } else if (t < 2.5 / d1) {
              return n1 * (t -= 2.25 / d1) * t + 0.9375
            } else {
              return n1 * (t -= 2.625 / d1) * t + 0.984375
            }
          }
        })
      case 'linear':
        return animationProgress
      default:
        return interpolate(animationProgress, [0, 1], [0, 1])
    }
  }

  const easedProgress = getEasedProgress()

  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    left: element.properties.position.x,
    top: element.properties.position.y,
    width: element.properties.size.width,
    height: element.properties.size.height,
    opacity: element.properties.opacity || 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transformStyle: 'preserve-3d',
    perspective: perspective,
    ...style,
  }

  const render3DRotate = () => {
    let rotation = 0
    
    switch (rotationAxis) {
      case 'x':
        rotation = interpolate(easedProgress, [0, 1], [0, 360])
        return {
          transform: `rotateX(${rotation}deg)`,
        }
      case 'y':
        rotation = interpolate(easedProgress, [0, 1], [0, 360])
        return {
          transform: `rotateY(${rotation}deg)`,
        }
      case 'z':
        rotation = interpolate(easedProgress, [0, 1], [0, 360])
        return {
          transform: `rotateZ(${rotation}deg)`,
        }
      default:
        rotation = interpolate(easedProgress, [0, 1], [0, 360])
        return {
          transform: `rotateY(${rotation}deg)`,
        }
    }
  }

  const renderShimmer = () => {
    const shimmerPosition = interpolate(
      (frame * shimmerSpeed) % 60, 
      [0, 60], 
      [-100, 200]
    )
    
    return {
      position: 'relative' as const,
      overflow: 'hidden',
      '::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: `${shimmerPosition}%`,
        width: '50%',
        height: '100%',
        background: `linear-gradient(90deg, transparent, ${glowColor}40, transparent)`,
        transform: 'skewX(-20deg)',
      },
    }
  }

  const renderPulse = () => {
    const scale = interpolate(
      Math.sin((frame - startFrame) * 0.1) * 0.5 + 0.5,
      [0, 1],
      [1, pulseScale]
    )
    
    const glowIntensity = interpolate(
      Math.sin((frame - startFrame) * 0.1) * 0.5 + 0.5,
      [0, 1],
      [0, intensity]
    )
    
    return {
      transform: `scale(${scale})`,
      filter: `drop-shadow(0 0 ${glowIntensity * 10}px ${glowColor})`,
    }
  }

  const renderTypewriter = () => {
    if (logoType !== 'text') return {}
    
    const charactersToShow = Math.floor(easedProgress * text.length)
    const visibleText = text.substring(0, charactersToShow)
    
    return {
      content: visibleText,
      borderRight: charactersToShow < text.length ? '2px solid currentColor' : 'none',
    }
  }

  const renderGlitch = () => {
    const glitchIntensity = Math.sin(frame * 0.5) * intensity
    const offsetX = Math.random() * glitchIntensity * 5 - glitchIntensity * 2.5
    const offsetY = Math.random() * glitchIntensity * 5 - glitchIntensity * 2.5
    
    const colorIndex = Math.floor(Math.random() * colors.length)
    const glitchColor = colors[colorIndex]
    
    return {
      transform: `translate(${offsetX}px, ${offsetY}px)`,
      filter: `hue-rotate(${Math.random() * 360}deg) saturate(${1 + glitchIntensity})`,
      textShadow: `${offsetX}px ${offsetY}px 0 ${glitchColor}`,
    }
  }

  const renderNeon = () => {
    const glowIntensity = interpolate(
      Math.sin((frame - startFrame) * 0.2) * 0.5 + 0.5,
      [0, 1],
      [0.5, 1]
    )
    
    const neonGlow = `
      0 0 5px ${glowColor},
      0 0 10px ${glowColor},
      0 0 15px ${glowColor},
      0 0 20px ${glowColor}
    `
    
    return {
      color: glowColor,
      textShadow: neonGlow,
      filter: `brightness(${glowIntensity})`,
      border: logoType === 'text' ? 'none' : `2px solid ${glowColor}`,
      boxShadow: logoType !== 'text' ? neonGlow : 'none',
    }
  }

  const renderLiquid = () => {
    const waveOffset = Math.sin((frame - startFrame) * 0.1) * intensity * 10
    const liquidScale = interpolate(
      Math.sin((frame - startFrame) * 0.05) * 0.5 + 0.5,
      [0, 1],
      [0.95, 1.05]
    )
    
    return {
      transform: `scale(${liquidScale}) translateY(${waveOffset}px)`,
      filter: `blur(${Math.abs(waveOffset) * 0.1}px)`,
      borderRadius: logoType !== 'text' ? `${50 + waveOffset}%` : '0',
    }
  }

  const getAnimationStyle = (): React.CSSProperties => {
    switch (animationType) {
      case '3dRotate':
        return render3DRotate()
      case 'shimmer':
        return renderShimmer()
      case 'pulse':
        return renderPulse()
      case 'glitch':
        return renderGlitch()
      case 'neon':
        return renderNeon()
      case 'liquid':
        return renderLiquid()
      default:
        return {}
    }
  }

  const renderContent = () => {
    const animationStyle = getAnimationStyle()
    
    switch (logoType) {
      case 'image':
        return (
          <img
            src={src}
            alt="Logo"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              ...animationStyle,
            }}
          />
        )
      
      case 'text':
        const textContent = animationType === 'typewriter' 
          ? (animationStyle as any).content || text
          : text
        
        return (
          <div
            style={{
              fontSize: element.properties.fontSize || 48,
              fontFamily: element.properties.fontFamily || 'Arial, sans-serif',
              fontWeight: element.properties.fontWeight || 'bold',
              color: element.properties.color || '#ffffff',
              textAlign: 'center',
              ...animationStyle,
            }}
          >
            {textContent}
            {animationType === 'typewriter' && (animationStyle as any).borderRight && (
              <span style={{ borderRight: (animationStyle as any).borderRight }} />
            )}
          </div>
        )
      
      case 'svg':
        return (
          <div
            style={{
              width: '100%',
              height: '100%',
              ...animationStyle,
            }}
            dangerouslySetInnerHTML={{ __html: src || '' }}
          />
        )
      
      default:
        return null
    }
  }

  return (
    <div style={baseStyle}>
      {renderContent()}
    </div>
  )
}

// Preset configurations for common logo animations
export const LogoAnimationPresets = {
  rotate3D: {
    animationType: '3dRotate' as const,
    animationConfig: {
      duration: 120,
      rotationAxis: 'y' as const,
      easing: 'ease' as const,
      perspective: 1000,
    },
  },
  
  shimmerEffect: {
    animationType: 'shimmer' as const,
    animationConfig: {
      shimmerSpeed: 1.5,
      glowColor: '#ffffff',
    },
  },
  
  pulseGlow: {
    animationType: 'pulse' as const,
    animationConfig: {
      pulseScale: 1.15,
      intensity: 1,
      glowColor: '#00ff00',
      easing: 'ease' as const,
    },
  },
  
  typewriterReveal: {
    logoType: 'text' as const,
    animationType: 'typewriter' as const,
    animationConfig: {
      duration: 90,
      easing: 'ease' as const,
    },
  },
  
  glitchEffect: {
    animationType: 'glitch' as const,
    animationConfig: {
      intensity: 0.5,
      colors: ['#ff0000', '#00ff00', '#0000ff'],
    },
  },
  
  neonSign: {
    animationType: 'neon' as const,
    animationConfig: {
      glowColor: '#00ffff',
      intensity: 1,
    },
  },
  
  liquidMorph: {
    animationType: 'liquid' as const,
    animationConfig: {
      intensity: 1,
      easing: 'ease' as const,
    },
  },
}

export default LogoAnimation
