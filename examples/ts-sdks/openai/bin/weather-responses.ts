import 'dotenv/config'

import { assert } from '@agentic/core'
import { AgenticToolClient } from '@agentic/platform-tool-client'
import OpenAI from 'openai'

async function main() {
  const searchTool = await AgenticToolClient.fromIdentifier('@agentic/search')
  const openai = new OpenAI()

  const messages: OpenAI.Responses.ResponseInput = [
    {
      role: 'system',
      content: 'You are a helpful assistant. Be as concise as possible.'
    },
    { role: 'user', content: 'What is the weather in San Francisco?' }
  ]

  {
    // First call to OpenAI to invoke the tool
    const res = await openai.responses.create({
      model: 'gpt-4o-mini',
      temperature: 0,
      tools: searchTool.functions.responsesToolSpecs,
      tool_choice: 'required',
      input: messages
    })

    const toolCall = res.output[0]
    assert(toolCall?.type === 'function_call')
    const toolResult = await searchTool.callTool(
      toolCall.name,
      toolCall.arguments
    )

    messages.push(toolCall)
    messages.push({
      type: 'function_call_output',
      call_id: toolCall.call_id,
      output: JSON.stringify(toolResult)
    })
  }

  console.log()

  {
    // Second call to OpenAI to generate a text response
    const res = await openai.responses.create({
      model: 'gpt-4o-mini',
      temperature: 0,
      tools: searchTool.functions.responsesToolSpecs,
      input: messages
    })

    console.log(res.output_text)
  }
}

await main()
