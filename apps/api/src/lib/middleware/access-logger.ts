import { logger as honoLogger } from 'hono/logger'

import { logger } from '@/lib/logger'

import { unless } from './unless'

export const accessLogger = unless(honoLogger(logger.trace), '/v1/health')
