import { Command } from 'commander'
import restoreCursor from 'restore-cursor'

import { deploy } from './commands/deploy'
import { get } from './commands/get'
import { ls } from './commands/ls'
import { publish } from './commands/publish'
import { rm } from './commands/rm'
import { signin } from './commands/signin'

async function main() {
  restoreCursor()

  const program = new Command()
  program.addCommand(signin)
  program.addCommand(get)
  program.addCommand(ls)
  program.addCommand(publish)
  program.addCommand(rm)
  program.addCommand(deploy)

  program.parse()
}

await main()
