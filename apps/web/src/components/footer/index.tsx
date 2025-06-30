import Link from 'next/link'

import { ActiveLink } from '@/components/active-link'
import { GitHubIcon } from '@/icons/github'
import { TwitterIcon } from '@/icons/twitter'
import { copyright, githubUrl, twitterUrl } from '@/lib/config'

import { DynamicFooter } from './dynamic'

export function Footer() {
  return (
    <footer className='w-full pt-12 pb-4 border-t flex flex-col items-center'>
      <div className='container px-4 sm:px-6 max-w-1200px'>
        <div className='flex flex-col sm:grid sm:grid-cols-2 md:grid-cols-4 gap-8'>
          <div className='flex flex-col sm:items-center'>
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold'>Platform</h3>

              <nav className='flex flex-col space-y-2'>
                <div>
                  <ActiveLink href='/' className='link'>
                    Home
                  </ActiveLink>
                </div>

                <div>
                  <ActiveLink href='/marketplace' className='link'>
                    MCP Marketplace
                  </ActiveLink>
                </div>

                <div>
                  <ActiveLink href='/publishing' className='link'>
                    MCP Publishing
                  </ActiveLink>
                </div>

                <DynamicFooter />
              </nav>
            </div>
          </div>

          <div className='flex flex-col sm:items-center'>
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold'>Resources</h3>

              <nav className='flex flex-col space-y-2'>
                <div>
                  <Link href='https://docs.agentic.so' className='link'>
                    Docs
                  </Link>
                </div>

                <div>
                  <Link
                    href='https://docs.agentic.so/publishing'
                    className='link'
                  >
                    Publishing Docs
                  </Link>
                </div>

                <div>
                  <Link
                    href='https://docs.agentic.so/publishing/guides/existing-openapi-service'
                    className='link'
                  >
                    OpenAPI to MCP
                  </Link>
                </div>

                <div>
                  <Link
                    href='https://docs.agentic.so/publishing'
                    className='link'
                  >
                    Agentic MCP Gateway
                  </Link>
                </div>

                <div>
                  <Link
                    href='https://docs.agentic.so/marketplace/ts-sdks/openai-chat'
                    className='link'
                  >
                    Agentic + OpenAI
                  </Link>
                </div>

                <div>
                  <Link
                    href='https://docs.agentic.so/marketplace/ts-sdks/ai-sdk'
                    className='link'
                  >
                    Agentic + Vercel AI SDK
                  </Link>
                </div>

                <div>
                  <Link
                    href='https://docs.agentic.so/marketplace/ts-sdks/langchain'
                    className='link'
                  >
                    Agentic + LangChain
                  </Link>
                </div>

                <div>
                  <Link
                    href='https://docs.agentic.so/marketplace/ts-sdks/llamaindex'
                    className='link'
                  >
                    Agentic + LlamaIndex
                  </Link>
                </div>

                <div>
                  <Link
                    href='https://docs.agentic.so/marketplace/ts-sdks/genkit'
                    className='link'
                  >
                    Agentic + Firebase GenKit
                  </Link>
                </div>

                <div>
                  <Link
                    href='https://docs.agentic.so/marketplace/ts-sdks/mastra'
                    className='link'
                  >
                    Agentic + Mastra
                  </Link>
                </div>
              </nav>
            </div>
          </div>

          <div className='flex flex-col sm:items-center'>
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold'>Company</h3>

              <nav className='flex flex-col space-y-2'>
                <div>
                  <ActiveLink href='/about' className='link'>
                    About
                  </ActiveLink>
                </div>

                <div>
                  <ActiveLink href='/contact' className='link'>
                    Contact
                  </ActiveLink>
                </div>

                <div>
                  <ActiveLink href='/privacy-policy' className='link'>
                    Privacy Policy
                  </ActiveLink>
                </div>

                <div>
                  <ActiveLink href='/terms' className='link'>
                    Terms of Service
                  </ActiveLink>
                </div>
              </nav>
            </div>
          </div>

          <div className='flex flex-col sm:items-center gap-4'>
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold'>Social</h3>

              <nav className='flex flex-col gap-4'>
                <Link
                  href={twitterUrl}
                  className='flex items-center space-x-2'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  <TwitterIcon className='h-4 w-4' />

                  <span>Twitter</span>
                </Link>

                <Link
                  href={githubUrl}
                  className='flex items-center space-x-2'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  <GitHubIcon className='h-4 w-4' />

                  <span>GitHub</span>
                </Link>
              </nav>
            </div>
          </div>
        </div>

        <div className='mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground'>
          <span>{copyright}</span>
        </div>
      </div>
    </footer>
  )
}
