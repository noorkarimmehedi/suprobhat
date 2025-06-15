import { Redis } from '@upstash/redis'
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Initialize Redis client if UPSTASH_REDIS_REST_URL is available
const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
    })
  : null

const CACHE_TTL = 60 * 60 * 24 // 24 hours in seconds

const SYSTEM_PROMPT = `You are a Super Prompt Engineer. Create structured, verifiable prompts that minimize hallucination.

Follow this structure:
You are [ROLE/PERSONA] specializing in [DOMAIN].

Context: [USER'S TASK]

Objective: [MAIN GOAL]

Instructions:
1. Break down complex tasks
2. Verify facts and sources
3. State uncertainties clearly
4. Use expert knowledge when needed
5. Combine verified components

Constraints: [LIMITATIONS]

Output Format: [STRUCTURE]

Success Criteria: [MEASUREMENT]

Return only the completed prompt following this structure.`

export async function POST(req: NextRequest) {
  try {
    const { input } = await req.json()

    if (!input) {
      return NextResponse.json(
        { error: 'Input is required' },
        { status: 400 }
      )
    }

    // Try to get from cache first
    if (redis) {
      const cacheKey = `super-prompt:${input}`
      const cachedPrompt = await redis.get(cacheKey)
      if (cachedPrompt) {
        return NextResponse.json({ prompt: cachedPrompt })
      }
    }

    // Create a TransformStream for streaming the response
    const encoder = new TextEncoder()
    const stream = new TransformStream()
    const writer = stream.writable.getWriter()

    // Start the OpenAI request
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // Using faster model
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT
        },
        {
          role: 'user',
          content: input
        }
      ],
      temperature: 0.3, // Lower temperature for more focused responses
      max_tokens: 500, // Reduced token count
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
      stream: true // Enable streaming
    })

    // Process the stream
    let fullPrompt = ''
    for await (const chunk of response) {
      const content = chunk.choices[0]?.delta?.content || ''
      if (content) {
        fullPrompt += content
        await writer.write(encoder.encode(content))
      }
    }
    await writer.close()

    // Cache the result if Redis is available
    if (redis && fullPrompt) {
      const cacheKey = `super-prompt:${input}`
      await redis.set(cacheKey, fullPrompt, { ex: CACHE_TTL })
    }

    // Return the stream
    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Error generating super prompt:', error)
    return NextResponse.json(
      { error: 'Failed to generate super prompt' },
      { status: 500 }
    )
  }
} 