import React from 'react'
import { interpolate, useCurrentFrame, useVideoConfig, spring } from 'remotion'
import { MotionElement } from '../core'

export interface TextAnimationProps {
  element: MotionElement
  text: string
  style?: React.CSSProperties
  animationType?: 'typewriter' | 'fade' | 'slide' | 'bounce' | 'scale' | 'rotate' | 'wave'
  animationConfig?: {
    duration?: number
    delay?: number
    stagger?: number
    direction?: 'up' | 'down' | 'left' | 'right'
    easing?: 'linear' | 'ease' | 'spring' | 'bounce'
  }
}

export interface TypewriterConfig {
  speed: number // characters per second
  cursor: boolean
  cursorChar: string
  cursorBlink: boolean
}

export interface WaveConfig {
  amplitude: number
  frequency: number
  speed: number
}

export const TextAnimation: React.FC<TextAnimationProps> = ({
  element,
  text,
  style = {},
  animationType = 'fade',
  animationConfig = {},
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  
  const {
    duration = 60,
    delay = 0,
    stagger = 2,
    direction = 'up',
    easing = 'ease',
  } = animationConfig

  const startFrame = element.startFrame + delay
  const animationProgress = Math.max(0, Math.min(1, (frame - startFrame) / duration))

  const renderTypewriter = () => {
    const config: TypewriterConfig = {
      speed: 2,
      cursor: true,
      cursorChar: '|',
      cursorBlink: true,
      ...animationConfig,
    }

    const charactersToShow = Math.floor(animationProgress * text.length)
    const visibleText = text.substring(0, charactersToShow)
    
    const showCursor = config.cursor && (
      charactersToShow < text.length || 
      (config.cursorBlink && Math.floor(frame / 15) % 2 === 0)
    )

    return (
      <span>
        {visibleText}
        {showCursor && <span style={{ opacity: 0.8 }}>{config.cursorChar}</span>}
      </span>
    )
  }

  const renderFade = () => {
    const opacity = interpolate(animationProgress, [0, 1], [0, 1])
    
    return (
      <span style={{ opacity }}>
        {text}
      </span>
    )
  }

  const renderSlide = () => {
    const getTransform = () => {
      const distance = 50
      let translateX = 0
      let translateY = 0

      switch (direction) {
        case 'up':
          translateY = interpolate(animationProgress, [0, 1], [distance, 0])
          break
        case 'down':
          translateY = interpolate(animationProgress, [0, 1], [-distance, 0])
          break
        case 'left':
          translateX = interpolate(animationProgress, [0, 1], [distance, 0])
          break
        case 'right':
          translateX = interpolate(animationProgress, [0, 1], [-distance, 0])
          break
      }

      return `translate(${translateX}px, ${translateY}px)`
    }

    const opacity = interpolate(animationProgress, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' })

    return (
      <span style={{ 
        transform: getTransform(),
        opacity,
      }}>
        {text}
      </span>
    )
  }

  const renderBounce = () => {
    const bounceValue = easing === 'spring' 
      ? spring({
          frame: frame - startFrame,
          fps,
          config: { damping: 10, stiffness: 100 }
        })
      : interpolate(animationProgress, [0, 1], [0, 1])

    const scale = interpolate(bounceValue, [0, 1], [0.5, 1])
    const opacity = interpolate(animationProgress, [0, 0.2], [0, 1], { extrapolateRight: 'clamp' })

    return (
      <span style={{ 
        transform: `scale(${scale})`,
        opacity,
        display: 'inline-block',
      }}>
        {text}
      </span>
    )
  }

  const renderScale = () => {
    const scale = interpolate(animationProgress, [0, 1], [0, 1])
    const opacity = interpolate(animationProgress, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' })

    return (
      <span style={{ 
        transform: `scale(${scale})`,
        opacity,
        display: 'inline-block',
      }}>
        {text}
      </span>
    )
  }

  const renderRotate = () => {
    const rotation = interpolate(animationProgress, [0, 1], [180, 0])
    const opacity = interpolate(animationProgress, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' })

    return (
      <span style={{ 
        transform: `rotate(${rotation}deg)`,
        opacity,
        display: 'inline-block',
      }}>
        {text}
      </span>
    )
  }

  const renderWave = () => {
    const config: WaveConfig = {
      amplitude: 10,
      frequency: 0.5,
      speed: 1,
      ...animationConfig,
    }

    return (
      <span>
        {text.split('').map((char, index) => {
          const charDelay = index * stagger
          const charProgress = Math.max(0, Math.min(1, (frame - startFrame - charDelay) / duration))
          
          const waveOffset = Math.sin((frame * config.speed + index * config.frequency) * 0.1) * config.amplitude
          const opacity = interpolate(charProgress, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' })
          
          return (
            <span
              key={index}
              style={{
                display: 'inline-block',
                transform: `translateY(${waveOffset}px)`,
                opacity,
                transition: 'opacity 0.3s ease',
              }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          )
        })}
      </span>
    )
  }

  const renderStaggered = (renderFunction: () => React.ReactNode) => {
    if (animationType === 'typewriter' || animationType === 'wave') {
      return renderFunction()
    }

    return (
      <span>
        {text.split('').map((char, index) => {
          const charDelay = index * stagger
          const charStartFrame = startFrame + charDelay
          const charProgress = Math.max(0, Math.min(1, (frame - charStartFrame) / duration))
          
          // Apply the animation to each character individually
          const charElement = { ...element, startFrame: charStartFrame }
          
          return (
            <TextAnimation
              key={index}
              element={charElement}
              text={char === ' ' ? '\u00A0' : char}
              animationType={animationType}
              animationConfig={{
                ...animationConfig,
                stagger: 0, // Prevent recursive staggering
              }}
            />
          )
        })}
      </span>
    )
  }

  const getAnimationContent = () => {
    switch (animationType) {
      case 'typewriter':
        return renderTypewriter()
      case 'fade':
        return renderFade()
      case 'slide':
        return renderSlide()
      case 'bounce':
        return renderBounce()
      case 'scale':
        return renderScale()
      case 'rotate':
        return renderRotate()
      case 'wave':
        return renderWave()
      default:
        return <span>{text}</span>
    }
  }

  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    left: element.properties.position.x,
    top: element.properties.position.y,
    fontSize: element.properties.fontSize || 24,
    fontFamily: element.properties.fontFamily || 'Arial, sans-serif',
    fontWeight: element.properties.fontWeight || 'normal',
    color: element.properties.color || '#ffffff',
    textAlign: element.properties.textAlign || 'left',
    lineHeight: element.properties.lineHeight || 1.2,
    letterSpacing: element.properties.letterSpacing || 'normal',
    textShadow: element.properties.textShadow || 'none',
    opacity: element.properties.opacity || 1,
    transform: `
      scale(${element.properties.scale?.x || 1}, ${element.properties.scale?.y || 1})
      rotate(${element.properties.rotation?.z || 0}deg)
    `,
    transformOrigin: 'center',
    ...style,
  }

  // Don't render if outside element's time range
  if (frame < element.startFrame || frame > element.endFrame) {
    return null
  }

  return (
    <div style={baseStyle}>
      {stagger > 0 && animationType !== 'typewriter' && animationType !== 'wave' 
        ? renderStaggered(getAnimationContent)
        : getAnimationContent()
      }
    </div>
  )
}

// Preset configurations for common text animations
export const TextAnimationPresets = {
  typewriter: {
    animationType: 'typewriter' as const,
    animationConfig: {
      speed: 2,
      cursor: true,
      cursorChar: '|',
      cursorBlink: true,
    },
  },
  
  fadeIn: {
    animationType: 'fade' as const,
    animationConfig: {
      duration: 30,
      easing: 'ease' as const,
    },
  },
  
  slideUp: {
    animationType: 'slide' as const,
    animationConfig: {
      duration: 45,
      direction: 'up' as const,
      easing: 'ease' as const,
    },
  },
  
  bounceIn: {
    animationType: 'bounce' as const,
    animationConfig: {
      duration: 60,
      easing: 'spring' as const,
    },
  },
  
  staggeredFade: {
    animationType: 'fade' as const,
    animationConfig: {
      duration: 20,
      stagger: 3,
      easing: 'ease' as const,
    },
  },
  
  wave: {
    animationType: 'wave' as const,
    animationConfig: {
      amplitude: 15,
      frequency: 0.3,
      speed: 1.5,
      stagger: 2,
    },
  },
}

export default TextAnimation
