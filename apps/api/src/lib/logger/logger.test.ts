/* eslint-disable simple-import-sort/imports */
/* eslint-disable import/first */

import { afterEach, describe, expect, it, vi } from 'vitest'

import { mockSentryNode } from '../test'

// Mock Sentry before importing logger
mockSentryNode()

import * as Sentry from '@sentry/node'
import { logger } from './logger'

describe('logger', () => {
  afterEach(() => {
    // We only clear the usage data so it remains a spy.
    vi.clearAllMocks()
  })

  it('should call Sentry.captureException when calling logger.error() with an Error', () => {
    const error = new Error('test error')
    logger.error(error)
    expect(Sentry.captureException).toHaveBeenCalledWith(error)
  })

  it('should call Sentry.captureException when calling logger.error() with an {err: Error}', () => {
    const error = new Error('test error')
    logger.error({ err: error }, 'With some message')
    expect(Sentry.captureException).toHaveBeenCalledWith(error)
  })

  it('should not call Sentry.captureException for logger.warn()', () => {
    logger.warn('some warning message')
    expect(Sentry.captureException).not.toHaveBeenCalled()
  })
})
