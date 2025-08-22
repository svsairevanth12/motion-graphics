# AI-Powered Motion Graphics Generator

A Next.js application that uses AI to generate stunning motion graphics and animations. Built with TypeScript, Tailwind CSS, and modern web technologies.

## Features

- 🤖 **AI-Powered Generation**: Create motion graphics from text prompts using OpenAI
- 🎬 **Real-time Preview**: See your animations come to life with live preview
- 🎨 **Professional Templates**: Choose from a variety of pre-built templates
- 🔧 **Customizable Editor**: Fine-tune every aspect of your animations
- 📱 **Multiple Formats**: Export in various formats and resolutions
- ☁️ **Cloud Rendering**: High-quality video rendering in the cloud
- 👥 **User Management**: Secure authentication and project management

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS with animations
- **UI Components**: Shadcn/ui + Radix UI
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **AI**: OpenRouter (DeepSeek V3, DeepSeek R1, Qwen 3 Coder, Llama 3.2 Vision - All FREE)
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Queue System**: Bull/BullMQ with Redis
- **Video Processing**: Remotion + FFmpeg
- **Animations**: Framer Motion + GSAP

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Redis server
- OpenRouter API key (provides access to multiple AI models)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd motion-graphics
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
- Database URL
- NextAuth secret and URL
- OpenRouter API key
- Redis URL
- OAuth provider credentials (optional)

4. Set up the database:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── (dashboard)/       # Dashboard pages
│   ├── (editor)/          # Editor pages
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── dashboard/        # Dashboard components
│   ├── editor/           # Editor components
│   └── motion/           # Motion graphics components
├── lib/                  # Utility libraries
│   ├── ai/              # AI integration
│   ├── motion-engine/   # Motion graphics engine
│   ├── queue/           # Background job processing
│   └── database.ts      # Database client
├── hooks/               # Custom React hooks
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
├── prisma/              # Database schema
└── public/              # Static assets
```

## Key Features

### AI Integration
- **Multi-Model AI System**: Uses OpenRouter to access Claude 3 Opus, GPT-4 Vision, and Claude 3.5 Sonnet
- **Intelligent Prompt Analysis**: Converts natural language into structured motion graphics specifications
- **Creative Enhancement**: Automatically enriches basic prompts with professional details
- **Scene Generation**: Creates detailed scene-by-scene breakdowns with timing and animations
- **Style Suggestions**: Recommends visual styles, color palettes, and typography
- **Smart Optimization**: Calculates optimal timing and transitions for smooth animations

### Motion Graphics Engine
- **Scene Composition**: Multi-layer scene composer with blend modes and masking
- **Timeline Management**: Advanced timeline with keyframe editing and animation curves
- **Transition System**: 8+ transition types (fade, slide, zoom, wipe, morph, etc.)
- **Effect Library**: Comprehensive effects (blur, glow, shadow, color correction, etc.)
- **Animation Components**: Pre-built components for text, shapes, particles, images, and logos
- **Customization Layer**: Dynamic property binding with undo/redo system

### Editor
- Visual timeline editor with multi-track support
- Real-time preview with quality adaptation
- Layer management with blend modes
- Keyframe animation controls
- Color and typography tools
- Property binding system

### Rendering Pipeline
- **Remotion-Based**: Professional video generation with React components
- **Multiple Formats**: MP4, WebM, GIF, Lottie, and frame sequences
- **Quality Options**: Draft, Preview, Low, Medium, High, Ultra (480p to 4K)
- **Background Processing**: Bull queue system with progress tracking
- **Preview Generation**: Fast low-quality previews for real-time editing
- **Resolution Adaptation**: Automatic scaling for different output sizes

### Templates
- Public template library
- Custom template creation
- Category-based organization
- Template sharing

## Development

### Database Operations
```bash
# Push schema changes
npm run db:push

# Generate Prisma client
npm run db:generate

# Open Prisma Studio
npm run db:studio
```

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

## Deployment

The application can be deployed to any platform that supports Next.js:

- **Vercel** (recommended)
- **Netlify**
- **Railway**
- **Docker**

Make sure to set up the required environment variables and external services (PostgreSQL, Redis) in your deployment environment.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## AI Models & Usage

### OpenRouter Integration
The application uses OpenRouter to access multiple FREE AI models, each optimized for specific tasks:

- **DeepSeek V3** (`deepseek/deepseek-v3:free`)
  - Complex prompt analysis and understanding
  - Creative writing and enhancement
  - Cost: **FREE** ✅

- **DeepSeek R1** (`deepseek/deepseek-r1:free`)
  - Advanced reasoning and problem solving
  - Mathematical and logical thinking
  - Cost: **FREE** ✅

- **Qwen 3 Coder** (`qwen/qwen-3-coder:free`)
  - Structured JSON generation for scenes and configurations
  - Code generation and programming tasks
  - Cost: **FREE** ✅

- **Llama 3.2 11B Vision** (`meta-llama/llama-3.2-11b-vision-instruct:free`)
  - Visual style suggestions and descriptions
  - Multimodal reasoning for design decisions
  - Cost: **FREE** ✅

- **DeepSeek Chat** (`deepseek/deepseek-chat:free`)
  - Conversational AI and creative writing
  - General purpose tasks and enhancement
  - Cost: **FREE** ✅

### AI API Endpoints

#### POST `/api/ai`
Unified endpoint for all AI operations:

```typescript
// Analyze a prompt
{
  "action": "analyze",
  "prompt": "Create a modern logo animation..."
}

