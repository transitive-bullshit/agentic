export interface AuthStorageAdapter {
  get(key: string[]): Promise<Record<string, any> | undefined>
  remove(key: string[]): Promise<void>
  set(key: string[], value: any, expiry?: Date): Promise<void>
  scan(prefix: string[]): AsyncIterable<[string[], any]>
}

const SEPERATOR = String.fromCodePoint(0x1f)

export function joinKey(key: string[]) {
  return key.join(SEPERATOR)
}

export function splitKey(key: string) {
  return key.split(SEPERATOR)
}

export namespace AuthStorage {
  function encode(key: string[]) {
    return key.map((k) => k.replaceAll(SEPERATOR, ''))
  }
  export function get<T>(adapter: AuthStorageAdapter, key: string[]) {
    return adapter.get(encode(key)) as Promise<T | null>
  }

  export function set(
    adapter: AuthStorageAdapter,
    key: string[],
    value: any,
    ttl?: number
  ) {
    const expiry = ttl ? new Date(Date.now() + ttl * 1000) : undefined
    return adapter.set(encode(key), value, expiry)
  }

  export function remove(adapter: AuthStorageAdapter, key: string[]) {
    return adapter.remove(encode(key))
  }

  export function scan<T>(
    adapter: AuthStorageAdapter,
    key: string[]
  ): AsyncIterable<[string[], T]> {
    return adapter.scan(encode(key))
  }
}
