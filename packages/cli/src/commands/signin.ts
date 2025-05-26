import { Command } from 'commander'

import type { Context } from '../types'
import { auth } from '../lib/auth'

export function registerSigninCommand({ client, program, logger }: Context) {
  const command = new Command('login')
    .alias('signin')
    .description(
      'Signs in to Agentic. If no credentials are provided, uses GitHub auth.'
    )
    .option('-e, --email', 'Log in using email and password')
    .action(async (opts) => {
      await auth({ client, provider: opts.email ? 'password' : 'github' })

      const user = await client.getMe()
      logger.log(user)
    })

  program.addCommand(command)
}
