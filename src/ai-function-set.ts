import type { AIToolSet } from './ai-tool-set.js'
import type * as types from './types.ts'

export class AIFunctionSet implements Iterable<types.AIFunction> {
  protected readonly _map: Map<string, types.AIFunction>

  constructor(functions?: readonly types.AIFunction[]) {
    this._map = new Map(
      functions ? functions.map((fn) => [fn.spec.name, fn]) : null
    )
  }

  get size(): number {
    return this._map.size
  }

  add(fn: types.AIFunction): this {
    this._map.set(fn.name, fn)
    return this
  }

  get(name: string): types.AIFunction | undefined {
    return this._map.get(name)
  }

  set(name: string, fn: types.AIFunction): this {
    this._map.set(name, fn)
    return this
  }

  has(name: string): boolean {
    return this._map.has(name)
  }

  clear(): void {
    this._map.clear()
  }

  delete(name: string): boolean {
    return this._map.delete(name)
  }

  pick(...keys: string[]): AIFunctionSet {
    const keysToIncludeSet = new Set(keys)
    return new AIFunctionSet(
      Array.from(this).filter((fn) => keysToIncludeSet.has(fn.spec.name))
    )
  }

  omit(...keys: string[]): AIFunctionSet {
    const keysToExcludeSet = new Set(keys)
    return new AIFunctionSet(
      Array.from(this).filter((fn) => !keysToExcludeSet.has(fn.spec.name))
    )
  }

  get entries(): IterableIterator<types.AIFunction> {
    return this._map.values()
  }

  [Symbol.iterator](): Iterator<types.AIFunction> {
    return this.entries
  }

  static fromAIToolSet(tools: AIToolSet): AIFunctionSet {
    return new AIFunctionSet(
      Array.from(tools)
        .filter((tool) => tool.spec.type === 'function')
        .map((tool) => tool.function)
    )
  }
}
