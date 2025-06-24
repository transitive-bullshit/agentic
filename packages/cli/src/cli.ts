import { AgenticApiClient } from '@agentic/platform-api-client'
import { Command } from 'commander'

import type { Context } from './types'
import { registerDebugCommand } from './commands/debug'
import { registerDeployCommand } from './commands/deploy'
import { registerGetDeploymentCommand } from './commands/get'
import { registerListDeploymentsCommand } from './commands/list'
import { registerPublishCommand } from './commands/publish'
import { registerSigninCommand } from './commands/signin'
import { registerSignoutCommand } from './commands/signout'
import { registerSignupCommand } from './commands/signup'
import { registerWhoAmICommand } from './commands/whoami'
import { AuthStore } from './lib/auth-store'
import { initExitHooks } from './lib/exit-hooks'
import { createErrorHandler } from './lib/handle-error'

async function main() {
  initExitHooks()

  // Initialize the API client
  const client = new AgenticApiClient({
    apiBaseUrl: process.env.AGENTIC_API_BASE_URL,
    onUpdateAuth: (update) => {
      if (update) {
        AuthStore.setAuth(update)
      } else {
        AuthStore.clearAuth()
      }
    }
  })

  // Initialize the existing auth session if one exists
  const authSession = AuthStore.tryGetAuth()
  if (authSession) {
    try {
      client.authSession = authSession
    } catch {
      console.warn('Existing auth session is invalid; logging out.\n')
      AuthStore.clearAuth()
    }
  }

  // Initialize the CLI program
  const program = new Command('agentic')
    .option('-j, --json', 'Print output as JSON')
    .showHelpAfterError()

  const logger = {
    log: (...args: any[]) => {
      if (program.opts().json) {
        console.log(
          args.length === 1
            ? JSON.stringify(args[0], null, 2)
            : JSON.stringify(args, null, 2)
        )
      } else {
        console.log(...args)
      }
    },
    info: (...args: any[]) => {
      console.info(...args)
    },
    error: (...args: any[]) => {
      console.error(...args)
    }
  }

  const partialCtx = {
    client,
    program,
    logger
  }

  const errorHandler = createErrorHandler(partialCtx)
  const ctx: Context = {
    ...partialCtx,
    handleError: errorHandler
  }

  // Register all commands
  registerSigninCommand(ctx)
  registerSignupCommand(ctx)
  registerWhoAmICommand(ctx)
  registerSignoutCommand(ctx)
  registerDeployCommand(ctx)
  registerPublishCommand(ctx)
  registerGetDeploymentCommand(ctx)
  registerListDeploymentsCommand(ctx)
  registerDebugCommand(ctx)

  program.parse()
}

await main()
