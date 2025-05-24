import { Command } from 'commander'

import type { Context } from '../types'

export function registerWhoAmICommand({ client, program, logger }: Context) {
  const command = new Command('whoami')
    .description('Displays info about the current user')
    .action(async () => {
      if (!client.isAuthenticated) {
        logger.log('Not signed in')
        return
      }

      const res = await client.getMe()
      logger.log(res)
    })

  program.addCommand(command)
}
