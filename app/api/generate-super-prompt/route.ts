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

const SYSTEM_PROMPT = `You are a Super Prompt Engineer, specializing in creating structured, verifiable prompts for AI systems. Your role is to transform user inputs into clear, well-organized prompts that maximize accuracy and minimize hallucination.

When given a user's input, analyze it carefully and generate a super prompt following this exact structure, without any modifications or additions:

You are [ROLE] specializing in [DOMAIN/EXPERTISE]. Your responses must be accurate and minimize hallucination through systematic verification.

Context: [USER'S TASK/SITUATION]
Objective: [MAIN GOAL]

Instructions:
1. Decompose complex requests into subtasks
2. Verify information and cross-reference sources
3. Handle uncertainty explicitly with disclaimers
4. Engage domain experts when needed
5. Synthesize verified solutions

Constraints: [LIMITATIONS]
Format: [STRUCTURE]
Success: [CRITERIA]

Your task is to:
1. Analyze the user's input
2. Fill in each section of the template with appropriate content
3. Return only the completed prompt, following the exact structure above
4. Do not include any explanations, meta-commentary, or additional formatting`

export async function POST(req: NextRequest) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 25000) // 25 second timeout

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
      const cachedPrompt = await redis.get<string>(cacheKey)
      if (cachedPrompt) {
        return new Response(cachedPrompt, {
          headers: {
            'Content-Type': 'text/plain',
          },
        })
      }
    }

    // Create a TransformStream for streaming the response
    const encoder = new TextEncoder()
    const stream = new TransformStream()
    const writer = stream.writable.getWriter()

    // Start the OpenAI request with timeout
    const response = await openai.chat.completions.create({
      model: 'gpt-4', // Using GPT-4 for higher quality
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
      temperature: 0.5, // Balanced temperature for creativity and focus
      max_tokens: 1000, // Set to 1000 tokens
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
      stream: true
    }, {
      signal: controller.signal,
      timeout: 20000 // 20 second timeout for the OpenAI request
    })

    let fullPrompt = ''
    let hasContent = false

    try {
      // Process the stream with timeout
      for await (const chunk of response) {
        const content = chunk.choices[0]?.delta?.content || ''
        if (content) {
          hasContent = true
          fullPrompt += content
          await writer.write(encoder.encode(content))
        }
      }

      if (!hasContent) {
        throw new Error('No content generated')
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
          'Content-Type': 'text/plain',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    } catch (streamError) {
      console.error('Stream processing error:', streamError)
      await writer.abort(streamError)
      throw streamError
    }
  } catch (error: any) {
    console.error('Error generating super prompt:', error)
    
    // Handle specific error types
    if (error?.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timed out. Please try again.' },
        { status: 408 }
      )
    } else if (error?.name === 'OpenAIError') {
      return NextResponse.json(
        { error: 'Failed to generate prompt. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  } finally {
    clearTimeout(timeoutId)
  }
} 