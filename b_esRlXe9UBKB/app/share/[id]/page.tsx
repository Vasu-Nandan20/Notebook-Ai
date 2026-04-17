import { Metadata } from 'next'
import { SharedChatView } from '@/components/shared-chat-view'

export const metadata: Metadata = {
  title: 'Shared Chat - NotebookAI',
  description: 'View a shared NotebookAI conversation',
}

export default async function SharedChatPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  
  return <SharedChatView shareId={id} />
}
