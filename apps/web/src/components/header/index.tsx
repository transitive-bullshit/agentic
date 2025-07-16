import Link from 'next/link'

import { ActiveLink } from '@/components/active-link'
import { DarkModeToggle } from '@/components/dark-mode-toggle'
import { Button } from '@/components/ui/button'
import { GitHubIcon } from '@/icons/github'
import { githubUrl } from '@/lib/config'
import { cn } from '@/lib/utils'

import { AuthenticatedHeader } from './authenticated-header'
import styles from './styles.module.css'
import { UnauthenticatedHeader } from './unauthenticated-header'

export function Header() {
  return (
    <header className={cn(styles.header, 'shadow-sm')}>
      <div className={styles.headerContent}>
        <ActiveLink className='select-none' href='/'>
          <img
            src='/agentic-logo-light.svg'
            alt='AGENTIC'
            className='w-[144px] dark:hidden'
          />
          <img
            src='/agentic-logo-dark.svg'
            alt='AGENTIC'
            className='w-[144px] hidden dark:block'
          />
        </ActiveLink>

        <div className='flex justify-end items-center h-full gap-4'>
          <ActiveLink
            href='/marketplace'
            className='link hidden sm:block whitespace-nowrap'
          >
            MCP Marketplace
          </ActiveLink>

          <ActiveLink href='/publishing' className='link whitespace-nowrap'>
            MCP Publishing
          </ActiveLink>

          <ActiveLink
            href='https://docs.agentic.so'
            className='link whitespace-nowrap'
          >
            Docs
          </ActiveLink>

          <div className='flex items-center h-full gap-2'>
            <UnauthenticatedHeader />

            <DarkModeToggle />

            <Button variant='outline' size='icon' asChild>
              <Link href={githubUrl} target='_blank' rel='noopener noreferrer'>
                <GitHubIcon className='w-4 h-4' />
              </Link>
            </Button>

            <AuthenticatedHeader />
          </div>
        </div>
      </div>
    </header>
  )
}
