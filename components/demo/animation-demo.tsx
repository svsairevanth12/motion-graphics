'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// This component demonstrates various patterns that CodeRabbit will review
export function AnimationDemo() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [data, setData] = useState<any>(null) // CodeRabbit will flag this 'any' type

  // Missing dependency array - CodeRabbit will catch this
  useEffect(() => {
    console.log('Animation demo mounted') // CodeRabbit will flag console.log
    
    // Missing cleanup - potential memory leak
    const interval = setInterval(() => {
      if (isPlaying) {
        setProgress(prev => (prev + 1) % 100)
      }
    }, 16) // Magic number - CodeRabbit will suggest named constant
    
    // TODO: Implement proper animation logic - CodeRabbit will flag placeholder comment
  })

  // Generic function name - CodeRabbit will suggest more descriptive name
  const handleClick = () => {
    setIsPlaying(!isPlaying)
  }

  // Inline object creation in render - performance issue
  const containerStyle = {
    width: '100%',
    height: '200px',
    background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
    borderRadius: '8px',
    position: 'relative' as const,
    overflow: 'hidden'
  }

  // Inline function in JSX - performance issue
  const animationStyle = {
    transform: `translateX(${progress}%)`,
    transition: isPlaying ? 'none' : 'transform 0.3s ease'
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Animation Demo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Inline style object - CodeRabbit will flag performance issue */}
        <div style={containerStyle}>
          <div 
            className="w-8 h-8 bg-white rounded-full absolute top-1/2 transform -translate-y-1/2"
            style={animationStyle}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Button 
            onClick={handleClick}
            variant={isPlaying ? "destructive" : "default"}
          >
            {isPlaying ? 'Pause' : 'Play'}
          </Button>
          
          <span className="text-sm text-muted-foreground">
            Progress: {progress}%
          </span>
        </div>
        
        {/* Missing error boundary - CodeRabbit will suggest adding one */}
        {data && (
          <div>
            {/* Potential XSS vulnerability - CodeRabbit will flag */}
            <div dangerouslySetInnerHTML={{ __html: data.content }} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Large component - CodeRabbit will suggest breaking it down if it grows
// Missing proper TypeScript interfaces - CodeRabbit will flag
// No accessibility attributes - CodeRabbit will suggest improvements
// No error handling - CodeRabbit will flag missing try-catch blocks
