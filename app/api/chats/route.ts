import { getChatsPage } from '@/lib/actions/chat'
import { getCurrentUserId } from '@/lib/auth/get-current-user'
import { type Chat } from '@/lib/types'
import { NextRequest, NextResponse } from 'next/server'

interface ChatPageResponse {
  chats: Chat[]
  nextOffset: number | null
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const offset = parseInt(searchParams.get('offset') || '0')
    const limit = parseInt(searchParams.get('limit') || '20')

    const userId = await getCurrentUserId()
    const result = await getChatsPage(userId, limit, offset)

    return NextResponse.json<ChatPageResponse>(result)
  } catch (error) {
    console.error('Failed to fetch chats:', error)
    return NextResponse.json<ChatPageResponse>(
      { chats: [], nextOffset: null },
      { status: 500 }
    )
  }
}
