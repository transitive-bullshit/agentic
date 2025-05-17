import { sha256 } from './utils'

export function createConsumerToken(): string {
  return sha256().slice(0, 24)
}
