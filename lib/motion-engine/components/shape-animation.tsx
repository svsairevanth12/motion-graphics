import React from 'react'
import { interpolate, useCurrentFrame, useVideoConfig, spring } from 'remotion'
import { MotionElement } from '../core'

export interface ShapeAnimationProps {
  element: MotionElement
  shapeType: 'rectangle' | 'circle' | 'triangle' | 'polygon' | 'star' | 'path'
  animationType?: 'morph' | 'rotate' | 'scale' | 'path' | 'draw' | 'fill'
  style?: React.CSSProperties
  animationConfig?: {
    duration?: number
    delay?: number
    easing?: 'linear' | 'ease' | 'spring' | 'bounce'
    direction?: 'clockwise' | 'counterclockwise'
    morphTarget?: string // SVG path for morphing
    pathLength?: number
    fillDirection?: 'horizontal' | 'vertical' | 'radial'
  }
}

export interface PathAnimationConfig {
  pathData: string
  strokeWidth: number
  strokeColor: string
  fillColor?: string
  dashArray?: string
}

export const ShapeAnimation: React.FC<ShapeAnimationProps> = ({
  element,
  shapeType,
  animationType = 'scale',
  style = {},
  animationConfig = {},
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  
  const {
    duration = 60,
    delay = 0,
    easing = 'ease',
    direction = 'clockwise',
    morphTarget,
    pathLength = 1,
    fillDirection = 'horizontal',
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
    transform: `
      scale(${element.properties.scale?.x || 1}, ${element.properties.scale?.y || 1})
      rotate(${element.properties.rotation?.z || 0}deg)
    `,
    transformOrigin: 'center',
    ...style,
  }

  const renderRectangle = () => {
    const width = element.properties.size.width
    const height = element.properties.size.height
    
    let animatedStyle: React.CSSProperties = {}
    
    switch (animationType) {
      case 'scale':
        const scale = interpolate(easedProgress, [0, 1], [0, 1])
        animatedStyle.transform = `scale(${scale})`
        break
      case 'rotate':
        const rotation = direction === 'clockwise' 
          ? interpolate(easedProgress, [0, 1], [0, 360])
          : interpolate(easedProgress, [0, 1], [360, 0])
        animatedStyle.transform = `rotate(${rotation}deg)`
        break
      case 'fill':
        if (fillDirection === 'horizontal') {
          const fillWidth = interpolate(easedProgress, [0, 1], [0, width])
          animatedStyle.clipPath = `inset(0 ${width - fillWidth}px 0 0)`
        } else if (fillDirection === 'vertical') {
          const fillHeight = interpolate(easedProgress, [0, 1], [0, height])
          animatedStyle.clipPath = `inset(${height - fillHeight}px 0 0 0)`
        }
        break
    }

    return (
      <div
        style={{
          width,
          height,
          backgroundColor: element.properties.backgroundColor || '#ffffff',
          border: element.properties.border || 'none',
          borderRadius: element.properties.borderRadius || 0,
          ...animatedStyle,
        }}
      />
    )
  }

  const renderCircle = () => {
    const size = Math.min(element.properties.size.width, element.properties.size.height)
    
    let animatedStyle: React.CSSProperties = {}
    
    switch (animationType) {
      case 'scale':
        const scale = interpolate(easedProgress, [0, 1], [0, 1])
        animatedStyle.transform = `scale(${scale})`
        break
      case 'rotate':
        const rotation = direction === 'clockwise' 
          ? interpolate(easedProgress, [0, 1], [0, 360])
          : interpolate(easedProgress, [0, 1], [360, 0])
        animatedStyle.transform = `rotate(${rotation}deg)`
        break
      case 'draw':
        const circumference = 2 * Math.PI * (size / 2)
        const strokeDashoffset = interpolate(easedProgress, [0, 1], [circumference, 0])
        return (
          <svg width={size} height={size}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={size / 2 - 2}
              fill="none"
              stroke={element.properties.strokeColor || '#ffffff'}
              strokeWidth={element.properties.strokeWidth || 2}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>
        )
    }

    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          backgroundColor: element.properties.backgroundColor || '#ffffff',
          border: element.properties.border || 'none',
          ...animatedStyle,
        }}
      />
    )
  }

  const renderTriangle = () => {
    const size = Math.min(element.properties.size.width, element.properties.size.height)
    
    let animatedStyle: React.CSSProperties = {}
    
    switch (animationType) {
      case 'scale':
        const scale = interpolate(easedProgress, [0, 1], [0, 1])
        animatedStyle.transform = `scale(${scale})`
        break
      case 'rotate':
        const rotation = direction === 'clockwise' 
          ? interpolate(easedProgress, [0, 1], [0, 360])
          : interpolate(easedProgress, [0, 1], [360, 0])
        animatedStyle.transform = `rotate(${rotation}deg)`
        break
    }

    return (
      <svg width={size} height={size} style={animatedStyle}>
        <polygon
          points={`${size/2},0 0,${size} ${size},${size}`}
          fill={element.properties.backgroundColor || '#ffffff'}
          stroke={element.properties.strokeColor || 'none'}
          strokeWidth={element.properties.strokeWidth || 0}
        />
      </svg>
    )
  }

  const renderStar = () => {
    const size = Math.min(element.properties.size.width, element.properties.size.height)
    const points = element.properties.starPoints || 5
    const innerRadius = size * 0.3
    const outerRadius = size * 0.5
    
    const createStarPath = () => {
      let path = ''
      for (let i = 0; i < points * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius
        const angle = (i * Math.PI) / points
        const x = size / 2 + radius * Math.cos(angle - Math.PI / 2)
        const y = size / 2 + radius * Math.sin(angle - Math.PI / 2)
        path += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`
      }
      return path + ' Z'
    }

    let animatedStyle: React.CSSProperties = {}
    
    switch (animationType) {
      case 'scale':
        const scale = interpolate(easedProgress, [0, 1], [0, 1])
        animatedStyle.transform = `scale(${scale})`
        break
      case 'rotate':
        const rotation = direction === 'clockwise' 
          ? interpolate(easedProgress, [0, 1], [0, 360])
          : interpolate(easedProgress, [0, 1], [360, 0])
        animatedStyle.transform = `rotate(${rotation}deg)`
        break
    }

    return (
      <svg width={size} height={size} style={animatedStyle}>
        <path
          d={createStarPath()}
          fill={element.properties.backgroundColor || '#ffffff'}
          stroke={element.properties.strokeColor || 'none'}
          strokeWidth={element.properties.strokeWidth || 0}
        />
      </svg>
    )
  }

  const renderPath = () => {
    const pathData = element.properties.pathData || morphTarget || 'M 0 0 L 100 100'
    const size = Math.min(element.properties.size.width, element.properties.size.height)
    
    let animatedProps: any = {}
    
    switch (animationType) {
      case 'draw':
        const pathLength = element.properties.pathLength || 1000
        const strokeDashoffset = interpolate(easedProgress, [0, 1], [pathLength, 0])
        animatedProps.strokeDasharray = pathLength
        animatedProps.strokeDashoffset = strokeDashoffset
        break
      case 'morph':
        // For morphing, you would interpolate between two path strings
        // This is a simplified version
        animatedProps.d = pathData
        break
      case 'scale':
        const scale = interpolate(easedProgress, [0, 1], [0, 1])
        animatedProps.transform = `scale(${scale})`
        break
    }

    return (
      <svg width={size} height={size}>
        <path
          d={pathData}
          fill={animationType === 'draw' ? 'none' : (element.properties.backgroundColor || '#ffffff')}
          stroke={element.properties.strokeColor || '#ffffff'}
          strokeWidth={element.properties.strokeWidth || 2}
          strokeLinecap="round"
          strokeLinejoin="round"
          {...animatedProps}
        />
      </svg>
    )
  }

  const renderShape = () => {
    switch (shapeType) {
      case 'rectangle':
        return renderRectangle()
      case 'circle':
        return renderCircle()
      case 'triangle':
        return renderTriangle()
      case 'star':
        return renderStar()
      case 'path':
        return renderPath()
      default:
        return renderRectangle()
    }
  }

  return (
    <div style={baseStyle}>
      {renderShape()}
    </div>
  )
}

// Preset configurations for common shape animations
export const ShapeAnimationPresets = {
  scaleIn: {
    animationType: 'scale' as const,
    animationConfig: {
      duration: 30,
      easing: 'ease' as const,
    },
  },
  
  spinClockwise: {
    animationType: 'rotate' as const,
    animationConfig: {
      duration: 60,
      direction: 'clockwise' as const,
      easing: 'linear' as const,
    },
  },
  
  drawCircle: {
    shapeType: 'circle' as const,
    animationType: 'draw' as const,
    animationConfig: {
      duration: 90,
      easing: 'ease' as const,
    },
  },
  
  fillHorizontal: {
    animationType: 'fill' as const,
    animationConfig: {
      duration: 45,
      fillDirection: 'horizontal' as const,
      easing: 'ease' as const,
    },
  },
  
  bounceScale: {
    animationType: 'scale' as const,
    animationConfig: {
      duration: 60,
      easing: 'bounce' as const,
    },
  },
  
  springRotate: {
    animationType: 'rotate' as const,
    animationConfig: {
      duration: 90,
      easing: 'spring' as const,
      direction: 'clockwise' as const,
    },
  },
}

export default ShapeAnimation
