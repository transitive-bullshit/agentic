import { pruneEmpty } from '@agentic/platform-core'
import sortKeys from 'sort-keys'

export function isRequestPubliclyCacheable(request: Request): boolean {
  const pragma = request.headers.get('pragma')
  if (pragma === 'no-cache') {
    return false
  }

  return isCacheControlPubliclyCacheable(request.headers.get('cache-control'))
}

export function isResponsePubliclyCacheable(response: Response): boolean {
  const pragma = response.headers.get('pragma')
  if (pragma === 'no-cache') {
    return false
  }

  return isCacheControlPubliclyCacheable(response.headers.get('cache-control'))
}

export function isCacheControlPubliclyCacheable(
  cacheControl?: string | null
): boolean {
  if (!cacheControl) {
    // TODO: should we default to true or false?
    return true
  }

  const directives = new Set(cacheControl.split(',').map((s) => s.trim()))
  if (
    directives.has('no-store') ||
    directives.has('no-cache') ||
    directives.has('private') ||
    directives.has('max-age=0')
  ) {
    return false
  }

  return true
}

const agenticMcpMetadataFieldOrder: string[] = [
  'deploymentId',
  'consumerId',
  'toolName',
  'status',
  'cacheStatus',
  'headers'
]

const agenticMcpMetadataFieldsOrderMap = Object.fromEntries(
  agenticMcpMetadataFieldOrder.map((f, i) => [f, i])
)

function agenticMcpMetadataFieldComparator(a: string, b: string): number {
  const aIndex = agenticMcpMetadataFieldsOrderMap[a] ?? Infinity
  const bIndex = agenticMcpMetadataFieldsOrderMap[b] ?? Infinity

  return aIndex - bIndex
}

/**
 * Sanitizes agentic MCP metadata by sorting the keys and pruning empty values.
 */
export function createAgenticMcpMetadata(
  metadata: {
    deploymentId: string
    consumerId?: string
    toolName?: string
    status?: number
    cacheStatus?: string
    headers?: Record<string, any>
  },
  existingMetadata?: Record<string, any>
): Record<string, any> {
  const rawAgenticMcpMetadata = pruneEmpty({
    status: 200,
    ...existingMetadata?.agentic,
    ...metadata,
    headers: {
      ...existingMetadata?.agentic?.headers,
      ...metadata.headers
    }
  })

  const agentic = sortKeys(rawAgenticMcpMetadata, {
    compare: agenticMcpMetadataFieldComparator
  })

  return {
    ...existingMetadata,
    agentic
  }
}
