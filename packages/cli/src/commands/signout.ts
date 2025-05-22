import { Command } from 'commander'

import type { Context } from '../types'
import { AuthStore } from '../store'

export function registerSignoutCommand({ client, program, logger }: Context) {
  const command = new Command('logout')
    .alias('signout')
    .description('Signs the current user out')
    .action(async () => {
      if (!AuthStore.isAuthenticated()) {
        return
      }

      await client.clearAuthSession()
      AuthStore.clearAuth()

      logger.log('Signed out')
    })

  program.addCommand(command)
}
