import dotenv from 'dotenv-safe'
import { OpenAIClient } from 'openai-fetch'
import { z } from 'zod'
import { fromZodError } from 'zod-validation-error'

dotenv.config()

interface Temp {
  contentType: string
}

async function main() {
  const openai = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY })

  const outputSchema = z.object({})

  const res = await openai.createChatCompletion({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: ''
      }
    ]
  })

  const out = await infer('give me a single boolean value', z.boolean(), {})
}

async function infer<T = any>(
  prompt: string,
  schema: z.ZodType<T>,
  { retry }
): Promise<T> {}

main().catch((err) => {
  console.error('error', err)
  process.exit(1)
})
