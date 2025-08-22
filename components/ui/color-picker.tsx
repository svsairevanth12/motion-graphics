'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Palette, Pipette, Shuffle } from 'lucide-react'

interface ColorPickerProps {
  defaultColor?: string
  onChange?: (color: string) => void
  showPalette?: boolean
  showEyedropper?: boolean
  className?: string
}

const PRESET_COLORS = [
  '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff',
  '#800000', '#008000', '#000080', '#808000', '#800080', '#008080', '#c0c0c0', '#808080',
  '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#98d8c8', '#f7dc6f',
  '#ff7675', '#74b9ff', '#a29bfe', '#fd79a8', '#fdcb6e', '#6c5ce7', '#00b894', '#e17055',
]

const COLOR_PALETTES = {
  material: [
    '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4',
    '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722',
  ],
  tailwind: [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#14b8a6',
    '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  ],
  pastel: [
    '#ffb3ba', '#ffdfba', '#ffffba', '#baffc9', '#bae1ff', '#c9baff', '#ffbaff', '#ffbaba',
    '#ffd1dc', '#ffe4e1', '#f0fff0', '#f0f8ff', '#e6e6fa', '#fff0f5', '#fdf5e6', '#f5f5dc',
  ],
}

export function ColorPicker({ 
  defaultColor = '#000000', 
  onChange,
  showPalette = true,
  showEyedropper = false,
  className 
}: ColorPickerProps) {
  const [color, setColor] = useState(defaultColor)
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('picker')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    setColor(defaultColor)
  }, [defaultColor])

  const handleColorChange = (newColor: string) => {
    setColor(newColor)
    onChange?.(newColor)
  }

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }

  const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
  }

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255
    g /= 255
    b /= 255
    
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0, s = 0, l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break
        case g: h = (b - r) / d + 2; break
        case b: h = (r - g) / d + 4; break
      }
      h /= 6
    }

    return { h: h * 360, s: s * 100, l: l * 100 }
  }

  const generateRandomColor = () => {
    const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')
    handleColorChange(randomColor)
  }

  const generateComplementaryColors = (baseColor: string) => {
    const rgb = hexToRgb(baseColor)
    if (!rgb) return []

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
    const complementaryHue = (hsl.h + 180) % 360
    
    // Generate a palette with different saturations and lightness
    const colors = []
    for (let i = 0; i < 5; i++) {
      const saturation = Math.max(20, hsl.s - i * 15)
      const lightness = Math.max(20, Math.min(80, hsl.l + (i - 2) * 15))
      
      // Convert back to RGB and hex
      const h = complementaryHue / 360
      const s = saturation / 100
      const l = lightness / 100
      
      let r, g, b
      if (s === 0) {
        r = g = b = l
      } else {
        const hue2rgb = (p: number, q: number, t: number) => {
          if (t < 0) t += 1
          if (t > 1) t -= 1
          if (t < 1/6) return p + (q - p) * 6 * t
          if (t < 1/2) return q
          if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
          return p
        }
        
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s
        const p = 2 * l - q
        r = hue2rgb(p, q, h + 1/3)
        g = hue2rgb(p, q, h)
        b = hue2rgb(p, q, h - 1/3)
      }
      
      colors.push(rgbToHex(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)))
    }
    
    return colors
  }

  const rgb = hexToRgb(color)

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`w-8 h-8 p-0 border-2 ${className}`}
          style={{ backgroundColor: color }}
          title={color}
        >
          <span className="sr-only">Pick color</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="picker">Picker</TabsTrigger>
            <TabsTrigger value="palette">Palette</TabsTrigger>
            <TabsTrigger value="generator">Generate</TabsTrigger>
          </TabsList>

          <TabsContent value="picker" className="space-y-4">
            {/* Color Preview */}
            <div className="flex items-center gap-3">
              <div 
                className="w-16 h-16 rounded border-2 border-border"
                style={{ backgroundColor: color }}
              />
              <div className="flex-1 space-y-2">
                <div>
                  <Label className="text-xs">Hex</Label>
                  <Input
                    value={color}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="font-mono text-sm"
                  />
                </div>
              </div>
            </div>

            {/* RGB Inputs */}
            {rgb && (
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs">R</Label>
                  <Input
                    type="number"
                    min="0"
                    max="255"
                    value={rgb.r}
                    onChange={(e) => {
                      const newRgb = { ...rgb, r: parseInt(e.target.value) || 0 }
                      handleColorChange(rgbToHex(newRgb.r, newRgb.g, newRgb.b))
                    }}
                  />
                </div>
                <div>
                  <Label className="text-xs">G</Label>
                  <Input
                    type="number"
                    min="0"
                    max="255"
                    value={rgb.g}
                    onChange={(e) => {
                      const newRgb = { ...rgb, g: parseInt(e.target.value) || 0 }
                      handleColorChange(rgbToHex(newRgb.r, newRgb.g, newRgb.b))
                    }}
                  />
                </div>
                <div>
                  <Label className="text-xs">B</Label>
                  <Input
                    type="number"
                    min="0"
                    max="255"
                    value={rgb.b}
                    onChange={(e) => {
                      const newRgb = { ...rgb, b: parseInt(e.target.value) || 0 }
                      handleColorChange(rgbToHex(newRgb.r, newRgb.g, newRgb.b))
                    }}
                  />
                </div>
              </div>
            )}

            {/* Preset Colors */}
            <div className="space-y-2">
              <Label className="text-xs">Quick Colors</Label>
              <div className="grid grid-cols-8 gap-1">
                {PRESET_COLORS.map((presetColor) => (
                  <button
                    key={presetColor}
                    className="w-6 h-6 rounded border border-border hover:scale-110 transition-transform"
                    style={{ backgroundColor: presetColor }}
                    onClick={() => handleColorChange(presetColor)}
                    title={presetColor}
                  />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="palette" className="space-y-4">
            {Object.entries(COLOR_PALETTES).map(([paletteName, colors]) => (
              <div key={paletteName} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs capitalize">{paletteName}</Label>
                  <Badge variant="secondary" className="text-xs">
                    {colors.length}
                  </Badge>
                </div>
                <div className="grid grid-cols-8 gap-1">
                  {colors.map((paletteColor) => (
                    <button
                      key={paletteColor}
                      className="w-6 h-6 rounded border border-border hover:scale-110 transition-transform"
                      style={{ backgroundColor: paletteColor }}
                      onClick={() => handleColorChange(paletteColor)}
                      title={paletteColor}
                    />
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="generator" className="space-y-4">
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={generateRandomColor}
              >
                <Shuffle className="mr-2 h-4 w-4" />
                Generate Random Color
              </Button>

              {showEyedropper && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    // Eyedropper API implementation would go here
                    console.log('Eyedropper not implemented')
                  }}
                >
                  <Pipette className="mr-2 h-4 w-4" />
                  Pick from Screen
                </Button>
              )}
            </div>

            {/* Complementary Colors */}
            <div className="space-y-2">
              <Label className="text-xs">Complementary Colors</Label>
              <div className="grid grid-cols-5 gap-1">
                {generateComplementaryColors(color).map((compColor, index) => (
                  <button
                    key={index}
                    className="w-8 h-8 rounded border border-border hover:scale-110 transition-transform"
                    style={{ backgroundColor: compColor }}
                    onClick={() => handleColorChange(compColor)}
                    title={compColor}
                  />
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  )
}
