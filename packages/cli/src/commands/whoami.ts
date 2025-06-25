import { Command } from 'commander'
import { gracefulExit } from 'exit-hook'

import type { Context } from '../types'
import { AuthStore } from '../lib/auth-store'

export function registerWhoAmICommand({
  client,
  program,
  logger,
  handleError
}: Context) {
  const command = new Command('whoami')
    .description('Displays info about the current user.')
    .action(async () => {
      AuthStore.requireAuth()

      try {
        const res = await client.getMe()
        logger.log(res)
        gracefulExit(0)
      } catch (err) {
        handleError(err)
      }
    })

  program.addCommand(command)
}
