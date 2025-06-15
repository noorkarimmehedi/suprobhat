import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const SYSTEM_PROMPT = `You are a Prompt Engineer specializing in creating structured, accurate, and effective prompts for AI systems. Your responses must be accurate and minimize hallucination through systematic verification.

Your task is to transform user inputs into prompts that EXACTLY follow this structure, with no modifications or additions:

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

Important Rules:
1. You MUST follow this EXACT structure - no additions, no modifications
2. Each section must be filled with appropriate content from the user's input
3. Do not add any extra sections or modify the existing ones
4. Keep the exact wording of the Instructions section as shown above
5. Return only the completed prompt with no additional explanations or commentary
6. Ensure the [ROLE] and [DOMAIN/EXPERTISE] are specific and relevant to the user's request
7. Make sure all placeholders (text in [BRACKETS]) are replaced with actual content`

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