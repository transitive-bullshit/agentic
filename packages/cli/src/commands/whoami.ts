import { Command } from 'commander'

import { getAuth } from '../store'

export const whoami = new Command('whoami')
  .description('Displays info about the current user')
  .action(async () => {
    const auth = getAuth()

    // TODO
    // eslint-disable-next-line no-console
    console.log(
      JSON.stringify({ user: auth.user, team: auth.teamSlug }, null, 2)
    )
  })
