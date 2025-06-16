'use client'

// import { AnimatePresence, motion } from 'motion/react'
import dynamic from 'next/dynamic'
import { useTheme } from 'next-themes'

import { cn } from '@/lib/utils'

import loadingDark from './loading-dark.json'
import loadingLight from './loading-light.json'
import styles from './styles.module.css'

const Lottie = dynamic(() => import('react-lottie-player'), {
  ssr: false
})

export function LoadingIndicator({ className }: { className?: string }) {
  const { resolvedTheme } = useTheme()

  return (
    <Lottie
      play
      loop
      animationData={resolvedTheme === 'dark' ? loadingDark : loadingLight}
      className={cn(styles.loadingAnimation, className)}
    />

    // <AnimatePresence>
    //   {isLoading ? (
    //     <motion.div
    //       className={cn(styles.loading, fill && styles.fill, className)}
    //       transition={{ duration: 10 }}
    //       exit={{ opacity: 0, ...exit }}
    //       {...rest}
    //     >
    //       <Lottie
    //         play
    //         loop
    //         animationData={
    //           resolvedTheme === 'dark' ? loadingDark : loadingLight
    //         }
    //         className={styles.loadingAnimation}
    //       />
    //     </motion.div>
    //   ) : null}
    // </AnimatePresence>
  )
}
