import { OpenAPIHono } from '@hono/zod-openapi'
import { fromError } from 'zod-validation-error'

import type { AuthenticatedEnv } from '@/lib/types'
import { auth } from '@/lib/auth'
import * as middleware from '@/lib/middleware'
import { registerOpenAPIErrorResponses } from '@/lib/openapi-utils'

import { registerV1AdminConsumersGetConsumerByToken } from './consumers/admin-get-consumer-by-token'
import { registerV1ConsumersCreateConsumer } from './consumers/create-consumer'
import { registerV1ConsumersGetConsumer } from './consumers/get-consumer'
import { registerV1ProjectsListConsumers } from './consumers/list-consumers'
import { registerV1ConsumersRefreshConsumerToken } from './consumers/refresh-consumer-token'
import { registerV1ConsumersUpdateConsumer } from './consumers/update-consumer'
import { registerV1DeploymentsCreateDeployment } from './deployments/create-deployment'
import { registerV1DeploymentsGetDeployment } from './deployments/get-deployment'
import { registerV1DeploymentsListDeployments } from './deployments/list-deployments'
import { registerV1DeploymentsPublishDeployment } from './deployments/publish-deployment'
import { registerV1DeploymentsUpdateDeployment } from './deployments/update-deployment'
import { registerHealthCheck } from './health-check'
// import { registerV1OAuthRedirect } from './oauth-redirect'
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

registerOpenAPIErrorResponses(apiV1)

// Public routes
const publicRouter = new OpenAPIHono()

// Private, authenticated routes
const privateRouter = new OpenAPIHono<AuthenticatedEnv>()

registerHealthCheck(publicRouter)

// Users
registerV1UsersGetUser(privateRouter)
registerV1UsersUpdateUser(privateRouter)

// Teams
registerV1TeamsCreateTeam(privateRouter)
registerV1TeamsListTeams(privateRouter)
registerV1TeamsGetTeam(privateRouter)
registerV1TeamsDeleteTeam(privateRouter)
registerV1TeamsUpdateTeam(privateRouter)

// Team members
registerV1TeamsMembersCreateTeamMember(privateRouter)
registerV1TeamsMembersUpdateTeamMember(privateRouter)
registerV1TeamsMembersDeleteTeamMember(privateRouter)

// Projects
registerV1ProjectsCreateProject(privateRouter)
registerV1ProjectsListProjects(privateRouter)
registerV1ProjectsGetProject(privateRouter)
registerV1ProjectsUpdateProject(privateRouter)

// Consumers
registerV1ConsumersGetConsumer(privateRouter)
registerV1ConsumersCreateConsumer(privateRouter)
registerV1ConsumersUpdateConsumer(privateRouter)
registerV1ConsumersRefreshConsumerToken(privateRouter)
registerV1ProjectsListConsumers(privateRouter)

// Deployments
registerV1DeploymentsGetDeployment(privateRouter)
registerV1DeploymentsCreateDeployment(privateRouter)
registerV1DeploymentsUpdateDeployment(privateRouter)
registerV1DeploymentsListDeployments(privateRouter)
registerV1DeploymentsPublishDeployment(privateRouter)

// Internal admin routes
registerV1AdminConsumersGetConsumerByToken(privateRouter)

// Webhook event handlers
registerV1StripeWebhook(publicRouter)

// OAuth redirect
// registerV1OAuthRedirect(publicRouter)

publicRouter.on(['POST', 'GET'], 'auth/**', (c) => auth.handler(c.req.raw))

// Setup routes and middleware
apiV1.route('/', publicRouter)
apiV1.use(middleware.authenticate)
apiV1.use(middleware.team)
apiV1.use(middleware.me)
apiV1.route('/', privateRouter)

// API route types to be used by Hono's RPC client.
// Should include all routes except for internal and admin routes.
// NOTE: Removing for now because Hono's RPC client / types are clunky and slow.
// export type ApiRoutes =
//   | ReturnType<typeof registerHealthCheck>
//   // Users
//   | ReturnType<typeof registerV1UsersGetUser>
//   | ReturnType<typeof registerV1UsersUpdateUser>
//   // Teams
//   | ReturnType<typeof registerV1TeamsCreateTeam>
//   | ReturnType<typeof registerV1TeamsListTeams>
//   | ReturnType<typeof registerV1TeamsGetTeam>
//   | ReturnType<typeof registerV1TeamsDeleteTeam>
//   | ReturnType<typeof registerV1TeamsUpdateTeam>
//   // Team members
//   | ReturnType<typeof registerV1TeamsMembersCreateTeamMember>
//   | ReturnType<typeof registerV1TeamsMembersUpdateTeamMember>
//   | ReturnType<typeof registerV1TeamsMembersDeleteTeamMember>
//   // Projects
//   | ReturnType<typeof registerV1ProjectsCreateProject>
//   | ReturnType<typeof registerV1ProjectsListProjects>
//   | ReturnType<typeof registerV1ProjectsGetProject>
//   | ReturnType<typeof registerV1ProjectsUpdateProject>
//   // Consumers
//   | ReturnType<typeof registerV1ConsumersGetConsumer>
//   | ReturnType<typeof registerV1ConsumersCreateConsumer>
//   | ReturnType<typeof registerV1ConsumersUpdateConsumer>
//   | ReturnType<typeof registerV1ConsumersRefreshConsumerToken>
//   | ReturnType<typeof registerV1ProjectsListConsumers>
//   // Deployments
//   | ReturnType<typeof registerV1DeploymentsGetDeployment>
//   | ReturnType<typeof registerV1DeploymentsCreateDeployment>
//   | ReturnType<typeof registerV1DeploymentsUpdateDeployment>
//   | ReturnType<typeof registerV1DeploymentsListDeployments>
//   | ReturnType<typeof registerV1DeploymentsPublishDeployment>
