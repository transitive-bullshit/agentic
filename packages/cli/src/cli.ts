import 'dotenv/config'

import { AgenticApiClient } from '@agentic/platform-api-client'
import { Command } from 'commander'
import restoreCursor from 'restore-cursor'

import { registerDebugCommand } from './commands/debug'
import { registerDeployCommand } from './commands/deploy'
import { registerGetDeploymentCommand } from './commands/get'
import { registerListDeploymentsCommand } from './commands/list'
import { registerPublishCommand } from './commands/publish'
import { registerSigninCommand } from './commands/signin'
import { registerSignoutCommand } from './commands/signout'
import { registerWhoAmICommand } from './commands/whoami'
import { AuthStore } from './lib/auth-store'

async function main() {
  restoreCursor()

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
      await client.setAuth(authSession.session)
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
          args.length === 1 ? JSON.stringify(args[0]) : JSON.stringify(args)
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

  const ctx = {
    client,
    program,
    logger
  }

  // Register all commands
  registerSigninCommand(ctx)
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
