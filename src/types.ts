export type { KyInstance } from 'ky'
export type { ThrottledFunction } from 'p-throttle'

// TODO
export type DeepNullable<T> = T | null

export interface AIFunctionSpec {
  name: string
  description?: string
  parameters: Record<string, unknown>
}

export interface AIToolSpec {
  type: 'function'
  function: AIFunctionSpec
}
