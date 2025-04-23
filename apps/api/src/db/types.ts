import type { BuildQueryResult, ExtractTablesWithRelations } from 'drizzle-orm'

import type * as schema from './schema'

export type Tables = ExtractTablesWithRelations<typeof schema>

export type User = typeof schema.users.$inferSelect

export type Team = typeof schema.teams.$inferSelect
export type TeamWithMembers = BuildQueryResult<
  Tables,
  Tables['teams'],
  { with: { members: true } }
>

export type TeamMember = typeof schema.teamMembers.$inferSelect
export type TeamMemberWithTeam = BuildQueryResult<
  Tables,
  Tables['teamMembers'],
  { with: { team: true } }
>

export type Project = typeof schema.projects.$inferSelect
export type ProjectWithLastPublishedDeployment = BuildQueryResult<
  Tables,
  Tables['projects'],
  { with: { lastPublishedDeployment: true } }
>

export type Deployment = typeof schema.deployments.$inferSelect
export type DeploymentWithProject = BuildQueryResult<
  Tables,
  Tables['deployments'],
  { with: { project: true } }
>
