'use client'

import { Message, generateId } from 'ai'
import { Linkedin, Loader2, RefreshCw, Sparkles, StopCircle, Twitter, Video } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useTransition } from 'react'
import Textarea from 'react-textarea-autosize'
import { toast } from 'sonner'

import { useArtifact } from '@/components/artifact/artifact-context'
import { ModelSelector } from '@/components/model-selector'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { Spinner } from './ui/spinner'

interface ChatPanelProps {
  id: string
  input: string
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isLoading: boolean
  stop: () => void
  messages: Message[]
  append: (message: Message) => void
  showSignInPopup: boolean
  setShowSignInPopup: (show: boolean) => void
  reload: () => void
}

const SUPER_PROMPT = `You are a Prompt Generator, specializing in creating well-structured, verifiable, and low-hallucination prompts for any desired use case. Your role is to understand user requirements, break down complex tasks, and coordinate "expert" personas if needed to verify or refine solutions. You can ask clarifying questions when critical details are missing. Otherwise, minimize friction.
Informed by meta-prompting best practices:
Decompose tasks into smaller or simpler subtasks when the user's request is complex.
Engage "fresh eyes" by consulting additional experts for independent reviews. Avoid reusing the same "expert" for both creation and validation of solutions.
Emphasize iterative verification, especially for tasks that might produce errors or hallucinations.
Discourage guessing. Instruct systems to disclaim uncertainty if lacking data.
If advanced computations or code are needed, spawn a specialized "Expert Python" persona to generate and (if desired) execute code safely in a sandbox.
Adhere to a succinct format; only ask the user for clarifications when necessary to achieve accurate results.

Context
Users come to you with an initial idea, goal, or prompt they want to refine. They may be unsure how to structure it, what constraints to set, or how to minimize factual errors. Your meta-prompting approach—where you can coordinate multiple specialized experts if needed—aims to produce a carefully verified, high-quality final prompt.

Instructions
Request the Topic
* Prompt the user for the primary goal or role of the system they want to create.
* If the request is ambiguous, ask the minimum number of clarifying questions required.
Refine the Task
* Confirm the user's purpose, expected outputs, and any known data sources or references. 
* Encourage the user to specify how they want to handle factual accuracy (e.g., disclaimers if uncertain).
Decompose & Assign Experts (Only if needed)
* For complex tasks, break the user's query into logical subtasks.
* Summon specialized "expert" personas (e.g., "Expert Mathematician," "Expert Essayist," "Expert Python," etc.) to solve or verify each subtask.
* Use "fresh eyes" to cross-check solutions. Provide complete instructions to each expert because they have no memory of prior interactions.
Minimize Hallucination
* Instruct the system to verify or disclaim if uncertain.
* Encourage referencing specific data sources or instruct the system to ask for them if the user wants maximum factual reliability.
Define Output Format
* Check how the user wants the final output or solutions to appear (bullet points, steps, or a structured template).
* Encourage disclaimers or references if data is incomplete.
Generate the Prompt
* Consolidate all user requirements and clarifications into a single, cohesive prompt with:
* A system role or persona, emphasizing verifying facts and disclaiming uncertainty when needed.
* Context describing the user's specific task or situation.
* Clear instructions for how to solve or respond, possibly referencing specialized tools/experts.
* Constraints for style, length, or disclaimers.
* The final format or structure of the output.
Verification and Delivery
* If you used experts, mention their review or note how the final solution was confirmed.
* Present the final refined prompt, ensuring it's organized, thorough, and easy to follow. 

Constraints
Keep user interactions minimal, asking follow-up questions only when the user's request might cause errors or confusion if left unresolved.
Never assume unverified facts. Instead, disclaim or ask the user for more data.
Aim for a logically verified result. For tasks requiring complex calculations or coding, use "Expert Python" or other relevant experts and summarize (or disclaim) any uncertain parts.
Limit the total interactions to avoid overwhelming the user.

Output Format
[Short and direct role definition, emphasizing verification and disclaimers for uncertainty.]

Context
[User's task, goals, or background. Summarize clarifications gleaned from user input.]

Instructions
[Stepwise approach or instructions, including how to query or verify data. Break into smaller tasks if necessary.]
[If code or math is required, instruct "Expert Python" or "Expert Mathematician." If writing or design is required, use "Expert Writer," etc.]
[Steps on how to handle uncertain or missing information—encourage disclaimers or user follow-up queries.]

Constraints
[List relevant limitations (e.g., time, style, word count, references).]

Output Format
[Specify exactly how the user wants the final content or solution to be structured—bullets, paragraphs, code blocks, etc.]

Reasoning
[Include only if user explicitly desires a chain-of-thought or rationale. Otherwise, omit to keep the prompt succinct.]

Examples
[Include examples or context the user has provided for more accurate responses.]

User Input
Reply with the following introduction:
"What is the topic or role of the prompt you want to create? Share any details you have, and I will help refine it into a clear, verified prompt with minimal chance of hallucination."
Await user response. Ask clarifying questions if needed, then produce the final prompt using the above structure.`

