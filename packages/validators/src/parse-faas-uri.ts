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
  const pdtMatch = uri.match(projectDeploymentToolRe)

  if (pdtMatch) {
    const projectIdentifier = pdtMatch[1]!
    const deploymentHash = pdtMatch[2]!
    const toolPath = pdtMatch[3] || '/'

    return {
      projectIdentifier,
      deploymentHash,
      toolPath,
      deploymentIdentifier: `${projectIdentifier}@${deploymentHash}`
    }
  }

  const pvtMatch = uri.match(projectVersionToolRe)

  if (pvtMatch) {
    return {
      projectIdentifier: pvtMatch[1]!,
      version: pvtMatch[2]!,
      toolPath: pvtMatch[3] || '/'
    }
  }

  const ptMatch = uri.match(projectToolRe)

  if (ptMatch) {
    return {
      projectIdentifier: ptMatch[1]!,
      toolPath: ptMatch[2] || '/',
      version: 'latest'
    }
  }

  // Invalid FaaS uri, so return undefined
  return
}
