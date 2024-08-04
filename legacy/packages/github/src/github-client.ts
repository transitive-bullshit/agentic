import { AIFunctionsProvider, assert, getEnv } from '@agentic/core'
import { Octokit } from 'octokit'

export namespace github {
  export interface User {
    id: number
    login: string
    name: string
    bio: string
    node_id: string
    gravatar_id: string
    type: string
    site_admin: boolean
    company: string
    blog?: string
    location?: string
    hireable?: boolean
    twitter_username?: string
    email?: string
    public_repos: number
    public_gists: number
    followers: number
    following: number
    avatar_url: string
    url: string
    html_url: string
    followers_url: string
    following_url: string
    gists_url: string
    starred_url: string
    subscriptions_url: string
    organizations_url: string
    repos_url: string
    events_url: string
    received_events_url: string
    created_at: string
    updated_at: string
  }
}

/**
 * Basic GitHub API wrapper.
 */
export class GitHubClient extends AIFunctionsProvider {
  protected readonly apiKey: string
  protected readonly octokit: Octokit

  constructor({
    apiKey = getEnv('GITHUB_API_KEY')
  }: {
    apiKey?: string
  } = {}) {
    assert(
      apiKey,
      'GitHubClient missing required "apiKey" (defaults to "GITHUB_API_KEY")'
    )
    super()

    this.apiKey = apiKey
    this.octokit = new Octokit({ auth: apiKey })
  }

  async getUserByUsername(
    usernameOrOpts: string | { username: string }
  ): Promise<github.User> {
    const { username } =
      typeof usernameOrOpts === 'string'
        ? { username: usernameOrOpts }
        : usernameOrOpts

    const res = await this.octokit.request(`GET /users/${username}`, {
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })

    return res.data
  }
}
