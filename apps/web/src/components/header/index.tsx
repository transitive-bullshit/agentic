'use client'

import { useTheme } from 'next-themes'

import { ActiveLink } from '@/components/active-link'
import { useAgentic } from '@/components/agentic-provider'
import { DarkModeToggle } from '@/components/dark-mode-toggle'
import { docsUrl } from '@/lib/config'
import { cn } from '@/lib/utils'

import styles from './styles.module.css'

export function Header() {
  // TODO: use CSS for this instead of a hook
  const { resolvedTheme } = useTheme()
  const ctx = useAgentic()

  return (
    <header className={cn(styles.header, 'shadow-sm')}>
      <div className={styles.headerContent}>
        <ActiveLink className={styles.logo} href='/'>
          <img
            src={
              resolvedTheme === 'dark'
                ? '/agentic-logo-dark.svg'
                : '/agentic-logo-light.svg'
            }
            alt='AGENTIC'
            className='w-[144px]'
          />
        </ActiveLink>

        <div className='flex justify-end items-center h-full gap-4'>
          <ActiveLink
            href='/marketplace'
            className='link hidden sm:block whitespace-nowrap'
          >
            MCP Marketplace
          </ActiveLink>

          <ActiveLink href={docsUrl} className='link whitespace-nowrap'>
            Docs
          </ActiveLink>

          {ctx?.isAuthenticated ? (
            <>
              <ActiveLink href='/app' className='link whitespace-nowrap'>
                Dashboard
              </ActiveLink>

              <ActiveLink href='/logout' className='link whitespace-nowrap'>
                Logout
              </ActiveLink>
            </>
          ) : (
            <>
              <ActiveLink href='/login' className='link whitespace-nowrap'>
                Login
              </ActiveLink>

              <ActiveLink href='/signup' className='link whitespace-nowrap'>
                Sign up
              </ActiveLink>
            </>
          )}

          <DarkModeToggle />
        </div>
      </div>
    </header>
  )
}
