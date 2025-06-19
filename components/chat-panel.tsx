'use client'

import { useAuth } from '@/hooks/use-auth'
import { Model } from '@/lib/types/models'
import { cn } from '@/lib/utils'
import { Message } from 'ai'
import { ArrowUp, ChevronDown, MessageCirclePlus, RefreshCw, Sparkles, Square } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import Textarea from 'react-textarea-autosize'
import { toast } from 'sonner'
import { useArtifact } from './artifact/artifact-context'
import { AuthPrompt } from './auth-prompt'
import { EmptyScreen } from './empty-screen'
import { ModelSelector } from './model-selector'
import { SearchModeToggle } from './search-mode-toggle'
import { Button } from './ui/button'
import { TextHoverEffect } from './ui/hover-text-effect'
import { ShineButton } from './ui/shine-button'
import { Spinner } from './ui/spinner'

interface ChatPanelProps {
  input: string
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isLoading: boolean
  messages: Message[]
  setMessages: (messages: Message[]) => void
  query?: string
  stop: () => void
  append: (message: any) => void
  models?: Model[]
  /** Whether to show the scroll to bottom button */
  showScrollToBottomButton: boolean
  /** Reference to the scroll container */
  scrollContainerRef: React.RefObject<HTMLDivElement>
  showSignInPopup: boolean
  setShowSignInPopup: (show: boolean) => void
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

const PERSONAL_BRAND_PROMPT = `System:

You are a Personal Brand Building Assistant who guides users through creating and monetizing authentic personal brands using proven strategies and market positioning techniques. You balance brand development expertise with practical business implementation, clearly separating the foundation, positioning, and monetization phases to create sustainable and profitable personal brands.

Context:
The user wants to build a profitable personal brand from scratch or optimize their existing brand using systematic approaches and proven monetization strategies. Your guidance should help them discover their unique value proposition and transform their expertise into multiple revenue streams through strategic brand positioning. You'll draw from established personal branding patterns including niche positioning, content authority, audience building, and diverse monetization models.
Instructions:

PHASE 1: BRAND FOUNDATION & DISCOVERY
Begin by asking the user to identify their core expertise areas, current professional situation, and financial goals for their personal brand.

For each brand element, guide the user to:
* Identify 3-5 areas where they have genuine expertise or unique experience
* List 3-5 problems they can solve better than most people
* Define their ideal target audience demographics and psychographics
* Clarify their personal values, mission, and what they want to be known for
* Assess their current online presence and competitive landscape
Help them establish brand foundations by:
* Crafting a clear and compelling unique value proposition
* Identifying their brand personality and authentic voice
* Choosing 1-2 primary niches to focus on initially
* Defining their brand story and origin narrative
* Setting measurable brand and financial goals with timelines

PHASE 2: BRAND POSITIONING & CONTENT STRATEGY
For each brand element, help the user implement proven positioning strategies:

The Expert Authority (Position as the go-to expert in specific niche)
The Relatable Guide (Share journey while teaching others)
The Contrarian Thought Leader (Challenge industry norms with unique perspectives)
The Practical Problem Solver (Focus on actionable solutions and results)
The Inspiring Transformer (Help others achieve significant changes)
The Behind-the-Scenes Insider (Provide exclusive industry access and insights)
The Systematic Teacher (Break down complex topics into learnable systems)
The Community Builder (Create movements around shared values/goals)
The Authentic Storyteller (Connect through vulnerable and inspiring narratives)
The Results-Driven Consultant (Showcase proven methodologies and case studies)

For each brand touchpoint, provide:
* Core messaging framework (key messages across all platforms)
* Content pillar strategy (3-5 main themes for consistent content)
* Platform optimization (tailor approach for each social platform)
* Engagement strategy (build genuine relationships with audience)
* Authority building plan (establish credibility and expertise)
PHASE 3: MONETIZATION & SCALING
For each revenue stream, develop systematic approaches:
* Service-based income (consulting, coaching, done-for-you services)
* Product monetization (courses, books, digital products)
* Speaking opportunities (keynotes, workshops, corporate training)
* Partnership revenue (affiliates, sponsorships, collaborations)
* Community monetization (memberships, masterminds, exclusive access)
Constraints:
* Focus on authentic brand building that aligns with user's genuine expertise
* Ensure all strategies are sustainable and scalable long-term
* Balance personal vulnerability with professional credibility
* Prioritize audience value over self-promotion in all content
* Build systems that can generate passive and active income streams
* Consider user's current resources, skills, and time availability
* Maintain consistency across all brand touchpoints and platforms

Output Format:
For each brand building phase, provide:

[Brand Development Stage]
* Strategy Type: [Approach being implemented]
* Timeline: [Realistic implementation timeframe]
* Resource Requirements: [Time, money, skills needed]

IMPLEMENTATION PLAN:
Foundation (Month 1-2): "[Brand identity, messaging, and initial setup]"
Content Creation (Month 2-4): "[Consistent content strategy and audience building]"
Authority Building (Month 3-6): "[Establishing expertise and credibility]"
Monetization Launch (Month 4-8): "[First revenue streams and testing]"
Scaling & Optimization (Month 6-12): "[Expanding reach and revenue diversification]"

BRAND ELEMENTS:
* Unique Value Proposition: [Clear statement of what makes them different]
* Target Audience: [Specific demographic and psychographic profile]
* Content Strategy: [Platform-specific content plan and posting schedule]
* Engagement Tactics: [Methods for building genuine audience relationships]
MONETIZATION ROADMAP:
* Quick Wins (0-3 months): [Immediate revenue opportunities]
* Core Products (3-6 months): [Main income-generating offerings]
* Passive Income (6-12 months): [Scalable revenue streams]
* Premium Services (12+ months): [High-value, high-profit offerings]
SUCCESS METRICS:
* Brand Awareness: [Follower growth, reach, brand mention tracking]
* Engagement Quality: [Community interaction, email list growth]
* Authority Indicators: [Speaking invitations, media mentions, partnerships]
* Financial Goals: [Revenue targets and profit margins by timeframe]
OPTIMIZATION NOTES:
* Why This Works: [Psychology and market dynamics behind the strategy]
* Common Obstacles: [Typical challenges and how to overcome them]
* Pivot Indicators: [When and how to adjust strategy based on results]
* Scaling Opportunities: [How to expand successful elements]

After every major milestone, provide:
* Brand performance analysis and market positioning assessment
* Revenue stream optimization recommendations
* Audience growth and engagement trend analysis
* Competitive advantage maintenance strategies
* Long-term brand evolution and expansion planning`

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

You are a LinkedIn Post Generator assistant who guides users through creating compelling LinkedIn posts and crafting them into attention-grabbing, professional content. You balance authoritative expertise with practical writing techniques, clearly separating the ideation and execution phases to create posts optimized for maximum engagement and professional impact.

Context:
The user wants to create 30 viral LinkedIn posts using proven structures and formulas. Your guidance should help them generate strong ideas and transform them into polished posts with high engagement potential. You'll draw from established LinkedIn patterns including thought leadership, professional insights, industry commentary, and effective structures like storytelling, data-driven insights, and value propositions.
Instructions:

PHASE 1: IDEATION
Begin by asking the user to identify 3-5 professional areas they're knowledgeable or passionate about (leadership, industry trends, career development, business strategy, etc.)

For each area, guide the user to:
* Identify 3-5 industry insights or trends they can comment on
* List 3-5 professional challenges or pain points their network faces
* Note 2-3 industry misconceptions they could address
* Consider 2-3 professional experiences that taught them valuable lessons
* Identify current industry news or trends they can provide perspective on
Help them refine these raw ideas by:
* Highlighting which ones have broad professional appeal
* Identifying which would benefit from specific structures (storytelling, data, etc.)
* Suggesting how to make professional observations more insightful or actionable

PHASE 2: EXECUTION
For each refined idea, help the user craft a LinkedIn post using one of these effective structures:
* The Professional Story (personal experience with universal lesson)
* The Industry Insight (trend analysis with actionable takeaways)
* The Leadership Lesson (management or career advice with examples)
* The Data-Driven Post (statistics or research with interpretation)
* The Problem-Solution (identify challenge + provide solution)
* The Thought Leadership (bold industry prediction or perspective)
* The Career Advice (professional development guidance)
* The Networking Value (how to build meaningful connections)
* The Industry Commentary (reaction to current events or trends)
* The Success Framework (step-by-step approach to professional goals)

For each post draft:
* Create a compelling hook that grabs attention in the first line
* Develop the main content with clear structure and flow
* Include specific examples, data, or personal experiences
* End with a strong call-to-action or thought-provoking question
* Optimize for LinkedIn's algorithm with strategic formatting
After each batch of 5-10 posts, suggest variations or alternative approaches.

Constraints:
* Keep posts professional and authoritative while remaining engaging
* Focus on providing genuine value to professional networks
* Use confident, expert language throughout
* Ensure posts are authentic to the user's professional experience
* Balance thought leadership with practical insights

Output Format:
For each post, provide:
The post text (formatted exactly as it should appear on LinkedIn)
Structure type used
What makes it effective (1-2 sentences)
Optional variations or follow-up post suggestions
After each batch of posts, provide brief feedback on patterns that worked well and suggestions for the next batch.`

const LEARN_COMPLEX_TOPIC_PROMPT = `System:

You are a Complex Topic Learning Assistant who guides users through mastering difficult subjects using proven learning methodologies and cognitive science principles. You balance pedagogical expertise with practical learning techniques, clearly separating the understanding, breakdown, and mastery phases to create personalized learning pathways for any complex topic.

Context:
The user wants to learn a complex topic effectively using structured learning approaches and cognitive optimization techniques. Your guidance should help them break down intimidating subjects into manageable components and transform confusion into deep understanding through systematic progression. You'll draw from established learning patterns including spaced repetition, active recall, conceptual frameworks, and effective study methodologies.
Instructions:

PHASE 1: TOPIC ANALYSIS & FOUNDATION
Begin by asking the user to identify their target complex topic and current knowledge level (complete beginner, some background, intermediate, etc.)

For each learning goal, guide the user to:
* Define 3-5 core learning objectives they want to achieve
* Identify their preferred learning style (visual, auditory, kinesthetic, reading/writing)
* List any prerequisite knowledge gaps that need addressing first
* Establish their available time commitment and learning timeline
* Determine practical applications or end goals for the knowledge
Help them create a learning foundation by:
* Breaking the complex topic into 5-8 major conceptual chunks
* Identifying the logical sequence and dependencies between concepts
* Suggesting analogies or familiar concepts to bridge understanding
* Establishing success metrics and progress checkpoints

PHASE 2: LEARNING STRATEGY DESIGN
For each major concept, help the user implement proven learning structures:

The Feynman Technique (Explain concept in simple terms to identify gaps)
The Progressive Revelation (Build complexity layer by layer)
The Analogy Bridge (Connect new concepts to familiar experiences)
The Case Study Method (Learn through real-world applications)
The Problem-Solution Pattern (Understand why concepts exist and what they solve)
The Historical Context (Learn evolution and development of ideas)
The Systems Thinking (Understand how parts connect to the whole)
The Practical Application (Immediate hands-on practice with concepts)
The Teaching Moment (Explain concepts to others for deeper understanding)
The Error Analysis (Learn from common mistakes and misconceptions)

For each learning session, provide:
* Pre-learning preparation (mental framework and objectives)
* Active learning activities (engaging with material beyond passive reading)
* Comprehension checks (self-testing and understanding verification)
* Application exercises (practical use of newly learned concepts)
* Reflection prompts (connecting new knowledge to existing understanding)

PHASE 3: RETENTION & MASTERY OPTIMIZATION
For each concept learned, enhance retention through:
* Spaced repetition schedules for long-term memory consolidation
* Interleaving practice mixing related concepts for deeper understanding
* Elaborative interrogation asking "why" and "how" questions
* Self-explanation verbalizing thought processes while problem-solving
* Retrieval practice testing recall without looking at materials
Constraints:
* Adapt complexity level to user's current understanding and background
* Provide multiple explanation approaches for different learning preferences
* Ensure each learning session builds meaningfully on previous knowledge
* Balance theoretical understanding with practical application
* Include regular progress assessment and strategy adjustment
* Acknowledge and work with cognitive limitations and attention spans
* Provide motivation and confidence-building throughout the learning process

Output Format:
For each learning module, provide:

[Concept/Module Title]
* Learning Method: [Primary technique being used]
* Prerequisites: [Required background knowledge]
* Time Investment: [Estimated study time needed]
LEARNING BREAKDOWN:
Foundation (Week 1): "[Core concepts and basic understanding]"
Development (Week 2-3): "[Building complexity and connections]"
Application (Week 3-4): "[Practical exercises and real-world use]"
Mastery (Week 4-5): "[Advanced applications and teaching others]"
Review Cycle: "[Spaced repetition and retention schedule]"

STUDY ACTIVITIES:
* Active Reading: [Specific techniques for engaging with materials]
* Practice Problems: [Exercises to reinforce understanding]
* Creation Tasks: [Projects that demonstrate mastery]
* Discussion Points: [Topics for peer learning or self-reflection]
PROGRESS CHECKPOINTS:
* Understanding Check: [How to verify comprehension]
* Application Test: [Practical demonstration of knowledge]
* Teaching Moment: [Explain concept to validate mastery]
* Connection Building: [Link to other concepts or real-world scenarios]
LEARNING OPTIMIZATION:
* Why This Works: [Cognitive science behind the approach]
* Common Pitfalls: [Typical mistakes and how to avoid them]
* Motivation Boosters: [Techniques to maintain engagement]
* Adaptation Notes: [How to modify approach based on progress]

After every 3-5 learning modules, provide:
* Overall progress assessment and pattern analysis
* Learning strategy effectiveness evaluation
* Difficulty adjustment recommendations
* Knowledge integration opportunities
* Long-term retention and application planning`

const GPT4_MODEL = {
  id: 'gpt-4.1',
  name: 'GPT-4.1',
  provider: 'OpenAI',
  providerId: 'openai',
  enabled: true,
  toolCallType: 'native'
} as const

export function ChatPanel({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  messages,
  setMessages,
  query,
  stop,
  append,
  models,
  showScrollToBottomButton,
  scrollContainerRef,
  showSignInPopup,
  setShowSignInPopup
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
  const [lastUserMessage, setLastUserMessage] = useState<string>('')
  const [canRetry, setCanRetry] = useState(false)
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false)

  const handleCompositionStart = () => setIsComposing(true)

  const handleCompositionEnd = () => {
    setIsComposing(false)
    setEnterDisabled(true)
    setTimeout(() => {
      setEnterDisabled(false)
    }, 300)
  }

  const handleNewChat = () => {
    setMessages([])
    closeArtifact()
    router.push('/')
  }

  const handleRetry = () => {
    if (lastUserMessage.trim()) {
      // Remove the last incomplete assistant message if it exists
      const updatedMessages = messages.filter((msg, index) => {
        if (index === messages.length - 1 && msg.role === 'assistant') {
          return false // Remove last assistant message
        }
        return true
      })
      setMessages(updatedMessages)
      
      // Retry with the last user message
      append({
        role: 'user',
        content: lastUserMessage
      })
      setCanRetry(false)
      setShowTimeoutWarning(false)
    }
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
    if (isFirstRender.current && query && query.trim().length > 0) {
      append({
        role: 'user',
        content: query
      })
      isFirstRender.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  // Track last user message and enable retry
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.role === 'user') {
        setLastUserMessage(lastMessage.content)
        setCanRetry(false)
      } else if (lastMessage.role === 'assistant' && !isLoading) {
        // If we have an assistant message and we're not loading, enable retry
        setCanRetry(true)
      }
    }
  }, [messages, isLoading])

  // Show timeout warning after 45 seconds of loading
  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    if (isLoading) {
      timeoutId = setTimeout(() => {
        setShowTimeoutWarning(true)
      }, 45000) // 45 seconds
    } else {
      setShowTimeoutWarning(false)
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [isLoading])

  // Scroll to the bottom of the container
  const handleScrollToBottom = () => {
    const scrollContainer = scrollContainerRef.current
    if (scrollContainer) {
      scrollContainer.scrollTo({
        top: scrollContainer.scrollHeight,
        behavior: 'smooth'
      })
    }
  }

  const generateSuperPrompt = async (userInput: string) => {
    try {
      setIsGeneratingPrompt(true)

      const response = await fetch('/api/generate-super-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: userInput }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate super prompt')
      }

      const { prompt } = await response.json()

      if (!prompt) {
        throw new Error('No prompt was generated')
      }

      handleInputChange({
        target: { value: prompt }
      } as React.ChangeEvent<HTMLTextAreaElement>)

      toast.success('Super prompt generated!')
    } catch (error) {
      console.error('Error generating super prompt:', error)
      toast.error('Failed to generate super prompt')
    } finally {
      setIsGeneratingPrompt(false)
    }
  }

  const handleCraftButtonClick = (handler: () => void) => {
    if (!isAuthenticated) {
      setShowSignInPopup(true)
      return
    }
    handler()
  }

  const handleCraftSuperPrompt = () => {
    if (input.trim().length === 0) {
      toast.error('Please enter some text first')
      return
    }
    generateSuperPrompt(input)
  }

  const handleCraftPersonalBrand = () => {
    handleInputChange({
      target: { value: PERSONAL_BRAND_PROMPT }
    } as React.ChangeEvent<HTMLTextAreaElement>)
  }

  const handleCraftVideoScript = () => {
    handleInputChange({
      target: { value: VIDEO_SCRIPT_PROMPT }
    } as React.ChangeEvent<HTMLTextAreaElement>)
  }

  const handleCraftLearnComplexTopic = () => {
    handleInputChange({
      target: { value: LEARN_COMPLEX_TOPIC_PROMPT }
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
      className="resize-none w-full h-[48px] sm:h-[52px] min-h-[48px] sm:min-h-[52px] bg-transparent border-0 pl-4 pr-3 pt-3 pb-3 sm:pl-5 sm:pr-4 sm:pt-4 sm:pb-4 text-sm placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
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
    <div className="flex items-center gap-1 sm:gap-2">
      <ModelSelector models={models || []} />
      <SearchModeToggle />
    </div>
  )

  const renderInputWithSuperPrompt = () => (
    <>
      {renderInput()}
      <div className="pl-0 pr-3 sm:pr-4 pb-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground text-xs sm:text-sm"
          onClick={() => handleCraftButtonClick(handleCraftSuperPrompt)}
          disabled={isGeneratingPrompt || input.trim().length === 0}
        >
          {isGeneratingPrompt ? (
            <>
              <Spinner className="size-3 sm:size-4" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="size-3 sm:size-4" />
              Craft Super Prompt
            </>
          )}
        </Button>
      </div>
    </>
  )

  if (isAuthLoading) {
    return null // or a loading spinner if you prefer
  }

  return (
    <div
      className={cn(
        'w-full bg-background group/form-container shrink-0',
        messages.length > 0 ? 'sticky bottom-0 px-2 pb-4' : 'px-4 sm:px-6'
      )}
    >
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center w-full mx-auto gap-2">
          <div className="w-full h-[200px] sm:h-[250px] flex items-center justify-center">
            <TextHoverEffect
              text="QBit-Lab"
              duration={0.5}
            />
          </div>
          <form
            onSubmit={handleSubmit}
            className={cn('w-full max-w-3xl mx-auto relative px-2 sm:px-0')}
          >
            <div className="relative flex flex-col w-full gap-2 bg-muted rounded-2xl sm:rounded-3xl border border-input">
              {isAuthenticated ? (
                renderInputWithSuperPrompt()
              ) : (
                <AuthPrompt trigger={renderInputWithSuperPrompt()}>
                  <div className="p-4 text-sm text-muted-foreground">
                    Sign in to start chatting
                  </div>
                </AuthPrompt>
              )}
              <div className="flex items-center justify-between p-2 sm:p-3">
                {isAuthenticated ? (
                  renderModelSelector()
                ) : (
                  <AuthPrompt trigger={renderModelSelector()}>
                    <div className="text-sm text-muted-foreground">
                      Sign in to select a model
                    </div>
                  </AuthPrompt>
                )}
                <div className="flex items-center gap-2">
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!isAuthenticated || isLoading || input.trim().length === 0 || isToolInvocationInProgress()}
                    className="shrink-0 rounded-full h-8 w-8 sm:h-10 sm:w-10"
                  >
                    <ArrowUp className="size-3 sm:size-4" />
                  </Button>
                  {isLoading && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={stop}
                      className="shrink-0 rounded-full h-8 w-8 sm:h-10 sm:w-10"
                    >
                      <Square className="size-3 sm:size-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </form>
          <div className="w-full max-w-3xl mx-auto relative px-2 sm:px-0 sm:flex sm:justify-center">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 mt-4 w-full sm:w-auto">
              <ShineButton
                type="button"
                iconUrl="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAdBJREFUSEuVVgmSgzAMs/IyeBnwsuZl0WJykDjHtkyn06HG8iEpQKYXRIQSv+urvmP+7YOf53+8IAJaVBFNBXZ/GYBxvYHchHJQc4hsd7ZLu3Jw5xjsrTk+UoZgxgKREHhCeAihH8ETW+q6AJz9CN6cBqANJXnewziedCVvA6D3dzj4XKgtdwFw183wAsw35R2wz4iwXDIDmeb+pDe1Z8gXoOy/GdF8giQ/Epe6AhAHKK+GV+xgQm0FoMjWLrbbwQU3WnRMO6Rp5hIZNop8clA/oufO5YCzk2QqugCUJoyOlEn3+I+3fxVZ4obwgnNn0Z3ZwaCD3hI0KEQQXbJS1qdtX4DzKw1p3FBo33tH71fWC8qS6zaNsA0LIvzA1xYs+rdkCEPYEiWUth5I6h0an/Wi4oJtyySVRTp3NbvEuQVNp3ZdMwciDNQqlTlFZNaOjML9nUKNz9thlCVn8FT1gvt1irqb5/deQKwOih3U9jA0n1oH3fJ0N3u+2+lA3fM+ll5RTdxtzIkSrPo483HbWAUZPiJ45/4TQFQiId7B7VmAjVWoO6+WOfTUQRG4j7l0RLdml0bUTGBocDWFSnSMvN1XO/D5BeBLJc+k279JWPP4AzCH8CARbVX5AAAAAElFTkSuQmCC"
                onClick={() => handleCraftButtonClick(handleCraftPersonalBrand)}
                className="text-sm sm:text-sm w-full sm:w-auto h-12 sm:h-9"
              >
                Craft a Profitable Personal Brand
              </ShineButton>
              <ShineButton
                type="button"
                iconUrl="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAd1JREFUSEuNVgmSwyAMk/hYk5elfVmzH8MbcxhDIFOm09IMWLJ8hSiLAAT5Oy+/v/+t98aTdqts9MeZezBKgDKS8DDzfQb4hawB/O5NMe3FIUTiG8Cr8lHBzM1G8i9dJt+NXG+n+mp3RUQNH52jZl21oX7AFCMHKdhD4FkjN8bPTkaRL4FtqerCFQBnIPcEMEhdHyWbcrkwkyXbzR7MtNI7gWSUuF1poAooyU+Sr/oqIvrwm5F6W474WS7XYx7vBNRGk46KKuVJA7jrUDz4kCExEhElspayabwH8kyQnQd2oAPbWQ5H9VbwnSrmrwh2hgSQUrNJNI2ynGTYC5k3BMdDSEo34MKDdbao/ZvWJWyz+JvXC4myK74U7lYes2sN8OzEQ//pLzqJomxCaKE5ykPKerK276Paqj2RqB7kIAsKwIrgYCvLdWsbrR5bFgESZQO10Kxu7f4qW4Y2pemo6Wu1Rl32l0CMorYeo+rh/T63CtH0VYDj6gVWmNNmdzc0ZFQvzkky1UhbrevZwNG+EdMs4DGVe6hwd8Ya27qbunFYBo5yfHVZMRTE1cc+2mtmrGvfLjGYT6J+gGQz40CfDoBBqNzk8zQf1sN7xmSw9Awam8m4rTgr4FWhzF95/gGGZQMwakT2vwAAAABJRU5ErkJggg=="
                onClick={() => handleCraftButtonClick(handleCraftVideoScript)}
                className="text-sm sm:text-sm w-full sm:w-auto h-12 sm:h-9"
              >
                Craft Great Video Script
              </ShineButton>
              <ShineButton
                type="button"
                iconUrl="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAgZJREFUSEudVlu2wyAIhGysycrSrqzpxuRmRBFR23NuPvowgeExDGGKFxORlEMmYun+2q3BrpmQkBrCFu76ywPYnYA6hRkNcRIA5o5EZL/zOpEYE+H3S4iujber5efjbH4UIJTCP5pEnkx0dmkWJAAx81PvqdP4ucxAJO13IeEYEeer+XVwQhcxgObZjAAsJEmeRHKSILXoeoTREwEIsu3ysBJp35hE0ttHPbJlCQD7a2M+Kglr4awHSeSH8wk5DQ98vvNgNJ+P2lfLQBKYAoCRuSvOr3sjB2/bVeZAq5ZEdo4AGtQ/IOlg5qsS1KYu3d3t3C1o055ZRhAASt+TUhN9CKScIlnlJm0/QNvlJIuApnQ24lsDA2v9uVxE/Ml2RAdv3PcgNtJAXDZf8sgTnYnC9CaSnEHrgRevoFkmFZ6O1vYcNZzjGzOEqUeJfQ+CSBV9xsO1jgC5DR9uABHdJ0ctsgN7K6xB5pjoKoKFhG72mCilTuCyBFQByHR2zpzK5qiXYucrU+S5sMmU7oUpLdK0C9MjS3crXQmkV9ZBi7CGUsLQ5VoW+44tVRJaJ7REvQSUiO3Qp5YdL3WpaGfdVor92mwv9Hyc9sApq84DDlTIwJW4CLPzIsbDggsZhGkomy6zSP3qZrMlo3rz7bIMrMl+ff58AVDX3x4bS2ThTM2m7nxw8YXjD0DXHDKVSh9xAAAAAElFTkSuQmCC"
                onClick={() => handleCraftButtonClick(handleCraftLearnComplexTopic)}
                className="text-sm sm:text-sm w-full sm:w-auto h-12 sm:h-9"
              >
                Learn Complex Topic
              </ShineButton>
            </div>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className={cn('w-full max-w-3xl mx-auto relative px-2 sm:px-0')}
        >
          {/* Scroll to bottom button - only shown when showScrollToBottomButton is true */}
          {showScrollToBottomButton && messages.length > 0 && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="absolute -top-10 right-4 z-20 size-6 sm:size-8 rounded-full shadow-md"
              onClick={handleScrollToBottom}
              title="Scroll to bottom"
            >
              <ChevronDown size={14} className="sm:size-16" />
            </Button>
          )}

          <div className="relative flex flex-col w-full gap-2 bg-muted rounded-2xl sm:rounded-3xl border border-input">
            {isAuthenticated ? (
              renderInputWithSuperPrompt()
            ) : (
              <AuthPrompt trigger={renderInputWithSuperPrompt()}>
                <div className="p-4 text-sm text-muted-foreground">
                  Sign in to continue chatting
                </div>
              </AuthPrompt>
            )}

            {/* Timeout warning */}
            {showTimeoutWarning && isLoading && (
              <div className="px-4 py-2 bg-yellow-50 border-t border-yellow-200 rounded-b-2xl sm:rounded-b-3xl">
                <div className="flex items-center gap-2 text-sm text-yellow-800">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                  <span>This is taking longer than usual. You can wait or try stopping and retrying.</span>
                </div>
              </div>
            )}

            {/* Bottom menu area */}
            <div className="flex items-center justify-between p-2 sm:p-3">
              {isAuthenticated ? (
                renderModelSelector()
              ) : (
                <AuthPrompt trigger={renderModelSelector()}>
                  <div className="text-sm text-muted-foreground">
                    Sign in to select a model
                  </div>
                </AuthPrompt>
              )}
              <div className="flex items-center gap-2">
                {messages.length > 0 && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleNewChat}
                    className="shrink-0 rounded-full group h-8 w-8 sm:h-10 sm:w-10"
                    type="button"
                    disabled={isLoading || isToolInvocationInProgress()}
                  >
                    <MessageCirclePlus className="size-3 sm:size-4 group-hover:rotate-12 transition-all" />
                  </Button>
                )}
                {canRetry && !isLoading && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleRetry}
                    className="shrink-0 rounded-full h-8 w-8 sm:h-10 sm:w-10"
                    type="button"
                    title="Retry last message"
                  >
                    <RefreshCw className="size-3 sm:size-4" />
                  </Button>
                )}
                <Button
                  type={isLoading ? 'button' : 'submit'}
                  size={'icon'}
                  variant={'outline'}
                  className={cn(isLoading && 'animate-pulse', 'rounded-full h-8 w-8 sm:h-10 sm:w-10')}
                  disabled={
                    !isAuthenticated ||
                    (input.length === 0 && !isLoading) ||
                    isToolInvocationInProgress()
                  }
                  onClick={isLoading ? stop : undefined}
                >
                  {isLoading ? <Square size={16} className="sm:size-20" /> : <ArrowUp size={16} className="sm:size-20" />}
                </Button>
              </div>
            </div>
          </div>

          {messages.length === 0 && (
            <EmptyScreen
              submitMessage={message => {
                handleInputChange({
                  target: { value: message }
                } as React.ChangeEvent<HTMLTextAreaElement>)
              }}
              className={cn(showEmptyScreen ? 'visible' : 'invisible')}
            />
          )}
        </form>
      )}
    </div>
  )
}
