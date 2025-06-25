import path from 'node:path'
import { fileURLToPath } from 'node:url'

const fixtureNames = [
  // TODO: re-add these
  // 'basic-raw-free-ts',
  // 'basic-raw-free-json',
  // 'pricing-freemium',
  // 'pricing-pay-as-you-go',
  // 'pricing-3-plans',
  // 'pricing-monthly-annual',
  // 'pricing-custom-0',
  'basic-openapi',
  'basic-mcp',
  'everything-openapi'
]

const fixturesDir = path.join(
  fileURLToPath(import.meta.url),
  '..',
  '..',
  '..',
  '..',
  'packages',
  'fixtures'
)
const validFixturesDir = path.join(fixturesDir, 'valid')

export const fixtures = fixtureNames.map((name) =>
  path.join(validFixturesDir, name)
)
