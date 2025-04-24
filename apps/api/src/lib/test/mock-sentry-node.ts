import { vi } from 'vitest'

/**
 * Mocks the entire @sentry/node module so that captureException is a spy.
 */
export function mockSentryNode(): void {
  vi.mock('@sentry/node', async () => {
    const actual = await vi.importActual('@sentry/node')
    return {
      ...actual,
      captureException: vi.fn(),
      setTags: vi.fn(),
      setTag: vi.fn(),
      withIsolationScope: vi.fn((fn) => fn()),
      startSpan: vi.fn((_, fn) => {
        const fakeSpan = {
          setAttributes: vi.fn(),
          end: vi.fn()
        }
        const callbackResult = fn(fakeSpan)
        return callbackResult
      })
    }
  })
}
