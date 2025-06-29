#!/usr/bin/env node

import { cli } from 'cleye'
import { gracefulExit } from 'exit-hook'

import { generateTSFromOpenAPI } from '../src'

async function main() {
  const args = cli(
    {
      name: 'openapi-to-ts',
      parameters: ['<openapi file path>'],
      flags: {
        debug: {
          type: Boolean,
          description: 'Enables verbose debug logging',
          alias: 'v',
          default: false
        },
        outputDir: {
          type: String,
          description: 'Path to the output directory (defaults to cwd)',
          alias: 'o'
        },
        dryRun: {
          type: Boolean,
          description: 'Disables all side effects',
          default: false
        },
        noPrettier: {
          type: Boolean,
          description: 'Disables prettier formatting',
          default: false
        },
        noEslint: {
          type: Boolean,
          description: 'Disables eslint formatting',
          default: false
        },
        noZodJsDocs: {
          type: Boolean,
          description: 'Disables js docs for zod schemas',
          default: false
        }
      }
    },
    () => {},
    process.argv
  )

  const openapiFilePath = args._[2]!

  if (!openapiFilePath) {
    console.error('Missing required argument: <openapi file path>\n')
    args.showHelp()
    gracefulExit(1)
    return
  }

  if (Object.keys(args.unknownFlags).length) {
    console.error(
      'Unknown flags:',
      Object.keys(args.unknownFlags).join(', '),
      '\n'
    )
    args.showHelp()
    gracefulExit(1)
    return
  }

  const output = await generateTSFromOpenAPI({
    openapiFilePath,
    outputDir: args.flags.outputDir || process.cwd(),
    dryRun: args.flags.dryRun,
    prettier: !args.flags.noPrettier,
    eslint: !args.flags.noEslint,
    zodSchemaJsDocs: !args.flags.noZodJsDocs
  })

  if (args.flags.dryRun) {
    console.log(output)
  }
}

try {
  await main()
  gracefulExit(0)
} catch (err) {
  console.error(err)
  gracefulExit(1)
}
