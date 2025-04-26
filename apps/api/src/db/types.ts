import type { z } from '@hono/zod-openapi'
import type { BuildQueryResult, ExtractTablesWithRelations } from 'drizzle-orm'

import type * as schema from './schema'

export type Tables = ExtractTablesWithRelations<typeof schema>

export type User = z.infer<typeof schema.userSelectSchema>

// export type User2 = typeof schema.users.$inferSelect
// export type User3 = NullToUndefinedDeep<typeof schema.users.$inferSelect>

export type Team = z.infer<typeof schema.teamSelectSchema>
export type TeamWithMembers = NullToUndefinedDeep<
  BuildQueryResult<Tables, Tables['teams'], { with: { members: true } }>
>

export type TeamMember = z.infer<typeof schema.teamMemberSelectSchema>
export type TeamMemberWithTeam = NullToUndefinedDeep<
  BuildQueryResult<Tables, Tables['teamMembers'], { with: { team: true } }>
>

export type Project = z.infer<typeof schema.projectSelectSchema>
export type ProjectWithLastPublishedDeployment = NullToUndefinedDeep<
  BuildQueryResult<
    Tables,
    Tables['projects'],
    { with: { lastPublishedDeployment: true } }
  >
>

export type Deployment = z.infer<typeof schema.deploymentSelectSchema>
export type DeploymentWithProject = NullToUndefinedDeep<
  BuildQueryResult<Tables, Tables['deployments'], { with: { project: true } }>
>

export type NullToUndefinedDeep<T> = T extends null
  ? undefined
  : T extends Date
    ? T
    : T extends readonly (infer U)[]
      ? NullToUndefinedDeep<U>[]
      : T extends object
        ? { [K in keyof T]: NullToUndefinedDeep<T[K]> }
        : T
