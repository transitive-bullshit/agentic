import type * as types from './types.js'
import { AIFunctionSet } from './ai-function-set.js'

export class AIToolSet implements Iterable<types.AITool> {
  protected _map: Map<string, types.AITool>

  constructor(tools?: readonly types.AITool[]) {
    this._map = new Map(
      tools ? tools.map((tool) => [tool.spec.function.name, tool]) : []
    )
  }

  get size(): number {
    return this._map.size
  }

  add(tool: types.AITool): this {
    this._map.set(tool.spec.function.name, tool)
    return this
  }

  get(name: string): types.AITool | undefined {
    return this._map.get(name)
  }

  set(name: string, tool: types.AITool): this {
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

  pick(...keys: string[]): AIToolSet {
    const keysToIncludeSet = new Set(keys)
    return new AIToolSet(
      Array.from(this).filter((tool) =>
        keysToIncludeSet.has(tool.spec.function.name)
      )
    )
  }

  omit(...keys: string[]): AIToolSet {
    const keysToExcludeSet = new Set(keys)
    return new AIToolSet(
      Array.from(this).filter(
        (tool) => !keysToExcludeSet.has(tool.spec.function.name)
      )
    )
  }

  map<T>(fn: (fn: types.AITool) => T): T[] {
    return [...this.entries].map(fn)
  }

  get functionSpecs(): types.AIFunctionSpec[] {
    return this.map((fn) => fn.function.spec)
  }

  get specs(): types.AIToolSpec[] {
    return this.map((fn) => fn.spec)
  }

  get entries(): IterableIterator<types.AITool> {
    return this._map.values()
  }

  [Symbol.iterator](): Iterator<types.AITool> {
    return this.entries
  }

  static fromAIFunctionSet(functions: AIFunctionSet): AIToolSet {
    return new AIToolSet(
      Array.from(functions).map((fn) => ({
        function: fn,
        spec: {
          type: 'function' as const,
          function: fn.spec
        }
      }))
    )
  }

  static fromFunctions(functions: types.AIFunction[]): AIToolSet {
    return AIToolSet.fromAIFunctionSet(new AIFunctionSet(functions))
  }

  static fromTools(tools: types.AITool[]): AIToolSet {
    return new AIToolSet(tools)
  }
}
