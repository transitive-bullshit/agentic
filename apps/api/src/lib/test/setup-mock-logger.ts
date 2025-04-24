import type { Logger } from 'pino'
import { vi } from 'vitest'

export function setupMockLogger() {
  return {
    child: () =>
      ({
        trace: vi.fn(),
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn()
      }) as unknown as Logger,
    trace: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  } as unknown as Logger
}
