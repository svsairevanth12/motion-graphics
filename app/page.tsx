import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, Play, Sparkles, Zap } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-4"
          >
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              AI-Powered Motion Graphics
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Create stunning animations and motion graphics with the power of artificial intelligence. 
              No design experience required.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button asChild size="lg" className="text-lg px-8">
              <Link href="/dashboard/projects">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8">
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Powerful Features
          </h2>
          <p className="text-xl text-muted-foreground">
            Everything you need to create professional motion graphics
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <Card className="h-full">
              <CardHeader>
                <Sparkles className="h-12 w-12 text-primary mb-4" />
                <CardTitle>AI-Generated Content</CardTitle>
                <CardDescription>
                  Let AI create stunning visuals and animations based on your text prompts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Smart scene generation</li>
                  <li>• Automatic color schemes</li>
                  <li>• Dynamic text animations</li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card className="h-full">
              <CardHeader>
                <Zap className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Real-time Preview</CardTitle>
                <CardDescription>
                  See your changes instantly with our powerful preview engine
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Live editing</li>
                  <li>• Instant feedback</li>
                  <li>• Timeline scrubbing</li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <Card className="h-full">
              <CardHeader>
                <Play className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Professional Export</CardTitle>
                <CardDescription>
                  Export in multiple formats with professional quality
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• 4K resolution support</li>
                  <li>• Multiple formats</li>
                  <li>• Cloud rendering</li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
