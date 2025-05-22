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
    apiCookie: AuthStore.tryGetAuth()?.cookie,
    apiBaseUrl: process.env.AGENTIC_API_BASE_URL
  })

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
