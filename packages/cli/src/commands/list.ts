import type { Deployment } from '@agentic/platform-api-client'
import { parseFaasIdentifier } from '@agentic/platform-validators'
import { Command } from 'commander'
import { oraPromise } from 'ora'

import type { Context } from '../types'
import { AuthStore } from '../lib/auth-store'
import { pruneDeployment } from '../lib/utils'

export function registerListDeploymentsCommand({
  client,
  program,
  logger
}: Context) {
  const command = new Command('list')
    .alias('ls')
    .description('Lists deployments.')
    .argument('[projectIdentifier]', 'Optional project identifier')
    .option('-v, --verbose', 'Display full deployments', false)
    .action(async (projectIdentifier, opts) => {
      AuthStore.requireAuth()

      const query: Parameters<typeof client.listDeployments>[0] = {}
      let label = 'Fetching all projects and deployments'

      if (projectIdentifier) {
        const auth = AuthStore.getAuth()
        const parsedFaas = parseFaasIdentifier(projectIdentifier, {
          // TODO: use team slug if available
          namespace: auth.user.username
        })

        if (!parsedFaas) {
          throw new Error(`Invalid project identifier "${projectIdentifier}"`)
        }

        if (parsedFaas.deploymentIdentifier) {
          query.deploymentIdentifier = parsedFaas.deploymentIdentifier
          label = `Fetching deployment "${query.deploymentIdentifier}"`
        } else {
          query.projectIdentifier = parsedFaas.projectIdentifier
          label = `Fetching deployments for project "${query.projectIdentifier}"`
        }
      }

      const deployments = await oraPromise(client.listDeployments(query), label)

      const projectIdToDeploymentsMap: Record<string, Deployment[]> = {}
      const sortedProjects: {
        projectId: string
        deployments: Deployment[]
      }[] = []

      // Aggregate deployments by project
      for (const deployment of deployments) {
        const prunedDeployment = pruneDeployment(deployment, opts)

        const { projectId } = deployment
        if (!projectIdToDeploymentsMap[projectId]) {
          projectIdToDeploymentsMap[projectId] = []
        }

        projectIdToDeploymentsMap[projectId].push(prunedDeployment)
      }

      // Sort deployments within each project with recently created first
      for (const projectId of Object.keys(projectIdToDeploymentsMap)) {
        const deployments = projectIdToDeploymentsMap[projectId]!
        deployments.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )

        sortedProjects.push({
          projectId,
          deployments
        })
      }

      // Sort projects with most recently created first
      sortedProjects.sort(
        (a, b) =>
          new Date(b.deployments[0]!.createdAt).getTime() -
          new Date(a.deployments[0]!.createdAt).getTime()
      )

      // TODO: better output formatting
      logger.log(sortedProjects)
    })

  program.addCommand(command)
}
