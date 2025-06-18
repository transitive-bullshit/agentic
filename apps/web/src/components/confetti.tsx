'use client'

import type { Simplify } from 'type-fest'
import confetti, { type Options as ConfettiBaseOptions } from 'canvas-confetti'
import { useCallback } from 'react'

export type ConfettiOptions = Simplify<
  ConfettiBaseOptions & {
    duration?: number
    intervalMs?: number
  }
>

// TODO: make shoot in from the sides
export function useConfettiFireworks() {
  const fireConfetti = useCallback((options: ConfettiOptions = {}) => {
    const duration = options.duration ?? 4 * 1000
    const intervalMs = options.intervalMs ?? 250
    const animationEnd = Date.now() + duration
    const defaults: ConfettiOptions = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 100,
      ...options
    }

    const randomInRange = (min: number, max: number) =>
      Math.random() * (max - min) + min

    const interval = globalThis.window.setInterval(() => {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return globalThis.clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)
      void confetti({
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        ...defaults
      })

      void confetti({
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        ...defaults
      })
    }, intervalMs)

    return () => {
      globalThis.clearInterval(interval)
    }
  }, [])

  return {
    fireConfetti
  }
}
