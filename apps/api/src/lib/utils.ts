import { createHash, randomUUID } from 'node:crypto'

export function sha256(input: string = randomUUID()) {
  return createHash('sha256').update(input).digest('hex')
}
