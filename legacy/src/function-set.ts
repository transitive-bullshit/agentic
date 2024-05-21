import type { ToolSet } from './tool-set.js'
import type * as types from './types.ts'

export class FunctionSet implements Iterable<types.AIFunctionSpec> {
  protected _map: Map<string, types.AIFunctionSpec>

  constructor(functions?: readonly types.AIFunctionSpec[] | null) {
    this._map = new Map(functions ? functions.map((fn) => [fn.name, fn]) : null)
  }

  get size(): number {
    return this._map.size
  }

  add(fn: types.AIFunctionSpec): this {
    this._map.set(fn.name, fn)
    return this
  }

  get(name: string): types.AIFunctionSpec | undefined {
    return this._map.get(name)
  }

  set(name: string, fn: types.AIFunctionSpec): this {
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

  pick(...keys: string[]): FunctionSet {
    const keysToIncludeSet = new Set(keys)
    return new FunctionSet(
      Array.from(this).filter((fn) => keysToIncludeSet.has(fn.name))
    )
  }

  omit(...keys: string[]): FunctionSet {
    const keysToExcludeSet = new Set(keys)
    return new FunctionSet(
      Array.from(this).filter((fn) => !keysToExcludeSet.has(fn.name))
    )
  }

  get entries(): IterableIterator<types.AIFunctionSpec> {
    return this._map.values()
  }

  [Symbol.iterator](): Iterator<types.AIFunctionSpec> {
    return this.entries
  }

  static fromToolSet(toolSet: ToolSet): FunctionSet {
    return new FunctionSet(
      Array.from(toolSet)
        .filter((tool) => tool.type === 'function')
        .map((tool) => tool.function)
    )
  }
}
