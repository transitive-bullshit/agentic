import { Command } from 'commander'
import { gracefulExit } from 'exit-hook'

import type { Context } from '../types'
import { AuthStore } from '../lib/auth-store'

export function registerSignoutCommand({
  client,
  program,
  logger,
  handleError
}: Context) {
  const command = new Command('logout')
    .alias('signout')
    .description('Signs the current user out.')
    .action(async () => {
      if (!client.isAuthenticated) {
        logger.log('You are already signed out')
        return gracefulExit(0)
      }

      try {
        await client.logout()
        AuthStore.clearAuth()

        logger.log('Signed out')
        gracefulExit(0)
      } catch (err) {
        handleError(err)
      }
    })

  program.addCommand(command)
}
