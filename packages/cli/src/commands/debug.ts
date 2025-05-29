import { Command } from 'commander'
import { oraPromise } from 'ora'

import type { Context } from '../types'
import { AuthStore } from '../lib/auth-store'
import { loadAgenticConfig } from '../lib/load-agentic-config'

export function registerDebugCommand({ program, logger }: Context) {
  const command = new Command('debug')
    .description('Prints config for a local project.')
    .option(
      '-c, --cwd <dir>',
      'The directory to load the Agentic project config from (defaults to cwd). This directory must contain an "agentic.config.{ts,js,json}" project file.'
    )
    .action(async (opts) => {
      AuthStore.requireAuth()

      // Load the Agentic project config, parse, and validate it. This will also
      // validate any origin adapter config such as OpenAPI or MCP specs and
      // embed them if they point to local files or URLs. Note that the server
      // also performs validation; this is just a client-side convenience for
      // failing fast and sharing 99% of the validation code between server and
      // client.
      const config = await oraPromise(
        loadAgenticConfig({
          cwd: opts.cwd
        }),
        {
          text: `Loading Agentic config from ${opts.cwd}`,
          successText: `Agentic config loaded successfully.`,
          failText: 'Failed to load Agentic config.'
        }
      )

      // TODO: we may want to resolve the resulting agentic config so we see
      // the inferred `tools` (and `toolToOperationMap` for mcp servers)

      logger.log(config)
    })

  program.addCommand(command)
}