// Enhance a prompt
{
  "action": "enhance",
  "prompt": "Simple logo animation"
}

// Generate scenes
{
  "action": "generateScenes",
  "spec": { /* MotionSpec object */ }
}

// Suggest styles
{
  "action": "suggestStyles",
  "content": "Tech startup branding video"
}

// Generate color scheme
{
  "action": "generateColorScheme",
  "description": "Energetic tech presentation"
}

// Calculate timing
{
  "action": "calculateTiming",
  "elements": [/* MotionElement array */],
  "totalDuration": 30
}
```

#### GET `/api/ai?action=health`
Check AI system health and model availability.

#### GET `/api/ai?action=usage`
Get current token usage and cost estimates.

### React Hooks

```typescript
import {
  useAnalyzePrompt,
  useEnhancePrompt,
  useGenerateScenes,
  useSuggestStyles,
  useAIWorkflow
} from '@/hooks/use-ai'

// Full AI workflow
const aiWorkflow = useAIWorkflow()
const result = await aiWorkflow.runFullWorkflow(prompt, {
  enhance: true,
  generateStyles: true,
  generateColors: true,
  optimizeTiming: true
})
```

### Error Handling
The AI system includes comprehensive error handling:
- Automatic retries with exponential backoff
- Model fallbacks for high availability
- Rate limiting and request queuing
- Detailed error reporting with retry suggestions

### Token Usage Tracking
- Real-time token consumption monitoring
- **No cost tracking needed - all models are FREE!** 🎉
- Usage analytics and optimization suggestions
- Automatic usage reset and reporting

## Motion Graphics Engine

### Core Architecture

The motion graphics engine is built on a modular architecture with the following components:

#### 1. Core Engine (`/lib/motion-engine/core.ts`)
- **Project Management**: Create, load, and manage motion graphics projects
- **Element System**: Unified system for text, shapes, images, videos, and particles
- **Animation Framework**: Keyframe-based animation with multiple easing types
- **Property System**: Dynamic property binding with real-time updates

#### 2. Scene Composer (`/lib/motion-engine/scene-composer.ts`)
- **Layer Composition**: Multi-layer rendering with blend modes
- **Masking System**: Alpha, luminance, and shape-based masks
- **Performance Optimization**: Intelligent caching and composition optimization
- **Hit Testing**: Precise element selection and interaction

#### 3. Timeline Manager (`/lib/motion-engine/timeline.ts`)
- **Multi-Track Timeline**: Visual timeline with element tracks
- **Keyframe Editing**: Drag-and-drop keyframe manipulation
- **Animation Curves**: Bezier curve editing for smooth animations
- **Playback Control**: Play, pause, scrub, and loop functionality

#### 4. Transition System (`/lib/motion-engine/transitions.ts`)
- **8+ Transition Types**: Fade, slide, zoom, wipe, morph, dissolve, push, reveal
- **Customizable Parameters**: Direction, duration, easing, and effect-specific options
- **Preset Library**: Pre-configured transitions for common use cases
- **Real-time Preview**: Live transition preview during editing

#### 5. Effect Library (`/lib/motion-engine/effects.ts`)
- **Visual Effects**: Blur, glow, shadow, outline, gradient overlays
- **Color Correction**: Brightness, contrast, saturation, hue adjustment
- **Distortion Effects**: Chromatic aberration, noise, and custom distortions
- **Parameter Validation**: Type-safe effect parameters with validation

### Animation Components

#### Text Animation (`/lib/motion-engine/components/text-animation.tsx`)
```typescript
<TextAnimation
  element={element}
  text="Hello World"
  animationType="typewriter"
  animationConfig={{
    duration: 60,
    stagger: 3,
    easing: 'ease'
  }}
/>
```

**Available Animations:**
- Typewriter effect with cursor
- Fade in/out with stagger
- Slide from any direction
- Bounce and spring effects
- Wave animation
- Scale and rotate effects

#### Shape Animation (`/lib/motion-engine/components/shape-animation.tsx`)
```typescript
<ShapeAnimation
  element={element}
  shapeType="circle"
  animationType="draw"
  animationConfig={{
    duration: 90,
    easing: 'ease'
  }}
