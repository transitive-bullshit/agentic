import * as Sentry from '@sentry/node'

// This MUST be run before anything else (imported first in the root file).
// No other imports (like env) should be imported in this file.
Sentry.init({
  dsn: process.env.SENTRY_DSN, // eslint-disable-line no-process-env
  environment: process.env.ENVIRONMENT || 'development', // eslint-disable-line no-process-env
  integrations: [Sentry.extraErrorDataIntegration()],
  tracesSampleRate: 1.0,
  sendDefaultPii: true
})
