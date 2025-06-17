import './globals.css'

import type { Metadata } from 'next'
import cs from 'clsx'
import { Geist } from 'next/font/google'
import { Toaster } from 'sonner'

import { Bootstrap } from '@/components/bootstrap'
import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import * as config from '@/lib/config'

import Providers from './providers'
import styles from './styles.module.css'

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
          <div className={styles.root}>
            <Header />

            <main className={cs(styles.main, 'pt-8 pb-16 px-4 md:px-0')}>
              {children}
            </main>

            <Toaster richColors />
            <Footer />
          </div>

          <Bootstrap />
        </Providers>
      </body>
    </html>
  )
}
