import type {
  BuildQueryResult,
  ExtractTablesWithRelations
} from '@fisch0920/drizzle-orm'
import type { z } from '@hono/zod-openapi'

import type * as schema from './schema'

export type Tables = ExtractTablesWithRelations<typeof schema>

export type User = z.infer<typeof schema.userSelectSchema>

export type Team = z.infer<typeof schema.teamSelectSchema>
export type TeamWithMembers = BuildQueryResult<
  Tables,
  Tables['teams'],
  { with: { members: true } }
>

export type TeamMember = z.infer<typeof schema.teamMemberSelectSchema>
export type TeamMemberWithTeam = BuildQueryResult<
  Tables,
  Tables['teamMembers'],
  { with: { team: true } }
>

export type Project = z.infer<typeof schema.projectSelectSchema>
export type ProjectWithLastPublishedDeployment = BuildQueryResult<
  Tables,
  Tables['projects'],
  { with: { lastPublishedDeployment: true } }
>

export type Deployment = z.infer<typeof schema.deploymentSelectSchema>
export type DeploymentWithProject = BuildQueryResult<
  Tables,
  Tables['deployments'],
  { with: { project: true } }
>

export type Consumer = z.infer<typeof schema.consumerSelectSchema>
export type ConsumerWithProjectAndDeployment = BuildQueryResult<
  Tables,
  Tables['consumers'],
  { with: { project: true; deployment: true } }
>
