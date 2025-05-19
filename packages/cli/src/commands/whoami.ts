import { Command } from 'commander'
import { getAuth, requireAuth } from '../store'

export const whoami = new Command('whoami')
  .description('Displays info about the current user')
  .action(async (opts) => {
    const auth = getAuth()

    console.log(
      JSON.stringify({ user: auth.user, team: auth.teamSlug }, null, 2)
    )
  })
