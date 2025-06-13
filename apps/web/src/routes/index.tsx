import * as fs from 'node:fs/promises'

import { createFileRoute, useRouter } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'

const filePath = 'count.txt'

async function readCount() {
  return Number.parseInt(await fs.readFile(filePath, 'utf8').catch(() => '0'))
}

const getCount = createServerFn({
  method: 'GET'
}).handler(() => {
  return readCount()
})

const updateCount = createServerFn({ method: 'POST' })
  .validator((d: number) => d)
  .handler(async ({ data }) => {
    const count = await readCount()
    await fs.writeFile(filePath, `${count + data}`)
  })

export const Route = createFileRoute('/')({
  component: Home,
  loader: async () => getCount()
})

function Home() {
  const router = useRouter()
  const state = Route.useLoaderData()

  return (
    <button
      type='button'
      onClick={() => {
        void updateCount({ data: 1 }).then(() => {
          return router.invalidate()
        })
      }}
    >
      Add 1 to {state}?
    </button>
  )
}
