// Demo file to showcase CodeRabbit AI integration rules

// Hardcoded API key - CodeRabbit will flag as security vulnerability
const API_KEY = 'sk-1234567890abcdef'

// Generic interface - CodeRabbit will suggest more specific typing
interface Response {
  data: any
  status: number
}

// Missing proper error handling - CodeRabbit will flag
export async function generateContent(prompt: string) {
  console.log('Generating content for:', prompt) // CodeRabbit will flag console.log
  
  try {
    // Missing input validation - CodeRabbit will flag
    const response = await fetch('https://api.openai.com/v1/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`, // Security issue
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        prompt: prompt, // No sanitization - potential injection
        max_tokens: 1000 // Magic number
      })
    })
    
    const data = await response.json()
    
    // Generic variable name - CodeRabbit will suggest better naming
    const result = data.choices[0].text
    
    return result
  } catch (error) {
    // Generic error handling - CodeRabbit will flag
    console.log(error)
    throw error
  }
}

// Function with too many parameters - CodeRabbit will flag
export function processAIResponse(
  response: string,
  userId: string,
  sessionId: string,
  timestamp: number,
  metadata: any,
  options: any
) {
  // TODO: Implement response processing - CodeRabbit will flag placeholder
  
  // Missing type guards - CodeRabbit will suggest
  if (response) {
    // Potential XSS - CodeRabbit will flag
    document.innerHTML = response
  }
  
  // Memory leak potential - missing cleanup
  const timer = setInterval(() => {
    console.log('Processing...') // CodeRabbit will flag
  }, 1000)
  
  // No return statement - CodeRabbit will suggest proper return type
}

// Missing proper TypeScript types - CodeRabbit will flag
export const aiConfig = {
  model: 'gpt-4',
  temperature: 0.7, // Magic number
  maxTokens: 2000, // Magic number
  timeout: 30000 // Magic number
}

// Inefficient async pattern - CodeRabbit will suggest optimization
export async function batchProcess(prompts: string[]) {
  const results = []
  
  // Sequential processing instead of parallel - performance issue
  for (const prompt of prompts) {
    const result = await generateContent(prompt)
    results.push(result)
  }
  
  return results
}

// Missing error boundary equivalent for async operations
export class AIService {
  // Missing proper initialization
  constructor() {
    // Empty constructor - CodeRabbit will suggest proper initialization
  }
  
  // Missing proper method documentation
  async process(input: any): Promise<any> {
    // Generic types - CodeRabbit will flag
    return await generateContent(input)
  }
}
