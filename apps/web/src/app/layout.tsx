import './globals.css'

import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { Toaster } from 'sonner'

import { Bootstrap } from '@/components/bootstrap'
import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import * as config from '@/lib/config'

import Providers from './providers'

const geist = Geist({
  variable: '--font-geist',
  subsets: ['latin']
})

export const metadata: Metadata = {
  title: config.title,
  description: config.description,
  authors: [{ name: config.author, url: config.twitterUrl }],
  metadataBase: new URL(config.prodUrl),
  keywords: config.keywords,
  openGraph: {
    title: config.title,
    description: config.description,
    siteName: config.title,
    locale: 'en_US',
    type: 'website',
    url: config.prodUrl
  },
  twitter: {
    card: 'summary_large_image',
    creator: `@${config.authorTwitterUsername}`,
    title: config.title,
    description: config.description
  }
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={`${geist.variable} antialiased`}>
        <Providers>
          <div className='w-full min-h-[100vh] relative flex flex-col items-center'>
            <Header />

            <main className='flex-1 w-full flex flex-col items-center max-w-[1200px] gap-16 pt-16 pb-24 px-4 md:px-0 overflow-x-hidden'>
              {children}
            </main>

            <Toaster richColors duration={5000} />
            <Footer />
          </div>

          <Bootstrap />
        </Providers>
      </body>
    </html>
  )
}
