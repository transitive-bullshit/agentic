#!/usr/bin/env node
import 'dotenv/config'

import { gracefulExit } from 'exit-hook'
import restoreCursor from 'restore-cursor'

import type * as types from '@/types.js'

/**
 * Scratch for quick testing.
 */
async function main() {
  restoreCursor()

  return gracefulExit(0)
}

try {
  await main()
} catch (err) {
  console.error('unexpected error', err)
  gracefulExit(1)
}
