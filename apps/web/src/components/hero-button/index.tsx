import type * as React from 'react'
import type { Simplify } from 'type-fest'
import cs from 'clsx'

import { Button, type ButtonProps } from '@/components/ui/button'

import styles from './styles.module.css'

export type HeroButtonVariant = 'orange' | 'blue' | 'purple'

export type HeroButtonProps = Simplify<
  {
    heroVariant?: HeroButtonVariant
    className?: string
    buttonClassName?: string
  } & ButtonProps
>

export function HeroButton({
  heroVariant = 'purple',
  className,
  buttonClassName,
  ...buttonProps
}: HeroButtonProps) {
  return (
    <div className={cs(styles.heroButtonWrapper, className)}>
      {heroVariant === 'blue' && (
        <span className={cs(styles.heroButtonBg, styles.heroButtonBg1)} />
      )}

      {heroVariant === 'purple' && (
        <span className={cs(styles.heroButtonBg, styles.heroButtonBg2)} />
      )}

      {heroVariant === 'orange' && (
        <span className={cs(styles.heroButtonBg, styles.heroButtonBg3)} />
      )}

      <Button
        className={cs(styles.heroButton, buttonClassName)}
        type='button'
        {...(buttonProps as any)}
      />
    </div>
  )
}
