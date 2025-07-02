import type { DefaultHonoEnv } from '@agentic/platform-hono'
import { OpenAPIHono } from '@hono/zod-openapi'

import type { AuthenticatedHonoEnv } from '@/lib/types'
import * as middleware from '@/lib/middleware'
import { defaultHook, registerOpenAPIErrorResponses } from '@/lib/openapi-utils'

import { registerV1GitHubOAuthCallback } from './auth/github-callback'
import { registerV1GitHubOAuthExchange } from './auth/github-exchange'
import { registerV1GitHubOAuthInitFlow } from './auth/github-init'
import { registerV1SignInWithPassword } from './auth/sign-in-with-password'
import { registerV1SignUpWithPassword } from './auth/sign-up-with-password'
import { registerV1AdminActivateConsumer } from './consumers/admin-activate-consumer'
import { registerV1AdminGetConsumerByApiKey } from './consumers/admin-get-consumer-by-api-key'
import { registerV1CreateBillingPortalSession } from './consumers/create-billing-portal-session'
import { registerV1CreateConsumer } from './consumers/create-consumer'
import { registerV1CreateConsumerBillingPortalSession } from './consumers/create-consumer-billing-portal-session'
import { registerV1CreateConsumerCheckoutSession } from './consumers/create-consumer-checkout-session'
import { registerV1GetConsumer } from './consumers/get-consumer'
import { registerV1GetConsumerByProjectIdentifier } from './consumers/get-consumer-by-project-identifier'
import { registerV1ListConsumers } from './consumers/list-consumers'
import { registerV1ListConsumersForProject } from './consumers/list-project-consumers'
import { registerV1RefreshConsumerApiKey } from './consumers/refresh-consumer-api-key'
import { registerV1UpdateConsumer } from './consumers/update-consumer'
import { registerV1AdminGetDeploymentByIdentifier } from './deployments/admin-get-deployment-by-identifier'
import { registerV1CreateDeployment } from './deployments/create-deployment'
import { registerV1GetDeployment } from './deployments/get-deployment'
import { registerV1GetDeploymentByIdentifier } from './deployments/get-deployment-by-identifier'
import { registerV1GetPublicDeploymentByIdentifier } from './deployments/get-public-deployment-by-identifier'
import { registerV1ListDeployments } from './deployments/list-deployments'
import { registerV1PublishDeployment } from './deployments/publish-deployment'
import { registerV1UpdateDeployment } from './deployments/update-deployment'
import { registerHealthCheck } from './health-check'
import { registerV1CreateProject } from './projects/create-project'
import { registerV1GetProject } from './projects/get-project'
import { registerV1GetProjectByIdentifier } from './projects/get-project-by-identifier'
import { registerV1GetPublicProject } from './projects/get-public-project'
import { registerV1GetPublicProjectByIdentifier } from './projects/get-public-project-by-identifier'
import { registerV1ListProjects } from './projects/list-projects'
import { registerV1ListPublicProjects } from './projects/list-public-projects'
import { registerV1UpdateProject } from './projects/update-project'
import { registerV1GetSignedStorageUploadUrl } from './storage/get-signed-storage-upload-url'
import { registerV1CreateTeam } from './teams/create-team'
import { registerV1DeleteTeam } from './teams/delete-team'
import { registerV1GetTeam } from './teams/get-team'
import { registerV1ListTeams } from './teams/list-teams'
import { registerV1CreateTeamMember } from './teams/members/create-team-member'
import { registerV1DeleteTeamMember } from './teams/members/delete-team-member'
import { registerV1UpdateTeamMember } from './teams/members/update-team-member'
import { registerV1UpdateTeam } from './teams/update-team'
import { registerV1GetUser } from './users/get-user'
import { registerV1UpdateUser } from './users/update-user'
import { registerV1StripeWebhook } from './webhooks/stripe-webhook'

// Note that the order of some of these routes is important because of
// wildcards, so be careful when updating them or adding new routes.

export const apiV1 = new OpenAPIHono<DefaultHonoEnv>({ defaultHook })

apiV1.openAPIRegistry.registerComponent('securitySchemes', 'Bearer', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT'
})

registerOpenAPIErrorResponses(apiV1)

// Public routes
const publicRouter = new OpenAPIHono<DefaultHonoEnv>({ defaultHook })

// Private, authenticated routes
const privateRouter = new OpenAPIHono<AuthenticatedHonoEnv>({ defaultHook })

registerHealthCheck(publicRouter)

// Auth
registerV1SignInWithPassword(publicRouter)
registerV1SignUpWithPassword(publicRouter)
registerV1GitHubOAuthExchange(publicRouter)
registerV1GitHubOAuthInitFlow(publicRouter)
registerV1GitHubOAuthCallback(publicRouter)

// Users
registerV1GetUser(privateRouter)
registerV1UpdateUser(privateRouter)

// Teams
registerV1CreateTeam(privateRouter)
registerV1ListTeams(privateRouter)
registerV1GetTeam(privateRouter)
registerV1DeleteTeam(privateRouter)
registerV1UpdateTeam(privateRouter)

// Team members
registerV1CreateTeamMember(privateRouter)
registerV1UpdateTeamMember(privateRouter)
registerV1DeleteTeamMember(privateRouter)

// Storage
registerV1GetSignedStorageUploadUrl(privateRouter)

// Public projects
registerV1ListPublicProjects(publicRouter)
registerV1GetPublicProjectByIdentifier(publicRouter) // must be before `registerV1GetPublicProject`
registerV1GetPublicProject(publicRouter)

// Private projects
registerV1CreateProject(privateRouter)
registerV1ListProjects(privateRouter)
registerV1GetProjectByIdentifier(privateRouter) // must be before `registerV1GetProject`
registerV1GetProject(privateRouter)
registerV1UpdateProject(privateRouter)

// Consumers
registerV1GetConsumerByProjectIdentifier(privateRouter) // must be before `registerV1GetConsumer`
registerV1CreateBillingPortalSession(privateRouter)
registerV1GetConsumer(privateRouter)
registerV1CreateConsumer(privateRouter)
registerV1CreateConsumerCheckoutSession(privateRouter)
registerV1CreateConsumerBillingPortalSession(privateRouter)
registerV1UpdateConsumer(privateRouter)
registerV1RefreshConsumerApiKey(privateRouter)
registerV1ListConsumers(privateRouter)
registerV1ListConsumersForProject(privateRouter)

// Deployments
registerV1GetPublicDeploymentByIdentifier(publicRouter)
registerV1GetDeploymentByIdentifier(privateRouter) // must be before `registerV1GetDeployment`
registerV1GetDeployment(privateRouter)
registerV1CreateDeployment(privateRouter)
registerV1UpdateDeployment(privateRouter)
registerV1ListDeployments(privateRouter)
registerV1PublishDeployment(privateRouter)

// Internal admin routes
registerV1AdminGetConsumerByApiKey(privateRouter)
registerV1AdminActivateConsumer(privateRouter)
registerV1AdminGetDeploymentByIdentifier(privateRouter)

// Webhook event handlers
registerV1StripeWebhook(publicRouter)

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
