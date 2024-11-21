import { expect, test } from 'vitest'

import { type jigsawstack, JigsawStackClient } from './jigsawstack-client'

const jigsaw = new JigsawStackClient()

test.skip('should run successfully and return the search result', async () => {
  const params: jigsawstack.SearchParams = {
    query: 'The leaning tower of pisa',
    ai_overview: true,
    spell_check: true
  }
  const result = await jigsaw.aiSearch(params)
  expect(result).toBeTruthy()
  expect(result.success).toBe(true)
})

test.skip('should run successfully and return the valid sql result', async () => {
  const params: jigsawstack.TextToSqlParams = {
    sql_schema:
      "CREATE TABLE Transactions (transaction_id INT PRIMARY KEY, user_id INT NOT NULL,total_amount DECIMAL(10, 2 NOT NULL, transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,status VARCHAR(20) DEFAULT 'pending',FOREIGN KEY(user_id) REFERENCES Users(user_id))",
    prompt:
      'Generate a query to get transactions that amount exceed 10000 and sort by when created'
  }

  const result = await jigsaw.textToSql(params)
  expect(result).toBeTruthy()
  expect(result.success).toBe(true)
})

test.skip('should return result.success is true for successful vocr', async () => {
  const result = await jigsaw.vocr({
    prompt: 'Describe the image in detail',
    url: 'https://rogilvkqloanxtvjfrkm.supabase.co/storage/v1/object/public/demo/Collabo%201080x842.jpg?t=2024-03-22T09%3A22%3A48.442Z'
  })
  expect(result.success).toBe(true)
})

test('should run successfully and return the transcribe result', async () => {
  const data = await jigsaw.speechToText({
    url: 'https://rogilvkqloanxtvjfrkm.supabase.co/storage/v1/object/public/demo/Video%201737458382653833217.mp4?t=2024-03-22T09%3A50%3A49.894'
  })
  expect(data).toBeTruthy()
  expect(data.success).toBe(true)
})

test.skip('should run successfully and return scrape result', async () => {
  const params: jigsawstack.ScrapeParams = {
    url: 'https://jigsawstack.com/pricing',
    element_prompts: ['Pro Plan']
  }
  const result = await jigsaw.aiScrape(params)
  expect(result).toBeTruthy()
  expect(result.success).toBe(true)
})
