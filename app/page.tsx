import { Chat } from '@/components/chat'
import { getModels } from '@/lib/config/models'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const models = await getModels()
  return <Chat id="new" models={models} />
}
