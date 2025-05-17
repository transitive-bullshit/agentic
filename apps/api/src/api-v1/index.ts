import { OpenAPIHono } from '@hono/zod-openapi'
import { fromError } from 'zod-validation-error'

import type { AuthenticatedEnv } from '@/lib/types'
import * as middleware from '@/lib/middleware'

import { registerV1AdminConsumersGetConsumerByToken } from './consumers/admin-get-consumer-by-token'
import { registerV1ConsumersGetConsumer } from './consumers/get-consumer'
import { registerHealthCheck } from './health-check'
import { registerV1ProjectsCreateProject } from './projects/create-project'
import { registerV1ProjectsGetProject } from './projects/get-project'
import { registerV1ProjectsListProjects } from './projects/list-projects'
import { registerV1ProjectsUpdateProject } from './projects/update-project'
import { registerV1TeamsCreateTeam } from './teams/create-team'
import { registerV1TeamsDeleteTeam } from './teams/delete-team'
import { registerV1TeamsGetTeam } from './teams/get-team'
import { registerV1TeamsListTeams } from './teams/list-teams'
import { registerV1TeamsMembersCreateTeamMember } from './teams/members/create-team-member'
import { registerV1TeamsMembersDeleteTeamMember } from './teams/members/delete-team-member'
import { registerV1TeamsMembersUpdateTeamMember } from './teams/members/update-team-member'
import { registerV1TeamsUpdateTeam } from './teams/update-team'
import { registerV1UsersGetUser } from './users/get-user'
import { registerV1UsersUpdateUser } from './users/update-user'
import { registerV1StripeWebhook } from './webhooks/stripe-webhook'

export const apiV1 = new OpenAPIHono({
  defaultHook: (result, ctx) => {
    if (!result.success) {
      return ctx.json(
        {
          error: fromError(result.error).toString()
        },
        400
      )
    }
  }
})

apiV1.openAPIRegistry.registerComponent('securitySchemes', 'Bearer', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT'
})

// Public routes
const publicRouter = new OpenAPIHono()

// Private, authenticated routes
const privateRouter = new OpenAPIHono<AuthenticatedEnv>()

registerHealthCheck(publicRouter)

// Users crud
registerV1UsersGetUser(privateRouter)
registerV1UsersUpdateUser(privateRouter)

// Teams crud
registerV1TeamsCreateTeam(privateRouter)
registerV1TeamsListTeams(privateRouter)
registerV1TeamsGetTeam(privateRouter)
registerV1TeamsDeleteTeam(privateRouter)
registerV1TeamsUpdateTeam(privateRouter)

// Team members crud
registerV1TeamsMembersCreateTeamMember(privateRouter)
registerV1TeamsMembersUpdateTeamMember(privateRouter)
registerV1TeamsMembersDeleteTeamMember(privateRouter)

// Projects crud
registerV1ProjectsCreateProject(privateRouter)
registerV1ProjectsListProjects(privateRouter)
registerV1ProjectsGetProject(privateRouter)
registerV1ProjectsUpdateProject(privateRouter)

// TODO
// pub.get('/projects/alias/:alias(.+)', require('./projects').readByAlias)
// pri.get('/projects/provider/:project(.+)', require('./provider').read)
// pri.put('/projects/provider/:project(.+)', require('./provider').update)
// pri.put('/projects/connect/:project(.+)', require('./projects').connect)
// pub.get(
//   '/projects/:project(.+)',
//   middleware.authenticate({ passthrough: true }),
//   require('./projects').read
// )

// Consumers crud
registerV1ConsumersGetConsumer(privateRouter)

// Webhook event handlers
registerV1StripeWebhook(publicRouter)

// Admin routes
registerV1AdminConsumersGetConsumerByToken(privateRouter)

// Setup routes and middleware
apiV1.route('/', publicRouter)
apiV1.use(middleware.authenticate)
apiV1.use(middleware.team)
apiV1.use(middleware.me)
apiV1.route('/', privateRouter)

// API route types to be used by Hono's RPC client.
// Should include all routes except for internal and admin routes.
export type ApiRoutes =
  | ReturnType<typeof registerHealthCheck>
  // Users
  | ReturnType<typeof registerV1UsersGetUser>
  | ReturnType<typeof registerV1UsersUpdateUser>
  // Teams
  | ReturnType<typeof registerV1TeamsCreateTeam>
  | ReturnType<typeof registerV1TeamsListTeams>
  | ReturnType<typeof registerV1TeamsGetTeam>
  | ReturnType<typeof registerV1TeamsDeleteTeam>
  | ReturnType<typeof registerV1TeamsUpdateTeam>
  // Team members
  | ReturnType<typeof registerV1TeamsMembersCreateTeamMember>
  | ReturnType<typeof registerV1TeamsMembersUpdateTeamMember>
  | ReturnType<typeof registerV1TeamsMembersDeleteTeamMember>
  // Projects
  | ReturnType<typeof registerV1ProjectsCreateProject>
  | ReturnType<typeof registerV1ProjectsListProjects>
  | ReturnType<typeof registerV1ProjectsGetProject>
  | ReturnType<typeof registerV1ProjectsUpdateProject>
  // Consumers
  | ReturnType<typeof registerV1ConsumersGetConsumer>
