import type * as React from 'react'
import type { Simplify } from 'type-fest'

import { Button, type ButtonProps } from '@/components/ui/button'
import { cn } from '@/lib/utils'

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
    <div className={cn(styles.heroButtonWrapper, className)}>
      {heroVariant === 'blue' && (
        <span className={cn(styles.heroButtonBg, styles.heroButtonBg1)} />
      )}

      {heroVariant === 'purple' && (
        <span className={cn(styles.heroButtonBg, styles.heroButtonBg2)} />
      )}

      {heroVariant === 'orange' && (
        <span className={cn(styles.heroButtonBg, styles.heroButtonBg3)} />
      )}

      <Button
        className={cn(styles.heroButton, buttonClassName)}
        type='button'
        {...(buttonProps as any)}
      />
    </div>
  )
}
