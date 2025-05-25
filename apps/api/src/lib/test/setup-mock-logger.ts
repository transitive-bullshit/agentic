import type { Logger } from '@agentic/platform-core'
import { vi } from 'vitest'

export function setupMockLogger() {
  return {
    trace: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  } as Logger
}
