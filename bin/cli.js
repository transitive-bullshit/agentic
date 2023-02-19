#!/usr/bin/env node
import crypto from 'node:crypto'

import * as url from 'url'
import { cac } from 'cac'
import Conf from 'conf'
import { readPackageUp } from 'read-pkg-up'

import { ChatGPTAPI } from '../build/index.js'

async function main() {
  const dirname = url.fileURLToPath(new URL('.', import.meta.url))
  const pkg = await readPackageUp({ cwd: dirname })
  const version = (pkg && pkg.packageJson && pkg.packageJson.version) || '4'
  const config = new Conf({ projectName: 'chatgpt' })

  const cli = cac('chatgpt')
  cli
    .command('<prompt>', 'Ask ChatGPT a question')
    .option('-c, --continue', 'Continue last conversation', {
      default: false
    })
    .option('-d, --debug', 'Enables debug logging', {
      default: false
    })
    .option('-s, --stream', 'Streams the response', {
      default: true
    })
    .option('-s, --store', 'Enables the local message cache', {
      default: true
    })
    .option('-t, --timeout', 'Timeout in milliseconds')
    .option('-k, --apiKey', 'OpenAI API key')
    .option('-n, --conversationName', 'Unique name for the conversation')
    .action(async (prompt, options) => {
      const apiKey = options.apiKey || process.env.OPENAI_API_KEY
      if (!apiKey) {
        console.error('error: either set OPENAI_API_KEY or use --apiKey\n')
        cli.outputHelp()
        process.exit(1)
      }

      const apiKeyHash = hash(apiKey)
      const conversationName = options.conversationName || 'default'
      const conversationKey = `${conversationName}:${apiKeyHash}`
      const conversation =
        options.continue && options.store
          ? config.get(conversationKey, {}) || {}
          : {}
      let conversationId = undefined
      let parentMessageId = undefined

      if (conversation.lastMessageId) {
        const lastMessage = conversation[conversation.lastMessageId]
        if (lastMessage) {
          conversationId = lastMessage.conversationId
          parentMessageId = lastMessage.id
        }
      }

      if (options.debug) {
        console.log('using config', config.path)
      }

      const api = new ChatGPTAPI({
        apiKey,
        debug: options.debug,
        getMessageById: async (id) => {
          if (options.store) {
            return conversation[id]
          } else {
            return null
          }
        },
        upsertMessage: async (message) => {
          if (options.store) {
            conversation[message.id] = message
            conversation.lastMessageId = message.id
            config.set(conversationKey, conversation)
          }
        }
      })

      const res = await api.sendMessage(prompt, {
        conversationId,
        parentMessageId,
        timeoutMs: options.timeout || undefined,
        onProgress: options.stream
          ? (progress) => {
              const { text } = progress.detail.choices[0]
              process.stdout.write(text)
            }
          : undefined
      })

      if (options.stream) {
        process.stdout.write('\n')
      } else {
        console.log(res.text)
      }
    })

  cli.command('rm-cache', 'Clears the local message cache').action(() => {
    config.clear()
    console.log('cleared cache', config.path)
  })

  cli.command('ls-cache', 'Prints the local message cache path').action(() => {
    console.log(config.path)
  })

  cli.help()
  cli.version(version)

  try {
    cli.parse()
  } catch (err) {
    console.error(`error: ${err.message}\n`)
    cli.outputHelp()
    process.exit(1)
  }
}

function hash(d) {
  const buffer = Buffer.isBuffer(d) ? d : Buffer.from(d.toString())
  return crypto.createHash('sha256').update(buffer).digest('hex')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
