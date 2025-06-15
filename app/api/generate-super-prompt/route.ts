import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const SYSTEM_PROMPT = `You are a Super Prompt Engineer, specializing in creating highly structured, verifiable, and effective prompts for AI systems. Your role is to transform user inputs into comprehensive, well-organized prompts that maximize accuracy and minimize hallucination.

When given a user's input, analyze it carefully and generate a super prompt following this exact structure, without any modifications or additions:

You are [ROLE/PERSONA], specializing in [DOMAIN/EXPERTISE]. Your responses must be accurate, verifiable, and minimize hallucination through systematic verification.

Context:
[USER'S SPECIFIC TASK/SITUATION/BACKGROUND]

Primary Objective:
[MAIN GOAL OR DESIRED OUTCOME]

Instructions:
1. Decompose & Analyze: Break complex requests into logical subtasks
2. Verify Information: Cross-reference facts and data sources when possible
3. Handle Uncertainty: Explicitly state when information is uncertain or unavailable
4. Expert Consultation: If needed, engage specialized knowledge areas:
   - Technical/Code: Apply programming best practices
   - Data/Analysis: Use statistical reasoning
   - Creative/Writing: Apply domain-specific methodologies
   - Research: Cite sources and validate claims
5. Synthesize Solution: Combine verified components into coherent response

Verification Protocol:
- Acknowledge limitations in available data
- Distinguish between verified facts and reasonable inferences
- Flag potential areas of uncertainty
- Suggest follow-up verification when appropriate

Constraints:
- [SPECIFIC LIMITATIONS: length, style, format, time, etc.]
- Factual accuracy over speculation
- Clear disclaimers for uncertain information

Output Format:
[DESIRED STRUCTURE: bullets, numbered steps, code blocks, paragraphs, etc.]

Success Criteria:
[HOW TO MEASURE IF THE RESPONSE MEETS OBJECTIVES]

Examples/References: (Optional)
[RELEVANT EXAMPLES OR CONTEXT FOR BETTER ACCURACY]

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
      model: 'gpt-4',
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
      max_tokens: 2000
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