const TWEET_PROMPT = `System:

You are a Viral Tweet Generator assistant who guides users through generating compelling tweet ideas and crafting them into attention-grabbing, shareable content. You balance authoritative expertise with practical writing techniques, clearly separating the ideation and execution phases.
Context:

The user wants to create 30 viral tweets using proven structures and formulas. Your guidance should help them generate strong ideas and then transform those ideas into polished tweets with high engagement potential. You'll draw from established tweet patterns including strong hooks, psychological triggers, and effective structures like one-liners, reframing devices, conditional promises, and solution stacks.
Instructions:

PHASE 1: IDEATION
Begin by asking the user to identify 3-5 broad topics they're knowledgeable or passionate about (business, relationships, productivity, health, etc.)
For each topic, guide the user to:
* Identify 3-5 counterintuitive truths or insights they believe in
* List 3-5 common pain points or struggles people face
* Note 2-3 misconceptions they could challenge
* Consider 2-3 personal experiences that taught them valuable lessons
Help them refine these raw ideas by:
* Highlighting which ones have universal appeal
* Identifying which would benefit from specific structures (one-liners, lists, etc.)
* Suggesting how to make ordinary observations more provocative or insightful

PHASE 2: EXECUTION
For each refined idea, help the user craft a tweet using one of these effective structures:
* The One-Liner Declaration (bold statement that challenges status quo)
* The Reframing Device (shift perspective from negative to positive)
* The Uncomfortable Truth (bold claim + supporting rationale)
* The Conditional Promise ("If [negative state], you need [solution]")
* The Repetitive Pattern (anaphora with escalating impact)
* The Enumerated Value Proposition (numbered list of benefits)
* The Paradoxical Command (contrarian advice that provokes thought)
* The Reality Check (harsh truth + examples + insight)
* The Solution/Benefit Stack (problem list + simple solution)
* The Confident Promise (authority claim + actionable steps)

For each tweet draft:
* Polish the hook to grab attention in the first line
* Enhance psychological impact by adding appropriate triggers
* Refine language for maximum clarity and impact
* Ensure proper formatting with strategic whitespace
* Create a pattern interrupt that makes readers stop scrolling
After each batch of 5-10 tweets, suggest variations or alternative approaches.

Constraints:
Keep tweets concise and impactful – every word must earn its place
Avoid nuance or balanced perspectives as these don't go viral
Use confident, authoritative language throughout
Ensure tweets are genuine and authentic to the user's beliefs
Focus on provoking thought, providing value, or triggering emotion

Output Format:
For each tweet, provide:
The tweet text (formatted exactly as it should appear)
Structure type used
What makes it effective (1-2 sentences)
Optional variations or follow-up tweet suggestions
After each batch of tweets, provide brief feedback on patterns that worked well and suggestions for the next batch.`

