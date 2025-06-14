'use client'

import cs from 'clsx'
import Link, { type LinkProps } from 'next/link'
import { usePathname } from 'next/navigation'
import * as React from 'react'

type ActiveLinkProps = LinkProps & {
  children?: React.ReactNode
  className?: string
  activeClassName?: string
  style?: React.CSSProperties

  // optional comparison function to normalize URLs before comparing
  compare?: (a?: any, b?: any) => boolean
}

/**
 * Link that will be disabled if the target `href` is the same as the current
 * route's pathname.
 */
export const ActiveLink = React.forwardRef(function ActiveLink(
  {
    children,
    href,
    style,
    className,
    activeClassName,
    onClick,
    prefetch,
    compare = (a, b) => a === b,
    ...props
  }: ActiveLinkProps,
  ref
) {
  const pathname = usePathname()
  const [disabled, setDisabled] = React.useState(false)

  React.useEffect(() => {
    const linkPathname = new URL(href as string, location.href).pathname

    setDisabled(compare(linkPathname, pathname))
  }, [pathname, href, compare])

  const styleOverride = React.useMemo<React.CSSProperties>(
    () =>
      disabled
        ? {
            ...style,
            pointerEvents: 'none'
          }
        : (style ?? {}),
    [disabled, style]
  )

  const onClickOverride = React.useCallback(
    (event: any): void => {
      if (disabled) {
        event.preventDefault()
        return
      }

      if (onClick) {
        onClick(event)
        return
      }
    },
    [disabled, onClick]
  )

  return (
    <Link
      {...props}
      className={cs(className, disabled && activeClassName)}
      href={href}
      prefetch={disabled ? false : prefetch}
      style={styleOverride}
      onClick={onClickOverride}
      ref={ref as any}
    >
      {children}
    </Link>
  )
})
