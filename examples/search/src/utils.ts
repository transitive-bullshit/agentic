import { timingSafeEqual } from 'node:crypto'

export function timingSafeCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false
  }

  if (a.length !== b.length) {
    return false
  }

  return timingSafeEqual(Buffer.from(a), Buffer.from(b))
}
