import 'dotenv/config'

import { AgenticApiClient } from '@agentic/platform-api-client'
import { Command } from 'commander'
import restoreCursor from 'restore-cursor'

import { registerSigninCommand } from './commands/signin'
import { registerSignoutCommand } from './commands/signout'
import { registerWhoAmICommand } from './commands/whoami'
import { AuthStore } from './store'

async function main() {
  restoreCursor()

  const client = new AgenticApiClient({
    apiBaseUrl: process.env.AGENTIC_API_BASE_URL,
    onUpdateAuth: (update) => {
      if (update) {
        AuthStore.setAuth({
          refreshToken: update.session.refresh,
          user: update.user
        })
      } else {
        AuthStore.clearAuth()
      }
    }
  })

  // Initialize the existing auth session if one exists
  const authSession = AuthStore.tryGetAuth()
  if (authSession) {
    try {
      await client.setRefreshAuthToken(authSession.refreshToken)
    } catch {
      console.warn('Existing auth session is invalid; logging out.\n')
      AuthStore.clearAuth()
    }
  }

  const program = new Command('agentic')
    .option('-j, --json', 'Print output in JSON format')
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

  program.parse()
}

await main()
