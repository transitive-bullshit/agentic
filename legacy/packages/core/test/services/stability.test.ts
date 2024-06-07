import test from 'ava'

// import fs from 'fs/promises'
import { StabilityClient } from '@/services'

import { ky } from '../_utils'

const isStabilityTestingEnabled = false

test('StabilityClient.listEngines', async (t) => {
  if (!process.env.STABILITY_API_KEY || !isStabilityTestingEnabled) {
    return t.pass()
  }

  t.timeout(2 * 60 * 1000)
  const client = new StabilityClient({ ky })

  const result = await client.listEngines()
  // console.log(result)
  t.true(Array.isArray(result))
})

test('StabilityClient.textToImage string', async (t) => {
  if (!process.env.STABILITY_API_KEY || !isStabilityTestingEnabled) {
    return t.pass()
  }

  t.timeout(2 * 60 * 1000)
  const client = new StabilityClient({ ky })

  const result = await client.textToImage('tiny baby kittens, kawaii, anime')
  // console.log(result)

  t.is(result.artifacts.length, 1)
  t.truthy(result.artifacts[0].base64)
  t.is(result.artifacts[0].finishReason, 'SUCCESS')

  // await fs.writeFile(
  //   'out.png',
  //   Buffer.from(result.artifacts[0].base64, 'base64')
  // )
})

test('StabilityClient.textToImage full params', async (t) => {
  if (!process.env.STABILITY_API_KEY || !isStabilityTestingEnabled) {
    return t.pass()
  }

  t.timeout(2 * 60 * 1000)
  const client = new StabilityClient({ ky })

  const result = await client.textToImage({
    engineId: 'stable-diffusion-xl-beta-v2-2-2',
    textPrompts: [{ text: 'smol kittens, kawaii, cute, anime' }],
    width: 512,
    height: 512,
    cfgScale: 7,
    clipGuidancePreset: 'FAST_BLUE',
    stylePreset: 'anime',
    samples: 1,
    steps: 30
  })
  // console.log(result)

  t.is(result.artifacts.length, 1)
  t.truthy(result.artifacts[0].base64)
  t.is(result.artifacts[0].finishReason, 'SUCCESS')

  // await fs.writeFile(
  //   'out.png',
  //   Buffer.from(result.artifacts[0].base64, 'base64')
  // )
})
