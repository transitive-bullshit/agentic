import Link from 'next/link'

import { ActiveLink } from '@/components/active-link'
import { GitHubIcon } from '@/icons/github'
import { TwitterIcon } from '@/icons/twitter'
import { copyright, docsUrl, githubUrl, twitterUrl } from '@/lib/config'

export function Footer() {
  return (
    <footer className='w-full pt-12 pb-4 border-t flex flex-col items-center'>
      <div className='container px-4 md:px-6 max-w-1200px'>
        <div className='flex flex-col md:grid md:grid-cols-4 gap-8'>
          <div className='flex flex-col md:items-center'>
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold'>Site</h3>

              <nav className='flex flex-col space-y-2'>
                <span>
                  <ActiveLink href='/' className='link'>
                    Home
                  </ActiveLink>
                </span>

                <span>
                  <ActiveLink href='/marketplace' className='link'>
                    MCP Marketplace
                  </ActiveLink>
                </span>

                <span>
                  <ActiveLink href='/publishing' className='link'>
                    Publishing MCPs
                  </ActiveLink>
                </span>

                <span>
                  <ActiveLink href={docsUrl} className='link'>
                    Docs
                  </ActiveLink>
                </span>

                <span>
                  <ActiveLink href='/about' className='link'>
                    About
                  </ActiveLink>
                </span>

                <span>
                  <ActiveLink href='/legal' className='link'>
                    Legal
                  </ActiveLink>
                </span>
              </nav>
            </div>
          </div>

          <div className='flex flex-col order-last md:order-none col-span-2'>
            <div className='space-y-4 flex flex-col w-full'>
              <h3 className='text-lg font-semibold'>TODO</h3>

              <div className='grid grid-cols-[repeat(auto-fill,_minmax(10em,_1fr))] gap-y-4 gap-x-8 w-full flex-auto'>
                <div className='link'>TODO</div>
              </div>
            </div>
          </div>

          <div className='flex flex-col md:items-center gap-4'>
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
