import { Octokit } from 'octokit'

export function getGitHubClient({
  accessToken
}: {
  accessToken: string
}): Octokit {
  return new Octokit({ auth: accessToken })
}
