import { OpenAPIHono } from '@hono/zod-openapi'

import type { AuthenticatedEnv } from '@/lib/types'
import * as middleware from '@/lib/middleware'

import { registerHealthCheck } from './health-check'
import { registerV1ProjectsGetProject } from './projects/get-project'
import { registerV1ProjectsListProjects } from './projects/list-projects'
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

export const apiV1 = new OpenAPIHono()

// Public routes
const pub = new OpenAPIHono()

// Private, authenticated routes
const pri = new OpenAPIHono<AuthenticatedEnv>()

registerHealthCheck(pub)

// Users crud
registerV1UsersGetUser(pri)
registerV1UsersUpdateUser(pri)

// Teams crud
registerV1TeamsCreateTeam(pri)
registerV1TeamsListTeams(pri)
registerV1TeamsGetTeam(pri)
registerV1TeamsDeleteTeam(pri)
registerV1TeamsUpdateTeam(pri)

// Team members crud
registerV1TeamsMembersCreateTeamMember(pri)
registerV1TeamsMembersUpdateTeamMember(pri)
registerV1TeamsMembersDeleteTeamMember(pri)

// Projects crud
registerV1ProjectsGetProject(pri)
registerV1ProjectsListProjects(pri)

// Setup routes and middleware
apiV1.route('/', pub)
apiV1.use(middleware.authenticate)
apiV1.use(middleware.team)
apiV1.use(middleware.me)
apiV1.route('/', pri)
