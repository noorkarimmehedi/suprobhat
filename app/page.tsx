import { AuthRequired } from '@/components/auth-required'
import { Chat } from '@/components/chat'
import { getModels } from '@/lib/config/models'
import { generateId } from 'ai'

export default async function Page() {
  const id = generateId()
  const models = await getModels()
  return (
    <AuthRequired>
      <Chat id={id} models={models} />
    </AuthRequired>
  )
}
