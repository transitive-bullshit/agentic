// TODO: investigate this
/* eslint-disable security/detect-unsafe-regex */

import type { ParsedFaasIdentifier } from './types'

// namespace/project-name@deploymentHash/toolPath
// project@deploymentHash/toolPath
const projectDeploymentToolRe =
  /^([a-zA-Z0-9-]{1,64}\/[a-z0-9-]{2,64})@([a-z0-9]{8})(\/[a-zA-Z0-9\-._~%!$&'()*+,;=:/]*)?$/

// namespace/project-name@version/toolPath
// project@version/toolPath
const projectVersionToolRe =
  /^([a-zA-Z0-9-]{1,64}\/[a-z0-9-]{2,64})@([^/?@]+)(\/[a-zA-Z0-9\-._~%!$&'()*+,;=:/]*)?$/

// namespace/project-name/toolPath
// project/toolPath (latest version)
const projectToolRe =
  /^([a-zA-Z0-9-]{1,64}\/[a-z0-9-]{2,64})(\/[a-zA-Z0-9\-._~%!$&'()*+,;=:/]*)?$/

export function parseFaasUri(uri: string): ParsedFaasIdentifier | undefined {
  const pdsMatch = uri.match(projectDeploymentToolRe)

  if (pdsMatch) {
    const projectIdentifier = pdsMatch[1]!
    const deploymentHash = pdsMatch[2]!
    const toolPath = pdsMatch[3] || '/'

    return {
      projectIdentifier,
      deploymentHash,
      toolPath,
      deploymentIdentifier: `${projectIdentifier}@${deploymentHash}`
    }
  }

  const pvsMatch = uri.match(projectVersionToolRe)

  if (pvsMatch) {
    return {
      projectIdentifier: pvsMatch[1]!,
      version: pvsMatch[2]!,
      toolPath: pvsMatch[3] || '/'
    }
  }

  const psMatch = uri.match(projectToolRe)

  if (psMatch) {
    return {
      projectIdentifier: psMatch[1]!,
      toolPath: psMatch[2] || '/',
      version: 'latest'
    }
  }

  // Invalid FaaS uri, so return undefined
  return
}
