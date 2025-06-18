'use client'

import { ActiveLink } from '@/components/active-link'
import { useAgentic } from '@/components/agentic-provider'
import { DarkModeToggle } from '@/components/dark-mode-toggle'
import { docsUrl } from '@/lib/config'

import styles from './styles.module.css'

export function Header() {
  const ctx = useAgentic()

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <ActiveLink className={styles.logo} href='/'>
          AGENTIC
        </ActiveLink>

        <div className='flex justify-end items-center h-full gap-4'>
          <ActiveLink href='/marketplace' className='link'>
            Marketplace
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