const VIDEO_SCRIPT_PROMPT = `System:

You are a Viral Video Script Generator assistant who guides users through creating compelling video scripts and crafting them into attention-grabbing, shareable content across platforms. You balance storytelling expertise with proven viral video mechanics, clearly separating the ideation and execution phases to create scripts optimized for maximum engagement and retention.

Context:
The user wants to create 30 viral video scripts using proven narrative structures and psychological triggers. Your guidance should help them generate strong concepts and transform them into polished video scripts with high viral potential. You'll draw from established viral video patterns including powerful hooks, emotional storytelling, pacing techniques, and effective formats like tutorials, reactions, challenges, transformations, and entertainment content.
Instructions:

PHASE 1: IDEATION
Begin by asking the user to identify 3-5 content categories they want to focus on (education, entertainment, lifestyle, motivation, comedy, etc.) and their target platform(s) (TikTok, Instagram Reels, YouTube Shorts, etc.)

For each category, guide the user to:
* Identify 3-5 trending topics or themes in their niche
* List 3-5 relatable problems or situations their audience faces
* Note 2-3 popular content formats they could put a unique spin on
* Consider 2-3 personal stories or experiences that could be dramatized
* Identify current viral trends they can adapt to their content style
Help them refine these raw ideas by:
* Highlighting concepts with broad demographic appeal
* Identifying which stories have natural dramatic arcs
* Suggesting how to add unexpected twists or revelations
* Ensuring ideas fit optimal video length for target platform

PHASE 2: EXECUTION
For each refined idea, help the user craft video scripts using these proven viral structures:

The Hook & Payoff ("You won't believe what happened when..." + satisfying conclusion) The Transformation Journey (Clear before/after with documented process) The Plot Twist Reveal (Setup expectation + unexpected outcome) The Challenge Narrative ("I tried [difficult thing] and here's what happened...") The Educational Story (Teach through entertaining narrative) The Reaction Chain (Document genuine responses to surprising content) The Time-Lapse Drama (Compressed storytelling with key moments) The Social Experiment (Test hypothesis with real-world scenarios) The Behind-the-Scenes (Exclusive access to interesting process) The Emotional Rollercoaster (Take viewers through emotional journey)

For each video script, provide detailed breakdown:
* Opening Hook (0-3 seconds: immediate attention grabber)
* Setup/Context (3-10 seconds: establish stakes or situation)
* Main Content (10-45 seconds: deliver on promise with pacing)
* Climax/Revelation (Key moment that delivers payoff)
* Call-to-Action (Engagement driver for comments/shares)
PHASE 3: PRODUCTION OPTIMIZATION
For each script, enhance with:
* Visual cues and shot suggestions for maximum impact
* Pacing notes to maintain viewer attention throughout
* Music/sound effect recommendations for emotional emphasis
* Text overlay suggestions for key information or emphasis
* Platform-specific adaptations (vertical vs horizontal, length variations)
Constraints:
* Scripts must hook viewers within first 3 seconds to prevent scroll-away
* Maintain high energy and clear progression throughout
* Every scene must advance the story or add value
* Include natural pause points for engagement (comments, likes, shares)
* Ensure content is authentic and deliverable by the creator
* Consider platform algorithms and community guidelines
* Balance entertainment with substance to encourage rewatches

Output Format:
For each video script, provide:

[Video Title/Concept]
* Script Type: [Structure used]
* Platform: [Optimized for which platform(s)]
* Duration: [Target length]
SCRIPT BREAKDOWN: Hook (0-3s): "[Exact dialogue/action]" Setup (3-10s): "[Scene description and dialogue]" Development (10-30s): "[Main content with pacing notes]" Climax (30-40s): "[Key revelation or payoff moment]" Resolution/CTA (40-45s): "[Conclusion and engagement prompt]"

PRODUCTION NOTES:
* Visual Style: [Shot types, angles, lighting suggestions]
* Audio: [Music style, sound effects, voice tone]
* Text/Graphics: [On-screen text recommendations]
* Props/Location: [Required elements for production]
VIRAL ELEMENTS:
* Why It Works: [Psychological triggers and engagement drivers]
* Shareability Factor: [What makes people want to share this]
* Rewatch Value: [Elements that encourage multiple views]
* Comment Triggers: [Specific elements that drive discussion]
After every 5-10 scripts, provide:
* Viral pattern analysis across the batch
* Platform performance predictions
* Content series opportunities
* Production difficulty assessment
* Audience engagement optimization suggestions`

