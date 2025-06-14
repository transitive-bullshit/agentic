import { createRouter as createTanStackRouter } from '@tanstack/react-router'

import { NotFound } from './components/not-found'
import { bootstrap } from './lib/bootstrap'
import { routeTree } from './routeTree.gen'

export function createRouter() {
  bootstrap()

  const router = createTanStackRouter({
    routeTree,
    defaultPreload: 'intent',
    scrollRestoration: true,
    defaultNotFoundComponent: () => <NotFound />
  })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createRouter>
  }
}
