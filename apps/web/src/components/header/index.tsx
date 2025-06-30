import { ActiveLink } from '@/components/active-link'
import { DarkModeToggle } from '@/components/dark-mode-toggle'
import { cn } from '@/lib/utils'

import { DynamicHeader } from './dynamic'
import styles from './styles.module.css'

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

          <ActiveLink
            href='https://docs.agentic.so'
            className='link whitespace-nowrap'
          >
            Docs
          </ActiveLink>

          <DynamicHeader />

          <DarkModeToggle />
        </div>
      </div>
    </header>
  )
}
