import { Command } from 'commander'

import type { Context } from '../types'
import { AuthStore } from '../store'

export function registerWhoAmICommand({ client, program, logger }: Context) {
  const command = new Command('whoami')
    .description('Displays info about the current user')
    .action(async () => {
      if (!AuthStore.isAuthenticated()) {
        logger.log('Not signed in')
        return
      }

      const res = await client.getAuthSession()
      logger.log(res)
    })

  program.addCommand(command)
}
