import { Command } from 'commander'
import { gracefulExit } from 'exit-hook'

import type { Context } from '../types'
import { auth } from '../lib/auth'

export function registerSigninCommand({
  client,
  program,
  logger,
  handleError
}: Context) {
  const command = new Command('login')
    .alias('signin')
    .description(
      'Signs in to Agentic. If no credentials are provided, uses GitHub auth.'
    )
    .option('-e, --email <email>', 'Account email')
    .option('-p, --password <password>', 'Account password')
    .action(async (opts) => {
      if (!!opts.email !== !!opts.password) {
        logger.error(
          'either pass email and password or neither (which will use github auth)'
        )
        program.outputHelp()
        return gracefulExit(1)
      }

      try {
        if (opts.email && opts.password) {
          await client.signInWithPassword({
            email: opts.email,
            password: opts.password
          })
        } else {
          await auth({ client, provider: 'github' })
        }

        const user = await client.getMe()
        logger.log(user)
        gracefulExit(0)
      } catch (err) {
        handleError(err)
      }
    })

  program.addCommand(command)
}
