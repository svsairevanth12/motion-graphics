import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { EditorHeader } from '@/components/editor/header'
import { EditorSidebar } from '@/components/editor/sidebar'

export default async function EditorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <EditorHeader />
      <div className="flex flex-1 overflow-hidden">
        <EditorSidebar />
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
