import { ResendEmailClient } from '@agentic/platform-emails'

import { env } from '@/lib/env'

export const resend = new ResendEmailClient({
  apiKey: env.RESEND_API_KEY
})
