import 'dotenv/config'
import { OpenAIClient } from 'openai-fetch'
import { z } from 'zod'

import { Agentic, TaskStatus } from '@/index'

async function main() {
  const openai = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY! })
  const $ = new Agentic({ openai })

  const ai = $.gpt4(`generate fake data`).output(
    z.object({ foo: z.string(), bar: z.number() })
  )

  ai.eventEmitter.on(TaskStatus.COMPLETED, (event) => {
    console.log('Task completed successfully:', event)
  })

  ai.call()
}

main()
