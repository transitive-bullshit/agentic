import { vi } from 'vitest'

import type { Logger } from '@/lib/logger'

export function setupMockLogger() {
  return {
    trace: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  } as Logger
}
