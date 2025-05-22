import type { AuthSession } from '@agentic/platform-api-client'
import { Command, InvalidArgumentError } from 'commander'

import type { Context } from '../types'
import { authWithEmailPassword } from '../auth-with-email-password'
import { authWithGitHub } from '../auth-with-github'

export function registerSigninCommand({ client, program, logger }: Context) {
  const command = new Command('login')
    .alias('signin')
    .description(
      'Signs in to Agentic. If no credentials are provided, uses GitHub auth.'
    )
    // TODO
    // .option('-u, --username <username>', 'account username')
    .option('-e, --email <email>', 'account email')
    .option('-p, --password <password>', 'account password')
    .action(async (opts) => {
      let session: AuthSession | undefined
      if (opts.email) {
        if (!opts.password) {
          throw new InvalidArgumentError(
            'Password is required when using email'
          )
        }

        session = await authWithEmailPassword({
          client,
          email: opts.email,
          password: opts.password
        })
      } else {
        session = await authWithGitHub({ client })
      }

      logger.log(session)
    })

  program.addCommand(command)
}
