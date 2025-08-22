import React from 'react'
import { interpolate, useCurrentFrame, useVideoConfig, spring } from 'remotion'
import { MotionElement } from '../core'

export interface ImageAnimationProps {
  element: MotionElement
  src: string
  animationType?: 'kenBurns' | 'parallax' | 'reveal' | 'zoom' | 'slide' | 'fade' | 'flip'
  animationConfig?: {
    duration?: number
    delay?: number
    easing?: 'linear' | 'ease' | 'spring' | 'bounce'
    direction?: 'up' | 'down' | 'left' | 'right' | 'in' | 'out'
    intensity?: number
    startScale?: number
    endScale?: number
    revealDirection?: 'horizontal' | 'vertical' | 'diagonal' | 'circular'
    parallaxSpeed?: number
  }
  style?: React.CSSProperties
  overlayConfig?: {
    enabled: boolean
    color: string
    opacity: number
    blendMode: string
  }
}

export const ImageAnimation: React.FC<ImageAnimationProps> = ({
  element,
  src,
  animationType = 'fade',
  animationConfig = {},
  style = {},
  overlayConfig,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  
  const {
    duration = 60,
    delay = 0,
    easing = 'ease',
    direction = 'in',
    intensity = 1,
    startScale = 1,
    endScale = 1.2,
    revealDirection = 'horizontal',
    parallaxSpeed = 0.5,
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
    overflow: 'hidden',
    ...style,
  }

  const renderKenBurns = () => {
    const scale = interpolate(easedProgress, [0, 1], [startScale, endScale])
    const translateX = interpolate(easedProgress, [0, 1], [0, -20 * intensity])
    const translateY = interpolate(easedProgress, [0, 1], [0, -10 * intensity])
    
    return (
      <img
        src={src}
        alt=""
        style={{
          width: '120%',
          height: '120%',
          objectFit: 'cover',
          transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)`,
          transformOrigin: 'center',
        }}
      />
    )
  }

  const renderParallax = () => {
    const elementDuration = element.endFrame - element.startFrame
    const totalProgress = (frame - element.startFrame) / elementDuration
    
    const translateY = interpolate(
      totalProgress, 
      [0, 1], 
      [0, -100 * parallaxSpeed * intensity]
    )
    
    return (
      <img
        src={src}
        alt=""
        style={{
          width: '100%',
          height: '120%',
          objectFit: 'cover',
          transform: `translateY(${translateY}px)`,
        }}
      />
    )
  }

  const renderReveal = () => {
    let clipPath = ''
    
    switch (revealDirection) {
      case 'horizontal':
        const width = interpolate(easedProgress, [0, 1], [0, 100])
        clipPath = `inset(0 ${100 - width}% 0 0)`
        break
      case 'vertical':
        const height = interpolate(easedProgress, [0, 1], [0, 100])
        clipPath = `inset(${100 - height}% 0 0 0)`
        break
      case 'diagonal':
        const diagonal = interpolate(easedProgress, [0, 1], [0, 100])
        clipPath = `polygon(0 0, ${diagonal}% 0, 0 ${diagonal}%)`
        break
      case 'circular':
        const radius = interpolate(easedProgress, [0, 1], [0, 70])
        clipPath = `circle(${radius}% at center)`
        break
    }
    
    return (
      <img
        src={src}
        alt=""
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          clipPath,
        }}
      />
    )
  }

  const renderZoom = () => {
    const scale = direction === 'in' 
      ? interpolate(easedProgress, [0, 1], [0.5, 1])
      : interpolate(easedProgress, [0, 1], [1, 1.5])
    
    const opacity = direction === 'in'
      ? interpolate(easedProgress, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' })
      : interpolate(easedProgress, [0.7, 1], [1, 0], { extrapolateLeft: 'clamp' })
    
    return (
      <img
        src={src}
        alt=""
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${scale})`,
          opacity,
        }}
      />
    )
  }

  const renderSlide = () => {
    let translateX = 0
    let translateY = 0
    
    const distance = 100 * intensity
    
    switch (direction) {
      case 'left':
        translateX = interpolate(easedProgress, [0, 1], [distance, 0])
        break
      case 'right':
        translateX = interpolate(easedProgress, [0, 1], [-distance, 0])
        break
      case 'up':
        translateY = interpolate(easedProgress, [0, 1], [distance, 0])
        break
      case 'down':
        translateY = interpolate(easedProgress, [0, 1], [-distance, 0])
        break
    }
    
    const opacity = interpolate(easedProgress, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' })
    
    return (
      <img
        src={src}
        alt=""
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `translate(${translateX}px, ${translateY}px)`,
          opacity,
        }}
      />
    )
  }

  const renderFade = () => {
    const opacity = interpolate(easedProgress, [0, 1], [0, 1])
    
    return (
      <img
        src={src}
        alt=""
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity,
        }}
      />
    )
  }

  const renderFlip = () => {
    const rotateY = direction === 'horizontal'
      ? interpolate(easedProgress, [0, 1], [90, 0])
      : 0
    
    const rotateX = direction === 'vertical'
      ? interpolate(easedProgress, [0, 1], [90, 0])
      : 0
    
    return (
      <img
        src={src}
        alt=""
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`,
          transformStyle: 'preserve-3d',
        }}
      />
    )
  }

  const getImageContent = () => {
    switch (animationType) {
      case 'kenBurns':
        return renderKenBurns()
      case 'parallax':
        return renderParallax()
      case 'reveal':
        return renderReveal()
      case 'zoom':
        return renderZoom()
      case 'slide':
        return renderSlide()
      case 'fade':
        return renderFade()
      case 'flip':
        return renderFlip()
      default:
        return renderFade()
    }
  }

  const renderOverlay = () => {
    if (!overlayConfig?.enabled) return null
    
    return (
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: overlayConfig.color,
          opacity: overlayConfig.opacity,
          mixBlendMode: overlayConfig.blendMode as any,
          pointerEvents: 'none',
        }}
      />
    )
  }

  return (
    <div style={baseStyle}>
      {getImageContent()}
      {renderOverlay()}
    </div>
  )
}

// Preset configurations for common image animations
export const ImageAnimationPresets = {
  kenBurnsZoomIn: {
    animationType: 'kenBurns' as const,
    animationConfig: {
      duration: 180,
      startScale: 1,
      endScale: 1.3,
      intensity: 1,
      easing: 'ease' as const,
    },
  },
  
  parallaxSlow: {
    animationType: 'parallax' as const,
    animationConfig: {
      parallaxSpeed: 0.3,
      intensity: 1,
    },
  },
  
  revealLeft: {
    animationType: 'reveal' as const,
    animationConfig: {
      duration: 45,
      revealDirection: 'horizontal' as const,
      easing: 'ease' as const,
    },
  },
  
  zoomInFade: {
    animationType: 'zoom' as const,
    animationConfig: {
      duration: 60,
      direction: 'in' as const,
      easing: 'ease' as const,
    },
  },
  
  slideFromLeft: {
    animationType: 'slide' as const,
    animationConfig: {
      duration: 45,
      direction: 'left' as const,
      intensity: 1,
      easing: 'ease' as const,
    },
  },
  
  fadeInSlow: {
    animationType: 'fade' as const,
    animationConfig: {
      duration: 90,
      easing: 'ease' as const,
    },
  },
  
  flipHorizontal: {
    animationType: 'flip' as const,
    animationConfig: {
      duration: 30,
      direction: 'horizontal' as const,
      easing: 'ease' as const,
    },
  },
}

export default ImageAnimation
