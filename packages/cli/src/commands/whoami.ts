import { Command } from 'commander'

import type { Context } from '../types'
import { AuthStore } from '../lib/auth-store'

export function registerWhoAmICommand({ client, program, logger }: Context) {
  const command = new Command('whoami')
    .description('Displays info about the current user.')
    .action(async () => {
      AuthStore.requireAuth()

      const res = await client.getMe()
      logger.log(res)
    })

  program.addCommand(command)
}
