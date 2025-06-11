import type { Deployment } from '@agentic/platform-types'
import { parseDeploymentIdentifier } from '@agentic/platform-validators'
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
    .argument(
      '[identifier]',
      'Optional project or deployment identifier to filter by.'
    )
    .option('-v, --verbose', 'Display full deployments', false)
    .action(async (identifier, opts) => {
      AuthStore.requireAuth()

      const query: Parameters<typeof client.listDeployments>[0] = {}
      let label = 'Fetching all projects and deployments'

      if (identifier) {
        const parsedDeploymentIdentifier = parseDeploymentIdentifier(
          identifier,
          {
            strict: false
          }
        )

        query.projectIdentifier = parsedDeploymentIdentifier.projectIdentifier
        label = `Fetching deployments for project "${query.projectIdentifier}"`

        // TODO: this logic needs tweaking.
        if (
          parsedDeploymentIdentifier.deploymentVersion !== 'latest' ||
          identifier.includes('@latest')
        ) {
          query.deploymentIdentifier =
            parsedDeploymentIdentifier.deploymentIdentifier
          label = `Fetching deployment "${query.deploymentIdentifier}"`
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
