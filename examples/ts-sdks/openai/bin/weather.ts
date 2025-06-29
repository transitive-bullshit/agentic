import 'dotenv/config'

import { AgenticToolClient } from '@agentic/platform-tool-client'
import OpenAI from 'openai'

async function main() {
  const searchTool = await AgenticToolClient.fromIdentifier('@agentic/search')
  const openai = new OpenAI()

  const messages: OpenAI.ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: 'You are a helpful assistant. Be as concise as possible.'
    },
    { role: 'user', content: 'What is the weather in San Francisco?' }
  ]

  {
    // First call to OpenAI to invoke the tool
    const res = await openai.chat.completions.create({
      messages,
      model: 'gpt-4o-mini',
      temperature: 0,
      tools: searchTool.functions.toolSpecs,
      tool_choice: 'required'
    })

    const message = res.choices[0]!.message!
    const toolCall = message.tool_calls![0]!.function!
    const toolResult = await searchTool.callTool(
      toolCall.name,
      toolCall.arguments
    )

    messages.push(message)
    messages.push({
      role: 'tool',
      tool_call_id: message.tool_calls![0]!.id,
      content: JSON.stringify(toolResult)
    })
  }

  {
    // Second call to OpenAI to generate a text response
    const res = await openai.chat.completions.create({
      messages,
      model: 'gpt-4o-mini',
      temperature: 0,
      tools: searchTool.functions.toolSpecs
    })
    const message = res.choices?.[0]?.message
    console.log(message?.content)
  }
}

await main()
