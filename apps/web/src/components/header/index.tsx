'use client'

import { useTheme } from 'next-themes'

import { ActiveLink } from '@/components/active-link'
import { useAgentic } from '@/components/agentic-provider'
import { DarkModeToggle } from '@/components/dark-mode-toggle'
import { docsUrl } from '@/lib/config'
import { cn } from '@/lib/utils'

import styles from './styles.module.css'

export function Header() {
  const { resolvedTheme } = useTheme()
  const ctx = useAgentic()

  return (
    <header className={cn(styles.header, 'shadow-sm')}>
      <div className={styles.headerContent}>
        <ActiveLink className={styles.logo} href='/'>
          <img
            src={
              resolvedTheme === 'dark'
                ? '/agentic-name-flat-dark.svg'
                : '/agentic-name-flat-light.svg'
            }
            alt='AGENTIC'
            className='w-[144px]'
          />
        </ActiveLink>

        <div className='flex justify-end items-center h-full gap-4'>
          <ActiveLink href='/marketplace' className='link hidden sm:block'>
            MCP Marketplace
          </ActiveLink>

          <ActiveLink href={docsUrl} className='link'>
            Docs
          </ActiveLink>

          {ctx?.isAuthenticated ? (
            <>
              <ActiveLink href='/app' className='link'>
                Dashboard
              </ActiveLink>

              <ActiveLink href='/logout' className='link'>
                Logout
              </ActiveLink>
            </>
          ) : (
            <>
              <ActiveLink href='/login' className='link'>
                Login
              </ActiveLink>

              <ActiveLink href='/signup' className='link'>
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
