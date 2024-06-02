import type * as types from './types.ts'
import { AIFunctionsProvider } from './fns.js'

export class AIFunctionSet implements Iterable<types.AIFunction> {
  protected readonly _map: Map<string, types.AIFunction>

  constructor(aiFunctionLikeObjects?: types.AIFunctionLike[]) {
    const fns = aiFunctionLikeObjects?.flatMap((fn) =>
      fn instanceof AIFunctionsProvider
        ? [...fn.functions]
        : fn instanceof AIFunctionSet
          ? [...fn]
          : [fn]
    )

    this._map = new Map(fns ? fns.map((fn) => [fn.spec.name, fn]) : null)
  }

  get size(): number {
    return this._map.size
  }

  add(fn: types.AIFunction): this {
    this._map.set(fn.spec.name, fn)
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

  map<T>(fn: (fn: types.AIFunction) => T): T[] {
    return [...this.entries].map(fn)
  }

  get specs(): types.AIFunctionSpec[] {
    return this.map((fn) => fn.spec)
  }

  get toolSpecs(): types.AIToolSpec[] {
    return this.map((fn) => ({
      type: 'function' as const,
      function: fn.spec
    }))
  }

  get entries(): IterableIterator<types.AIFunction> {
    return this._map.values()
  }

  [Symbol.iterator](): Iterator<types.AIFunction> {
    return this.entries
  }
}
