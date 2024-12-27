import 'dotenv/config'

import { readFileSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { NeedleClient } from './needle-client'

// Helper to wait between operations
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Load API key from .env file
const envPath = path.join(process.cwd(), '../../.env')
const envContent = readFileSync(envPath, 'utf8')
const apiKey = envContent.match(/NEEDLE_API_KEY=(.+)/)?.[1]

describe('NeedleClient', () => {
  it('should be instantiable', () => {
    const client = new NeedleClient({
      apiKey: 'test-key'
    })
    expect(client).toBeInstanceOf(NeedleClient)
  })

  it('should throw if apiKey is missing', () => {
    expect(() => {
      new NeedleClient({
        apiKey: undefined
      })
    }).toThrow('NeedleClient missing required "apiKey"')
  })

  describe('collections integration', () => {
    const client = apiKey ? new NeedleClient({ apiKey }) : null
    let collectionId: string

    it.runIf(!!apiKey)('should create a new collection', async () => {
      if (!client) throw new Error('Client not initialized')
      const result = await client.collections.create({
        name: 'Test Collection',
        description: 'A test collection for integration testing'
      })
      console.log('Create collection result:', result)
      expect(result).toBeTruthy()
      expect(result.id).toBeTruthy()
      expect(result.name).toBe('Test Collection')
      collectionId = result.id

      // Wait for collection to be fully created
      await delay(2000)
    })

    it.runIf(!!apiKey)('should add the Needle website as a file', async () => {
      if (!client) throw new Error('Client not initialized')
      expect(collectionId).toBeTruthy() // Ensure we have a valid collection ID
      const result = await client.collections.addFile({
        collection_id: collectionId,
        files: [
          {
            url: 'https://needle-ai.com',
            name: 'Needle Website'
          }
        ]
      })
      expect(result).toBeTruthy()
      expect(Array.isArray(result)).toBe(true)
      expect(result[0]?.id).toBeTruthy()

      // Wait for file to be processed
      await delay(2000)
    })

    it.runIf(!!apiKey)('should search the collection', async () => {
      if (!client) throw new Error('Client not initialized')
      expect(collectionId).toBeTruthy() // Ensure we have a valid collection ID
      const results = await client.collections.search({
        collection_id: collectionId,
        text: 'Tell me about the data in the Needle Website'
      })
      expect(results).toBeTruthy()
      expect(Array.isArray(results)).toBe(true)
    })

    it.runIf(!!apiKey)('should list collections', async () => {
      if (!client) throw new Error('Client not initialized')
      expect(collectionId).toBeTruthy() // Ensure we have a valid collection ID
      const result = await client.collections.list()
      console.log('List collections result:', result)
      expect(result).toBeTruthy()
      expect(Array.isArray(result)).toBe(true)
      expect(result.some((c) => c.id === collectionId)).toBe(true)
    })
  })
})
