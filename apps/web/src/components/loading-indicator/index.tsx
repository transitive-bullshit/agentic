'use client'

import cs from 'clsx'
import { AnimatePresence, motion } from 'motion/react'
import dynamic from 'next/dynamic'
import { useTheme } from 'next-themes'

import loadingDark from './loading-dark.json'
import loadingLight from './loading-light.json'
import styles from './styles.module.css'

const Lottie = dynamic(() => import('react-lottie-player'), {
  ssr: false
})

export function LoadingIndicator({
  isLoading = true,
  fill = false,
  className,
  initial,
  animate,
  exit,
  ...rest
}: {
  isLoading?: boolean
  fill?: boolean
  className?: string
  initial?: any
  animate?: any
  exit?: any
}) {
  const { resolvedTheme } = useTheme()

  return (
    <AnimatePresence>
      {isLoading ? (
        <motion.div
          className={cs(styles.loading, fill && styles.fill, className)}
          initial={{ opacity: 1, ...initial }}
          animate={{ opacity: 1, ...animate }}
          exit={{ opacity: 0, ...exit }}
          {...rest}
        >
          <Lottie
            play
            loop
            animationData={
              resolvedTheme === 'dark' ? loadingDark : loadingLight
            }
            className={styles.loadingAnimation}
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