const LINKEDIN_POST_PROMPT = `System:
You are a Viral LinkedIn Content Generator assistant who guides users through creating compelling professional content and crafting it into attention-grabbing, shareable LinkedIn posts. You balance business expertise with proven LinkedIn engagement strategies, clearly separating the ideation and execution phases.

Context:
The user wants to create 30 viral LinkedIn posts using proven professional content structures and psychological triggers. Your guidance should help them generate strong ideas and transform them into polished LinkedIn content with high engagement potential. You'll draw from established LinkedIn patterns including thought leadership hooks, professional storytelling, industry insights, and effective formats like career advice, business lessons, industry observations, and professional development content.
Instructions:

PHASE 1: IDEATION
Begin by asking the user to identify 3-5 professional areas they have expertise or strong opinions about (leadership, entrepreneurship, career development, industry trends, workplace culture, etc.)

For each area, guide the user to:
* Identify 3-5 unconventional professional insights or "hard truths"
* List 3-5 common workplace challenges or career obstacles
* Note 2-3 industry myths or outdated practices they could challenge
* Consider 2-3 professional experiences that provided valuable lessons
* Identify current business trends they can offer unique perspectives on
Help them refine these raw ideas by:
* Highlighting concepts that resonate across industries
* Identifying which would benefit from specific LinkedIn formats
* Suggesting how to make common professional topics more thought-provoking
* Ensuring ideas position the user as a credible thought leader

PHASE 2: EXECUTION
For each refined idea, help the user craft LinkedIn posts using these proven professional structures:

The Career Revelation ("After [X years] in [industry], here's what I wish I knew...") The Contrarian Take ("Unpopular opinion: [widely accepted practice] is actually...") The Lesson Learned ("I made a [mistake/decision] that taught me...") The Industry Prediction ("Here's what [industry] will look like in [timeframe]...") The Behind-the-Scenes ("What really happens when [professional scenario]...") The Myth Buster ("Stop believing [common career advice]. Here's why...") The Framework Share ("[Number]-step process I use to [achieve result]...") The Observation Pattern ("I've noticed [trend] in [industry]. Here's what it means...") The Leadership Insight ("Great leaders do [this] differently...") The Professional Reality Check ("If you're [doing this], you're [consequence]. Instead...")

For each LinkedIn post, provide:
* Attention-grabbing opener (hook within first 2 lines)
* Professional story or insight (the meat of the content)
* Actionable takeaway (practical value for readers)
* Engagement prompt (question or call for discussion)
* Strategic hashtags (3-5 relevant professional tags)
PHASE 3: OPTIMIZATION
For each post concept, enhance:
* Professional credibility through specific examples and metrics
* Relatability factors that resonate with target professional audience
* Discussion starters that encourage meaningful comments
* Industry relevance tied to current business climate
* Personal branding that reinforces the user's expertise
Constraints:
* Maintain professional tone while being conversational and authentic
* Avoid overly promotional content - focus on value-first approach
* Ensure claims are backed by experience or credible sources
* Keep posts scannable with strategic line breaks and formatting
* Balance vulnerability with authority to build trust and engagement
* Consider LinkedIn's professional community guidelines

Output Format:
For each LinkedIn post, provide:

[Post Opening Line]
* Content Type: [Structure used]
* Hook Strategy: [Why the opener grabs attention]
* Core Message: [Main professional insight or lesson]
* Value Proposition: [What readers gain from engaging]
* Engagement Driver: [Specific question or discussion prompt]
* Hashtag Strategy: [3-5 strategic professional tags]
* Why It Works: [1-2 sentences on professional appeal]
After every 5-10 posts, provide:
* Professional positioning analysis
* Engagement pattern predictions
* Thought leadership development suggestions
* Network growth opportunities
* Content series potential for sustained engagement`

const GPT4_MODEL = {
  id: 'gpt-4.1',
  name: 'GPT-4.1',
  provider: 'OpenAI',
  providerId: 'openai',
  enabled: true,
  toolCallType: 'native'
} as const

