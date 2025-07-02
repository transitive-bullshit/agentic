import { loadAgenticConfig } from '@agentic/platform'
import { Command } from 'commander'
import { gracefulExit } from 'exit-hook'
import { oraPromise } from 'ora'

import type { Context } from '../types'
import { AuthStore } from '../lib/auth-store'

export function registerDeployCommand({
  client,
  program,
  logger,
  handleError
}: Context) {
  const command = new Command('deploy')
    .description('Creates a new deployment.')
    .option(
      '-c, --cwd <dir>',
      'The directory to load the Agentic project config from (defaults to cwd). This directory must contain an "agentic.config.{ts,js,json}" project file.'
    )
    .option('-d, --debug', 'Print out the parsed agentic config and return.')
    // TODO
    //.option('-p, --publish', 'Publishes the deployment after creating it.')
    .action(async (opts) => {
      AuthStore.requireAuth()

      try {
        // Load the Agentic project config, parse, and validate it. This will also
        // validate any origin adapter config such as OpenAPI or MCP specs and
        // embed them if they point to local files or URLs. Note that the server
        // also performs validation; this is just a client-side convenience for
        // failing fast and sharing 99% of the validation code between server and
        // client.
        const config = await oraPromise(
          loadAgenticConfig({
            cwd: opts.cwd,
            agenticApiClient: client
          }),
          {
            text: `Loading Agentic config from ${opts.cwd ?? process.cwd()}`,
            successText: `Agentic config loaded successfully.`,
            failText: 'Failed to load Agentic config.'
          }
        )

        if (opts.debug) {
          logger.log(config)
          gracefulExit(0)
          return
        }

        // Create the deployment on the backend, validating it in the process.
        // Note that the backend performs more validation than the client does
        // and is the ultimate source of truth.
        const deployment = await oraPromise(
          client.createDeployment(
            config
            // TODO: need to prompt to get or confirm version before publishing
            // {
            //   publish: opts.publish ? 'true' : 'false'
            // }
          ),
          {
            text: `Creating deployment for project "${config.slug}"`,
            successText: `Deployment created successfully`,
            failText: 'Failed to create deployment'
          }
        )

        logger.log(deployment)
        gracefulExit(0)
      } catch (err) {
        handleError(err)
      }
    })

  program.addCommand(command)
}
