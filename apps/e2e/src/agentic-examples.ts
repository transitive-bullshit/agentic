import path from 'node:path'
import { fileURLToPath } from 'node:url'

const exampleProjectNames = ['search']

const examplesDir = path.join(
  fileURLToPath(import.meta.url),
  '..',
  '..',
  '..',
  '..',
  'examples',
  'mcp-servers'
)

export const examples = exampleProjectNames.map((name) =>
  path.join(examplesDir, name)
)
