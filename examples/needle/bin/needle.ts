import 'dotenv/config'

import { NeedleClient } from '@agentic/needle'
import OpenAI from 'openai'

async function main() {
  const needle = new NeedleClient()
  const openai = new OpenAI()
  let collectionId: string | undefined

  const messages: OpenAI.ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content:
        'You are a helpful assistant. Only use the information provided in the search results to answer questions. Do not make assumptions or add information from other sources.'
    },
    {
      role: 'user',
      content:
        'Create a collection for Needle documentation and add the Needle website (needle-ai.com) to it, then search for what Needle is.'
    }
  ]

  // First call to create collection
  {
    const res = await openai.chat.completions.create({
      messages,
      model: 'gpt-4o-mini',
      temperature: 0,
      tools: needle.collections.functions.toolSpecs,
      tool_choice: 'required'
    })
    const message = res.choices[0]?.message!
    console.log('Create collection response')

    messages.push(message)

    // Handle all tool calls in order
    for (const toolCall of message.tool_calls || []) {
      if (toolCall.function.name === 'create_collection') {
        const fn = needle.collections.functions.get(toolCall.function.name)!
        const result = await fn(toolCall.function.arguments)
        console.log('Collection created')
        collectionId = result.id
        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(result)
        })
      } else if (toolCall.function.name === 'search_collection') {
        // Search will fail since collection isn't indexed yet, return empty results
        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify({ results: [] })
        })
      }
    }
  }

  // Second call to add file
  {
    const res = await openai.chat.completions.create({
      messages,
      model: 'gpt-4o-mini',
      temperature: 0,
      tools: needle.collections.functions.toolSpecs,
      tool_choice: 'required'
    })
    const message = res.choices[0]?.message!
    console.log('Add file')

    messages.push(message)

    // Handle add file
    const addFileCall = message.tool_calls?.find(
      (call) => call.function.name === 'add_file'
    )
    if (addFileCall) {
      const fn = needle.collections.functions.get(addFileCall.function.name)!
      // Ensure the collection ID is correct
      const params = JSON.parse(addFileCall.function.arguments)
      params.collection_id = collectionId
      params.files = [{ url: 'https://needle-ai.com', name: 'Needle Website' }]
      const result = await fn(JSON.stringify(params))
      console.log('Files added')
      messages.push({
        role: 'tool',
        tool_call_id: addFileCall.id,
        content: JSON.stringify(result)
      })
    }

    console.log('Waiting 20 seconds for file indexing...')
    await new Promise((resolve) => setTimeout(resolve, 20_000))
  }

  // Third call to search
  {
    const res = await openai.chat.completions.create({
      messages,
      model: 'gpt-4o-mini',
      temperature: 0,
      tools: needle.collections.functions.toolSpecs,
      tool_choice: 'required'
    })
    const message = res.choices[0]?.message!
    console.log('Search response')

    messages.push(message)

    // Handle search
    const searchCall = message.tool_calls?.find(
      (call) => call.function.name === 'search_collection'
    )
    if (searchCall) {
      const fn = needle.collections.functions.get(searchCall.function.name)!
      // Ensure the collection ID is correct
      const params = JSON.parse(searchCall.function.arguments)
      params.collection_id = collectionId
      const result = await fn(JSON.stringify(params))
      console.log('Search results')
      messages.push({
        role: 'tool',
        tool_call_id: searchCall.id,
        content: JSON.stringify(result)
      })
    }
  }

  // Final call to summarize results
  {
    messages.push({
      role: 'user',
      content:
        'Based ONLY on the search results above, what is Needle? If there are no results yet, please say so.'
    })

    const res = await openai.chat.completions.create({
      messages,
      model: 'gpt-4o-mini',
      temperature: 0,
      tools: needle.collections.functions.toolSpecs
    })
    const message = res.choices?.[0]?.message

    console.log('\n=== AI Summary ===')
    if (message?.content) {
      console.log('\n' + message.content + '\n')
    } else {
      console.log('\nNo content in response\n')
    }
  }
}

await main()
