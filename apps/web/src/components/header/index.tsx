import cs from 'clsx'

import { ActiveLink } from '@/components/active-link'
import { DarkModeToggle } from '@/components/dark-mode-toggle'

import styles from './styles.module.css'

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <ActiveLink className={styles.logo} href='/'>
          AGENTIC
        </ActiveLink>

        <div className='md:hidden'>
          <ActiveLink href='/about' className='link'>
            About
          </ActiveLink>
        </div>

        <div className={cs(styles.rhs)}>
          <div className='hidden md:block'>
            <ActiveLink href='/about' className='link mr-2'>
              About
            </ActiveLink>
          </div>

          <DarkModeToggle />
        </div>
      </div>
    </header>
  )
}
