import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'
import { expect, test } from 'vitest'

import { createAISDKTools } from '../../ai-sdk'
import { JigsawStackClient } from './jigsawstack-client'

// Do ensure to set your JIGSAWSTACK_API_KEY environment variable.

const jigsaw = new JigsawStackClient({ timeoutMs: 30_000 })

test.skip('should run successfully and return search result', async () => {
  const { toolResults } = await generateText({
    model: openai('gpt-4o-mini'),
    tools: createAISDKTools(jigsaw),
    toolChoice: 'required',
    prompt: 'Tell me about "Santorini"'
  })

  // console.log(toolResults, 'toolResults')
  expect(toolResults[0]).toBeTruthy()
})

test.skip('should scrape url successfully and return result', async () => {
  const { toolResults } = await generateText({
    model: openai('gpt-4o-mini'),
    tools: createAISDKTools(jigsaw),
    toolChoice: 'required',
    prompt: 'Scrape https://jigsawstack.com and tell me their title'
  })

  // console.log(toolResults[0], 'toolResults')
  expect(toolResults[0]).toBeTruthy()
})

test.skip('should perform vision based OCR and return result', async () => {
  const { toolResults } = await generateText({
    model: openai('gpt-4o-mini'),
    tools: createAISDKTools(jigsaw),
    toolChoice: 'required',
    prompt:
      'Tell me about this image : https://rogilvkqloanxtvjfrkm.supabase.co/storage/v1/object/public/demo/Collabo%201080x842.jpg?t=2024-03-22T09%3A22%3A48.442Z'
  })
  // console.log(toolResults[0], 'toolResults')
  expect(toolResults[0]).toBeTruthy()
})

test.skip('should perform speech to text  and return result', async () => {
  const { toolResults } = await generateText({
    model: openai('gpt-4o-mini'),
    tools: createAISDKTools(jigsaw),
    toolChoice: 'required',
    prompt:
      'Get the transcription from this video url : https://rogilvkqloanxtvjfrkm.supabase.co/storage/v1/object/public/demo/Video%201737458382653833217.mp4?t=2024-03-22T09%3A50%3A49.894Z'
  })
  // console.log(toolResults[0], 'toolResults')
  expect(toolResults[0]).toBeTruthy()
})

test('should perform text to sql and return result', async () => {
  const prompt = `
  Generate a query to get transactions that amount exceed 10000 and sort by when created. Given this schema:
    "CREATE TABLE Transactions (transaction_id INT PRIMARY KEY, user_id INT NOT NULL,total_amount DECIMAL(10, 2 NOT NULL, transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,status VARCHAR(20) DEFAULT 'pending',FOREIGN KEY(user_id) REFERENCES Users(user_id))"`
  const { toolResults } = await generateText({
    model: openai('gpt-4o-mini'),
    tools: createAISDKTools(jigsaw),
    toolChoice: 'required',
    prompt
  })
  expect(toolResults[0]).toBeTruthy()
})
