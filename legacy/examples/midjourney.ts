import { Midjourney } from '@agentic/midjourney-fetch'
import 'dotenv/config'
import { OpenAIClient } from 'openai-fetch'
import { z } from 'zod'

import { Agentic, MidjourneyImagineTool } from '@/index'

async function main() {
  const openai = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY! })
  const agentic = new Agentic({ openai })
  console.log({
    channelId: process.env.MIDJOURNEY_CHANNEL_ID!,
    serverId: process.env.MIDJOURNEY_SERVER_ID!,
    token: process.env.MIDJOURNEY_TOKEN!
    // applicationId: process.env.MIDJOURNEY_APPLICATION_ID!,
    // version: process.env.MIDJOURNEY_VERSION!,
    // id: process.env.MIDJOURNEY_ID!
  })
  const midjourney = new Midjourney({
    channelId: process.env.MIDJOURNEY_CHANNEL_ID!,
    serverId: process.env.MIDJOURNEY_SERVER_ID!,
    token: process.env.MIDJOURNEY_TOKEN!
    // applicationId: process.env.MIDJOURNEY_APPLICATION_ID!,
    // version: process.env.MIDJOURNEY_VERSION!,
    // id: process.env.MIDJOURNEY_ID!
  })

  const topic = process.argv[2] || 'san francisco'

  const res = await agentic
    .gpt3(`Generate 2 creative images of {{topic}}`)
    .modelParams({ temperature: 1.0 })
    .tools([new MidjourneyImagineTool({ midjourney })])
    .input(
      z.object({
        topic: z.string()
      })
    )
    .call({
      topic
    })

  console.log(`\n\n\n${res}\n\n\n`)
}

main()
