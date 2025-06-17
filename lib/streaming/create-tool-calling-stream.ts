import { researcher } from '@/lib/agents/researcher'
import {
    convertToCoreMessages,
    CoreMessage,
    createDataStreamResponse,
    DataStreamWriter,
    streamText
} from 'ai'
import { getMaxAllowedTokens, truncateMessages } from '../utils/context-window'
import { isReasoningModel } from '../utils/registry'
import { handleStreamFinish } from './handle-stream-finish'
import { BaseStreamConfig } from './types'

// Function to check if a message contains ask_question tool invocation
function containsAskQuestionTool(message: CoreMessage) {
  // For CoreMessage format, we check the content array
  if (message.role !== 'assistant' || !Array.isArray(message.content)) {
    return false
  }

  // Check if any content item is a tool-call with ask_question tool
  return message.content.some(
    item => item.type === 'tool-call' && item.toolName === 'ask_question'
  )
}

export function createToolCallingStreamResponse(config: BaseStreamConfig) {
  return createDataStreamResponse({
    execute: async (dataStream: DataStreamWriter) => {
      const { messages, model, chatId, searchMode, userId } = config
      const modelId = `${model.providerId}:${model.id}`

      try {
        const coreMessages = convertToCoreMessages(messages)
        const truncatedMessages = truncateMessages(
          coreMessages,
          getMaxAllowedTokens(model)
        )

        let researcherConfig = await researcher({
          messages: truncatedMessages,
          model: modelId,
          searchMode
        })

        const result = streamText({
          ...researcherConfig,
          onFinish: async result => {
            // Check if the last message contains an ask_question tool invocation
            const shouldSkipRelatedQuestions =
              isReasoningModel(modelId) ||
              (result.response.messages.length > 0 &&
                containsAskQuestionTool(
                  result.response.messages[
                    result.response.messages.length - 1
                  ] as CoreMessage
                ))

            await handleStreamFinish({
              responseMessages: result.response.messages,
              originalMessages: messages,
              model: modelId,
              chatId,
              dataStream,
              userId,
              skipRelatedQuestions: shouldSkipRelatedQuestions
            })
          }
        })

        result.mergeIntoDataStream(dataStream)
      } catch (error) {
        console.error('Stream execution error:', error)
        throw error
      }
    },
    onError: error => {
      console.error('Stream error:', error)
      
      // Provide more specific error messages
      let errorMessage = 'An error occurred while processing your request.'
      
      const errorString = error instanceof Error ? error.message : String(error)
      
      if (errorString.includes('timeout') || errorString.includes('aborted')) {
        errorMessage = 'The request timed out. Please try again with a shorter question.'
      } else if (errorString.includes('rate limit') || errorString.includes('quota')) {
        errorMessage = 'Rate limit exceeded. Please wait a moment and try again.'
      } else if (errorString.includes('authentication') || errorString.includes('unauthorized')) {
        errorMessage = 'Authentication error. Please check your API keys.'
      } else if (errorString.includes('network') || errorString.includes('fetch')) {
        errorMessage = 'Network error. Please check your internet connection.'
      }
      
      return errorMessage
    }
  })
}
