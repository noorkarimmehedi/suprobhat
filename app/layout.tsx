import ArtifactRoot from '@/components/artifact/artifact-root'
import Header from '@/components/header'
import { PageTransition } from '@/components/page-transition'
import { ThemeProvider } from '@/components/theme-provider'
import { SidebarProvider } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/sonner'
import { createClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'
import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { JetBrains_Mono as FontMono } from 'next/font/google'
import './globals.css'

const fontMono = FontMono({
  subsets: ['latin'],
  variable: '--font-mono'
})

const title = 'Arc Lab'
const description =
  'A fully open-source AI-powered answer engine with a generative UI.'

export const metadata: Metadata = {
  metadataBase: new URL('https://morphic.sh'),
  title,
  description,
  openGraph: {
    title,
    description
  },
  twitter: {
    title,
    description,
    card: 'summary_large_image',
    creator: '@miiura'
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 0.5,
  maximumScale: 5,
  userScalable: true
}

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  let user = null
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (supabaseUrl && supabaseAnonKey) {
    const supabase = await createClient()
    const {
      data: { user: supabaseUser }
    } = await supabase.auth.getUser()
    user = supabaseUser
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen flex flex-col font-mono antialiased',
          fontMono.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider defaultOpen={false}>
            <div className="flex flex-col flex-1">
              <Header user={user} />
              <main className="flex flex-1 min-h-0">
                <ArtifactRoot>
                  <PageTransition>{children}</PageTransition>
                </ArtifactRoot>
              </main>
            </div>
            <Toaster />
            <Analytics />
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