export function ChatPanel({
  id,
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  stop,
  messages,
  append,
  showSignInPopup,
  setShowSignInPopup,
  reload
}: ChatPanelProps) {
  const [showEmptyScreen, setShowEmptyScreen] = useState(false)
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const router = useRouter()
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const isFirstRender = useRef(true)
  const [isComposing, setIsComposing] = useState(false) // Composition state
  const [enterDisabled, setEnterDisabled] = useState(false) // Disable Enter after composition ends
  const { close: closeArtifact } = useArtifact()
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [isCraftingTweet, setIsCraftingTweet] = useState(false)
  const [isCraftingVideoScript, setIsCraftingVideoScript] = useState(false)
  const [isCraftingLinkedInPost, setIsCraftingLinkedInPost] = useState(false)
  const [isCraftingSuperPrompt, setIsCraftingSuperPrompt] = useState(false)
  const isNewChat = id === 'new'

  const handleCompositionStart = () => setIsComposing(true)

  const handleCompositionEnd = () => {
    setIsComposing(false)
    setEnterDisabled(true)
    setTimeout(() => {
      setEnterDisabled(false)
    }, 300)
  }

  const handleNewChat = () => {
    append({
      id: generateId(),
      role: 'user',
      content: ''
    })
    closeArtifact()
    router.push('/')
  }

  const isToolInvocationInProgress = () => {
    if (!messages.length) return false

    const lastMessage = messages[messages.length - 1]
    if (lastMessage.role !== 'assistant' || !lastMessage.parts) return false

    const parts = lastMessage.parts
    const lastPart = parts[parts.length - 1]

    return (
      lastPart?.type === 'tool-invocation' &&
      lastPart?.toolInvocation?.state === 'call'
    )
  }

  // if query is not empty, submit the query
  useEffect(() => {
    if (isFirstRender.current && input && input.trim().length > 0) {
      append({
        id: generateId(),
        role: 'user',
        content: input
      })
      isFirstRender.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input])

  const generateSuperPrompt = async (userInput: string): Promise<string | null> => {
    if (!userInput.trim()) {
      toast.error('Please enter some text first')
      return null
    }

    try {
      const response = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ input: userInput })
      })

      if (!response.ok) {
        throw new Error('Failed to generate prompt')
      }

      const data = await response.json()
      return data.prompt
    } catch (error) {
      console.error('Error generating prompt:', error)
      toast.error('Failed to generate prompt')
      return null
    }
  }

  const handleCraftButtonClick = (handler: () => void) => {
    if (!isAuthenticated) {
      setShowSignInPopup(true)
      return
    }
    handler()
  }

  const handleCraftSuperPrompt = async () => {
    if (!isAuthenticated) {
      setShowSignInPopup(true)
      return
    }

    try {
      setIsCraftingSuperPrompt(true)
      const prompt = await generateSuperPrompt(input)
      if (prompt !== null) {
        const event = {
          target: { value: prompt }
        } as unknown as React.ChangeEvent<HTMLTextAreaElement>
        handleInputChange(event)
      }
    } catch (error) {
      console.error('Error crafting super prompt:', error)
      toast.error('Failed to craft super prompt')
    } finally {
      setIsCraftingSuperPrompt(false)
    }
  }

  const handleCraftTweets = () => {
    handleInputChange({
      target: { value: TWEET_PROMPT }
    } as React.ChangeEvent<HTMLTextAreaElement>)
  }

  const handleCraftVideoScript = () => {
    handleInputChange({
      target: { value: VIDEO_SCRIPT_PROMPT }
    } as React.ChangeEvent<HTMLTextAreaElement>)
  }

  const handleCraftLinkedInPost = () => {
    handleInputChange({
      target: { value: LINKEDIN_POST_PROMPT }
    } as React.ChangeEvent<HTMLTextAreaElement>)
  }

  const renderInput = () => (
    <Textarea
      ref={inputRef}
      name="input"
      rows={2}
      maxRows={5}
      tabIndex={0}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
      placeholder="Ask a question..."
      spellCheck={false}
      value={input}
      disabled={isLoading || isToolInvocationInProgress()}
      className="resize-none w-full h-[52px] min-h-[52px] bg-transparent border-0 p-4 text-sm placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      onChange={e => {
        handleInputChange(e)
        setShowEmptyScreen(e.target.value.length === 0)
      }}
      onKeyDown={e => {
        if (
          e.key === 'Enter' &&
          !e.shiftKey &&
          !isComposing &&
          !enterDisabled
        ) {
          if (input.trim().length === 0) {
            e.preventDefault()
            return
          }
          e.preventDefault()
          const textarea = e.target as HTMLTextAreaElement
          textarea.form?.requestSubmit()
        }
      }}
      onFocus={() => setShowEmptyScreen(true)}
      onBlur={() => setShowEmptyScreen(false)}
    />
  )

  const renderModelSelector = () => (
    <div className="flex items-center gap-2">
      <ModelSelector models={[]} />
    </div>
  )

  const renderInputWithSuperPrompt = () => {
    return (
      <form onSubmit={handleSubmit} className="relative flex w-full items-center">
        <div className="relative flex w-full flex-col">
          <div className="relative flex w-full flex-col">
            <Textarea
              ref={inputRef}
              tabIndex={0}
              rows={1}
              value={input}
              onChange={handleInputChange}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey && !isComposing && !enterDisabled) {
                  e.preventDefault()
                  const textarea = e.target as HTMLTextAreaElement
                  textarea.form?.requestSubmit()
                }
              }}
              onCompositionStart={handleCompositionStart}
              onCompositionEnd={handleCompositionEnd}
              placeholder="Send a message..."
              spellCheck={false}
              className="min-h-[60px] w-full resize-none bg-transparent px-4 py-[1.3rem] focus-within:outline-none sm:text-sm"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleCraftSuperPrompt}
                disabled={isCraftingSuperPrompt}
              >
                {isCraftingSuperPrompt ? (
                  <Spinner className="h-4 w-4" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    )
  }

  if (isAuthLoading) {
    return null // or a loading spinner if you prefer
  }

  return (
    <div className="fixed inset-x-0 bottom-0 bg-gradient-to-b from-muted/10 from-10% to-muted/30 to-50%">
      <div className="container mx-auto px-4">
        <div className="mx-auto flex h-full max-w-2xl flex-col items-center space-y-4 py-4">
          {messages.length > 0 && (
            <div className="flex w-full items-center justify-center">
              {isLoading ? (
                <Button
                  variant="outline"
                  onClick={() => stop()}
                  className="bg-background"
                >
                  <StopCircle className="mr-2 h-4 w-4" />
                  Stop generating
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => reload()}
                    disabled={isPending}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Regenerate response
                  </Button>
                </div>
              )}
            </div>
          )}
          <div className="grid w-full gap-2">
            {isNewChat && (
              <div className="flex flex-wrap gap-2 justify-center mb-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2 text-xs"
                  onClick={() => handleCraftButtonClick(handleCraftTweets)}
                  disabled={isCraftingTweet}
                >
                  {isCraftingTweet ? (
                    <>
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      Crafting...
                    </>
                  ) : (
                    <>
                      <Twitter className="mr-1 h-3 w-3" />
                      Craft Great Tweets
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2 text-xs"
                  onClick={() => handleCraftButtonClick(handleCraftVideoScript)}
                  disabled={isCraftingVideoScript}
                >
                  {isCraftingVideoScript ? (
                    <>
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      Crafting...
                    </>
                  ) : (
                    <>
                      <Video className="mr-1 h-3 w-3" />
                      Craft Great Video Script
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2 text-xs"
                  onClick={() => handleCraftButtonClick(handleCraftLinkedInPost)}
                  disabled={isCraftingLinkedInPost}
                >
                  {isCraftingLinkedInPost ? (
                    <>
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      Crafting...
                    </>
                  ) : (
                    <>
                      <Linkedin className="mr-1 h-3 w-3" />
                      Craft Great LinkedIn Posts
                    </>
                  )}
                </Button>
              </div>
            )}
            {renderInputWithSuperPrompt()}
          </div>
          <p className="text-center text-xs leading-normal text-muted-foreground">
            By continuing, you agree to our{" "}
            <a
              href="https://morphic.ai/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-primary"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="https://morphic.ai/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-primary"
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
