// TODO: investigate this
/* eslint-disable security/detect-unsafe-regex */

import type { ParsedFaasIdentifier } from './types'

// namespace/projectName@deploymentHash/servicePath
// project@deploymentHash/servicePath
const projectDeploymentServiceRe =
  /^([a-zA-Z0-9-]{1,64}\/[a-z0-9-]{3,64})@([a-z0-9]{8})(\/[a-zA-Z0-9\-._~%!$&'()*+,;=:/]*)?$/

// namespace/projectName@version/servicePath
// project@version/servicePath
const projectVersionServiceRe =
  /^([a-zA-Z0-9-]{1,64}\/[a-z0-9-]{3,64})@([^/?@]+)(\/[a-zA-Z0-9\-._~%!$&'()*+,;=:/]*)?$/

// namespace/projectName/servicePath
// project/servicePath (latest version)
const projectServiceRe =
  /^([a-zA-Z0-9-]{1,64}\/[a-z0-9-]{3,64})(\/[a-zA-Z0-9\-._~%!$&'()*+,;=:/]*)?$/

export function parseFaasUri(uri: string): ParsedFaasIdentifier | undefined {
  const pdsMatch = uri.match(projectDeploymentServiceRe)

  if (pdsMatch) {
    const projectId = pdsMatch[1]!
    const deploymentHash = pdsMatch[2]!
    const servicePath = pdsMatch[3] || '/'

    return {
      projectId,
      deploymentHash,
      servicePath,
      deploymentId: `${projectId}@${deploymentHash}`
    }
  }

  const pvsMatch = uri.match(projectVersionServiceRe)

  if (pvsMatch) {
    return {
      projectId: pvsMatch[1]!,
      version: pvsMatch[2]!,
      servicePath: pvsMatch[3] || '/'
    }
  }

  const psMatch = uri.match(projectServiceRe)

  if (psMatch) {
    return {
      projectId: psMatch[1]!,
      servicePath: psMatch[2] || '/',
      version: 'latest'
    }
  }

  // Invalid FaaS uri, so return undefined
  return
}
