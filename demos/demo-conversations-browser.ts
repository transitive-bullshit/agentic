import dotenv from 'dotenv-safe'
import ora, { oraPromise } from 'ora'

import { ChatGPTAPIBrowser } from '../src'

dotenv.config()

/**
 * Demo CLI for testing conversation list support, and creation + deletion
 *
 * ```
 * npx tsx demos/demo-conversations-browser.ts
 * ```
 */
async function main() {
  const email = process.env.OPENAI_EMAIL
  const password = process.env.OPENAI_PASSWORD

  const api = new ChatGPTAPIBrowser({
    email,
    password,
    debug: false,
    minimize: true
  })
  await api.initSession()

  const conversations = await oraPromise(api.getConversations(), {
    text: 'Fetching active conversations'
  })

  console.log(conversations, `${conversations.total} active conversations`)

  var success = await oraPromise(api.deleteAllConversations(), {
    text: 'Deleting all conversations'
  })

  console.log('Could delete all conversations:', success)

  let res = await oraPromise(api.sendMessage('how are you'), {
    text: 'Creating example conversation'
  })

  console.log('ChatGPT response:', res.response, res.conversationId)

  let title = await oraPromise(
    api.generateConversationTitle(res.conversationId, res.messageId),
    {
      text: 'Generating conversation title'
    }
  )

  console.log('ChatGPT generated title:', title)

  var success = await oraPromise(api.deleteConversation(res.conversationId), {
    text: 'Deleting the conversation'
  })

  console.log('Could delete the conversation:', success)

  // close the browser at the end
  await api.closeSession()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
