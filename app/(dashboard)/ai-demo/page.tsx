import { AIAssistant } from '@/components/ai/ai-assistant'

export default function AIDemoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI Assistant Demo</h1>
        <p className="text-muted-foreground">
          Test the AI-powered motion graphics generation using FREE OpenRouter models
        </p>
      </div>
      
      <AIAssistant />
    </div>
  )
}
