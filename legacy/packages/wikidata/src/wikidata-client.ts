import type * as wikibase from 'wikibase-sdk'
import { AIFunctionsProvider, assert, getEnv, throttleKy } from '@agentic/core'
import defaultKy, { type KyInstance } from 'ky'
import pThrottle from 'p-throttle'
import wdk from 'wikibase-sdk/wikidata.org'

export namespace wikidata {
  // Allow up to 200 requests per second by default.
  export const throttle = pThrottle({
    limit: 200,
    interval: 1000
  })

  export type SimplifiedEntityMap = Record<string, SimplifiedEntity>

  export interface SimplifiedEntity {
    id: string
    type: string
    claims: Claims
    modified: string
    labels?: Descriptions
    descriptions?: Descriptions
    aliases?: any
    sitelinks?: Sitelinks
  }

  export interface Claims {
    [key: string]: Claim[]
  }

  export interface Claim {
    value: string
    qualifiers: Record<string, string[] | number[]>
    references: Record<string, string[]>[]
  }

  export type Descriptions = Record<string, string>
  export type Sitelinks = Record<string, string>
}

/**
 * Basic Wikidata client.
 *
 * @see https://github.com/maxlath/wikibase-sdk
 *
 * TODO: support any wikibase instance
 */
export class WikidataClient extends AIFunctionsProvider {
  protected readonly ky: KyInstance
  protected readonly apiUserAgent: string

  constructor({
    apiUserAgent = getEnv('WIKIDATA_API_USER_AGENT') ??
      'Agentic (https://github.com/transitive-bullshit/agentic)',
    throttle = true,
    ky = defaultKy
  }: {
    apiBaseUrl?: string
    apiUserAgent?: string
    throttle?: boolean
    ky?: KyInstance
  } = {}) {
    assert(apiUserAgent, 'WikidataClient missing required "apiUserAgent"')
    super()

    this.apiUserAgent = apiUserAgent

    const throttledKy = throttle ? throttleKy(ky, wikidata.throttle) : ky

    this.ky = throttledKy.extend({
      headers: {
        'user-agent': apiUserAgent
      }
    })
  }

  async getEntityById(
    idOrOpts: string | { id: string; languages?: string[] }
  ): Promise<wikidata.SimplifiedEntity> {
    const { id, languages = ['en'] } =
      typeof idOrOpts === 'string' ? { id: idOrOpts } : idOrOpts

    const url = wdk.getEntities({
      ids: id as wikibase.EntityId,
      languages
    })

    const res = await this.ky.get(url).json<any>()
    const entities = wdk.simplify.entities(res.entities, {
      // TODO: Make this configurable and double-check defaults.
      keepQualifiers: true,
      keepReferences: true
    })

    const entity = entities[id]
    return entity as wikidata.SimplifiedEntity
  }

  async getEntitiesByIds(
    idsOrOpts: string[] | { ids: string; languages?: string[] }
  ): Promise<wikidata.SimplifiedEntityMap> {
    const { ids, languages = ['en'] } = Array.isArray(idsOrOpts)
      ? { ids: idsOrOpts }
      : idsOrOpts

    // TODO: Separate between wdk.getEntities and wdk.getManyEntities depending
    // on how many `ids` there are.
    const url = wdk.getEntities({
      ids: ids as wikibase.EntityId[],
      languages
    })

    const res = await this.ky.get(url).json<any>()
    const entities = wdk.simplify.entities(res.entities, {
      keepQualifiers: true,
      keepReferences: true
    })

    return entities as wikidata.SimplifiedEntityMap
  }
}
