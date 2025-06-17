import { Command } from 'commander'

import type { Context } from '../types'
import { auth } from '../lib/auth'

export function registerSignupCommand({ client, program, logger }: Context) {
  const command = new Command('signup')
    .description(
      'Creates a new account for Agentic. If no credentials are provided, uses GitHub auth.'
    )
    .option('-e, --email <email>', 'Account email')
    .option('-u, --username <username>', 'Account username')
    .option('-p, --password <password>', 'Account password')
    .action(async (opts) => {
      if (
        !!opts.email !== !!opts.password ||
        !!opts.email !== !!opts.username
      ) {
        logger.error(
          'either pass email, username, and password or none of them (which will use github auth)'
        )
        program.outputHelp()
        return
      }

      if (opts.email && opts.username && opts.password) {
        await client.signUpWithPassword({
          email: opts.email,
          username: opts.username,
          password: opts.password
        })
      } else {
        await auth({ client, provider: 'github' })
      }

      const user = await client.getMe()
      logger.log(user)
    })

  program.addCommand(command)
}
