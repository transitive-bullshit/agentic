import type * as types from './types.ts'
import { FunctionSet } from './function-set.js'

export class ToolSet implements Iterable<types.AIToolSpec> {
  protected _map: Map<string, types.AIToolSpec>

  constructor(tools?: readonly types.AIToolSpec[] | null) {
    this._map = new Map(
      tools ? tools.map((tool) => [tool.function.name, tool]) : null
    )
  }

  get size(): number {
    return this._map.size
  }

  add(tool: types.AIToolSpec): this {
    this._map.set(tool.function.name, tool)
    return this
  }

  get(name: string): types.AIToolSpec | undefined {
    return this._map.get(name)
  }

  set(name: string, tool: types.AIToolSpec): this {
    this._map.set(name, tool)
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

  pick(...keys: string[]): ToolSet {
    const keysToIncludeSet = new Set(keys)
    return new ToolSet(
      Array.from(this).filter((tool) =>
        keysToIncludeSet.has(tool.function.name)
      )
    )
  }

  omit(...keys: string[]): ToolSet {
    const keysToExcludeSet = new Set(keys)
    return new ToolSet(
      Array.from(this).filter(
        (tool) => !keysToExcludeSet.has(tool.function.name)
      )
    )
  }

  get entries(): IterableIterator<types.AIToolSpec> {
    return this._map.values()
  }

  [Symbol.iterator](): Iterator<types.AIToolSpec> {
    return this.entries
  }

  static fromFunctionSet(functionSet: FunctionSet): ToolSet {
    return new ToolSet(
      Array.from(functionSet).map((fn) => ({
        type: 'function' as const,
        function: fn
      }))
    )
  }

  static fromFunctionSpecs(functionSpecs: types.AIFunctionSpec[]): ToolSet {
    return ToolSet.fromFunctionSet(new FunctionSet(functionSpecs))
  }

  static fromToolSpecs(toolSpecs: types.AIToolSpec[]): ToolSet {
    return new ToolSet(toolSpecs)
  }
}
