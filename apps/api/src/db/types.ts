import type {
  BuildQueryResult,
  ExtractTablesWithRelations,
  InferInsertModel,
  InferSelectModel
} from '@fisch0920/drizzle-orm'
import type { z } from '@hono/zod-openapi'

import type * as schema from './schema'

export type Tables = ExtractTablesWithRelations<typeof schema>

export type User = z.infer<typeof schema.userSelectSchema>
export type RawUser = InferSelectModel<typeof schema.users>

export type Team = z.infer<typeof schema.teamSelectSchema>
export type TeamWithMembers = BuildQueryResult<
  Tables,
  Tables['teams'],
  { with: { members: true } }
>
export type RawTeam = InferSelectModel<typeof schema.teams>

export type TeamMember = z.infer<typeof schema.teamMemberSelectSchema>
export type TeamMemberWithTeam = BuildQueryResult<
  Tables,
  Tables['teamMembers'],
  { with: { team: true } }
>
export type RawTeamMember = InferSelectModel<typeof schema.teamMembers>

export type Project = z.infer<typeof schema.projectSelectSchema>
export type ProjectWithLastPublishedDeployment = BuildQueryResult<
  Tables,
  Tables['projects'],
  { with: { lastPublishedDeployment: true } }
>
export type RawProject = InferSelectModel<typeof schema.projects>

export type Deployment = z.infer<typeof schema.deploymentSelectSchema>
export type DeploymentWithProject = BuildQueryResult<
  Tables,
  Tables['deployments'],
  { with: { project: true } }
>
export type RawDeployment = InferSelectModel<typeof schema.deployments>

export type Consumer = z.infer<typeof schema.consumerSelectSchema>
export type ConsumerWithProjectAndDeployment = BuildQueryResult<
  Tables,
  Tables['consumers'],
  { with: { project: true; deployment: true } }
>
export type RawConsumer = InferSelectModel<typeof schema.consumers>
export type ConsumerUpdate = Partial<
  Omit<
    InferInsertModel<typeof schema.consumers>,
    'id' | 'projectId' | 'userId' | 'deploymentId'
  >
>

export type LogEntry = z.infer<typeof schema.logEntrySelectSchema>
export type RawLogEntry = InferSelectModel<typeof schema.logEntries>
