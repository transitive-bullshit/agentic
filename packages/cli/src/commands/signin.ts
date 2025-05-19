import { Command } from 'commander'

export const signin = new Command('login')
  .alias('signin')
  .description(
    'Signs in to Agentic. If no credentials are provided, uses GitHub auth.'
  )
  .option('-u, --username <username>', 'account username')
  .option('-e, --email <email>', 'account email')
  .option('-p, --password <password>', 'account password')
  .action(async (opts) => {
    console.log('TODO: signin')
  })
