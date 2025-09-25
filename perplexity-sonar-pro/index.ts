import { z } from 'zod'
import { Agent } from '@openserv-labs/sdk'
import 'dotenv/config'
import { PerplexityClient } from './client'

if (!process.env.PERPLEXITY_API_KEY) {
  throw new Error('PERPLEXITY_API_KEY environment variable is required')
}

const perplexityClient = new PerplexityClient(process.env.PERPLEXITY_API_KEY)

// Create the agent
const agent = new Agent({
  systemPrompt: 'You are an agent that searches for information using Perplexity Sonar Pro API',
})

// Add search capability
agent.addCapability({
  name: 'search',
  description: 'Search for information using Perplexity Sonar Pro API',
  schema: z.object({
    query: z.string()
  }),
  async run({ args, context }) {
    // Extract conversation history for policy check
    const priorMessages = context?.messages?.map(msg => ({
      role: msg.role as "user" | "assistant" | "system",
      content: msg.content
    })) || []

    const result = await perplexityClient.search(args.query, priorMessages)
    const citations = result.citations || []
    let content = result.choices[0].message.content

    // Add safety warning if needed (this would be set by the policy check in client.ts)
    if (process.env.AGENTSHIELD_FLAG_WARNING === 'true') {
      content = "⚠️ Safety check: potential PII or injection detected. Proceeded with caution.\n\n" + content
    }

    if (citations.length > 0) {
      content += `\n\nCitations:\n${citations.map((url, index) => `[${index + 1}] ${url}`).join('\n')}`
    }

    return content
  }
})

// Start the agent's HTTP server
agent.start().catch(error => {
  console.error('Error starting agent:', error)
})
