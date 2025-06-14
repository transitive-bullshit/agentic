import type * as React from 'react'
import cs from 'clsx'
import Link from 'next/link'

import { Button } from '@/components/ui/button'

import styles from './styles.module.css'

export type HeroButtonVariant = 'orange' | 'blue' | 'purple'

export function HeroButton({
  variant = 'purple',
  className,
  buttonClassName,
  children,
  ...buttonProps
}: {
  variant?: HeroButtonVariant
  className?: string
  buttonClassName?: string
  children: React.ReactNode
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <div className={cs(styles.heroButtonWrapper, className)}>
      {variant === 'blue' && (
        <span className={cs(styles.heroButtonBg, styles.heroButtonBg1)} />
      )}

      {variant === 'purple' && (
        <span className={cs(styles.heroButtonBg, styles.heroButtonBg2)} />
      )}

      {variant === 'orange' && (
        <span className={cs(styles.heroButtonBg, styles.heroButtonBg3)} />
      )}

      {buttonProps.href ? (
        <Link
          className={cs(styles.heroButton, buttonClassName)}
          href={buttonProps.href}
          {...buttonProps}
        >
          <div className={styles.heroButtonContent}>{children}</div>
        </Link>
      ) : (
        <Button
          className={cs(styles.heroButton, buttonClassName)}
          {...(buttonProps as any)}
          type='button'
        >
          <div className={styles.heroButtonContent}>{children}</div>
        </Button>
      )}
    </div>
  )
}
