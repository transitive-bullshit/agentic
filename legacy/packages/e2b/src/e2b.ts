import { createAIFunction, getEnv } from '@agentic/core'
import { Sandbox } from '@e2b/code-interpreter'
import { z } from 'zod'

/**
 * E2B Python code interpreter sandbox.
 *
 * @see https://e2b.dev
 */
export const e2b = createAIFunction(
  {
    name: 'execute_python',
    description: `
Execute python code in a Jupyter notebook cell and returns any result, stdout, stderr, display_data, and error.

- code has access to the internet and can make api requests
- code has access to the filesystem and can read/write files
- coce can install any pip package (if it exists) if you need to, but the usual packages for data analysis are already preinstalled
- code uses python3
- code is executed in a secure sandbox environment, so you don't need to worry about safety
      `.trim(),
    inputSchema: z.object({
      code: z
        .string()
        .describe('Python code to execute in a single notebook cell.')
    })
  },
  async ({ code }) => {
    const sandbox = await Sandbox.create({
      apiKey: getEnv('E2B_API_KEY')
    })

    try {
      const exec = await sandbox.runCode(code, {
        onStderr: (msg) => {
          console.warn('[Code Interpreter stderr]', msg)
        },

        onStdout: (stdout) => {
          console.log('[Code Interpreter stdout]', stdout)
        }
      })

      if (exec.error) {
        console.error('[Code Interpreter error]', exec.error)
        throw new Error(exec.error.value)
      }

      return exec.results.map((result) => result.toJSON())
    } finally {
      await sandbox.kill()
    }
  }
)