/>
```

**Supported Shapes:**
- Rectangle, Circle, Triangle
- Star with configurable points
- Custom SVG paths
- Polygon shapes

**Animation Types:**
- Draw/stroke animation
- Morph between shapes
- Scale and rotate
- Fill animations

#### Particle System (`/lib/motion-engine/components/particle-system.tsx`)
```typescript
<ParticleSystem
  element={element}
  particleType="confetti"
  particleCount={100}
  emissionConfig={{
    burst: true,
    burstCount: 100
  }}
  particleConfig={{
    gravity: 0.15,
    colors: ['#ff0000', '#00ff00', '#0000ff']
  }}
/>
```

**Particle Types:**
- Confetti explosion
- Sparkle trails
- Smoke effects
- Bubble animations
- Star fields

#### Image Animation (`/lib/motion-engine/components/image-animation.tsx`)
```typescript
<ImageAnimation
  element={element}
  src="/path/to/image.jpg"
  animationType="kenBurns"
  animationConfig={{
    startScale: 1,
    endScale: 1.3,
    duration: 180
  }}
/>
```

**Animation Types:**
- Ken Burns effect
- Parallax scrolling
- Reveal animations
- Zoom and slide effects
- Flip transitions

#### Logo Animation (`/lib/motion-engine/components/logo-animation.tsx`)
```typescript
<LogoAnimation
  element={element}
  logoType="text"
  text="BRAND"
  animationType="neon"
  animationConfig={{
    glowColor: '#00ffff',
    intensity: 1
  }}
/>
```

**Logo Effects:**
- 3D rotation
- Shimmer effects
- Pulse and glow
- Glitch effects
- Neon sign simulation
- Liquid morphing

### Rendering Pipeline

#### Preview Rendering
```typescript
const renderer = getMotionRenderer()
const previewUrl = await renderer.renderProject(project, {
  format: 'mp4',
  quality: 'preview',
  resolution: '720p',
  preview: true,
  onProgress: (progress, stage) => {
    console.log(`${stage}: ${progress}%`)
  }
})
```

#### Final Rendering
```typescript
const finalUrl = await renderer.renderProject(project, {
  format: 'mp4',
  quality: 'high',
  resolution: '1080p',
  onProgress: (progress, stage) => {
    console.log(`Rendering: ${progress}%`)
  }
})
```

**Supported Formats:**
- **MP4**: H.264 encoding with configurable quality
- **WebM**: VP9 encoding for web optimization
- **GIF**: Optimized animated GIFs with palette reduction
- **Lottie**: JSON-based animations for web/mobile
- **Frames**: Individual PNG/JPEG frame sequences

### Customization System

#### Property Binding
```typescript
const customization = getCustomizationEngine()

// Create a slider control for opacity
const binding = customization.createBinding(
  elementId,
  'opacity',
  {
    type: 'slider',
    label: 'Opacity',
    min: 0,
    max: 1,
    step: 0.01,
    defaultValue: 1,
    currentValue: 1
  }
)

// Update the value in real-time
customization.updateControllerValue(binding.id, 0.5)
```

#### Undo/Redo System
```typescript
// Automatic state saving
customization.undo() // Revert last change
customization.redo() // Restore undone change

// Check availability
if (customization.canUndo()) {
  customization.undo()
}
```

### Performance Optimizations

- **Composition Caching**: Intelligent caching of rendered compositions
- **Frame Skipping**: Adaptive frame skipping for real-time preview
- **Memory Management**: Automatic cleanup of unused resources
- **Concurrent Rendering**: Multi-threaded rendering for faster exports
- **Progressive Loading**: Lazy loading of assets and effects

### Usage Examples

#### Creating a Simple Project
```typescript
import { MotionEngineUtils, getMotionEngine } from '@/lib/motion-engine'

// Create a new project
const project = MotionEngineUtils.createProject({
  title: 'My Animation',
  duration: 300, // 10 seconds at 30fps
  width: 1920,
  height: 1080
})

// Create a scene
const scene = MotionEngineUtils.createScene({
  title: 'Main Scene',
  startFrame: 0,
  endFrame: 300
})

// Add a text element
const textElement = MotionEngineUtils.createElement('text', {
  name: 'Title Text',
  properties: {
    position: { x: 960, y: 540 },
    fontSize: 48,
    color: '#ffffff'
  }
})

// Add animation
const fadeAnimation = MotionEngineUtils.createAnimation(
  'opacity',
  [
    { frame: 0, value: 0 },
    { frame: 30, value: 1 },
    { frame: 270, value: 1 },
    { frame: 300, value: 0 }
  ]
)

textElement.animations.push(fadeAnimation)
scene.elements.push(textElement)
project.scenes.push(scene)

// Load into engine
const engine = getMotionEngine()
engine.loadProject(project)
```

## License

This project is licensed under the MIT License.
