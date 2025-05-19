import { Command } from 'commander'
import restoreCursor from 'restore-cursor'

import { signin } from './commands/signin'

async function main() {
  restoreCursor()

  const program = new Command()
  program.addCommand(signin)

  program.parse()
}

await main()
