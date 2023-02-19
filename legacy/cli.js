#!/usr/bin/env node

import { ChatGPTAPI } from './build/index.js'

const input = process.argv[2]

if (!input) {
  console.log('Usage: chatgpt "input prompt"')
  process.exit()
}

const api = new ChatGPTAPI({ apiKey: process.env.OPENAI_API_KEY })
const res = await api.sendMessage(input)
process.stdout.write(res.text)
