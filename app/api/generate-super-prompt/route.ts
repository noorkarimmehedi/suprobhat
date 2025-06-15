import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const SYSTEM_PROMPT = `You are a Prompt Engineer specializing in creating structured, accurate, and effective prompts for AI systems. Your responses must be accurate and minimize hallucination through systematic verification.

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
  try {
    const { input } = await req.json()

    if (!input) {
      return NextResponse.json(
        { error: 'Input is required' },
        { status: 400 }
      )
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
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
      temperature: 0.7,
      max_tokens: 1000
    })

    const generatedPrompt = response.choices[0]?.message?.content

    if (!generatedPrompt) {
      return NextResponse.json(
        { error: 'No prompt was generated' },
        { status: 500 }
      )
    }

    return NextResponse.json({ prompt: generatedPrompt })
  } catch (error) {
    console.error('Error generating super prompt:', error)
    return NextResponse.json(
      { error: 'Failed to generate super prompt' },
      { status: 500 }
    )
  }
} 