import type * as types from './types.ts'
import type { AIFunction } from './types.ts'
import { AIFunctionsProvider } from './fns'
import { isAIFunction } from './utils'

export type AIFunctionSetOptions = {
  transformNameKeysFn?: (name: string) => string
}

/**
 * A set of AI functions intended to make it easier to work with large sets of
 * AI functions across different clients.
 *
 * This class mimics a built-in `Set<AIFunction>`, but with additional utility
 * methods like `pick`, `omit`, and `map`.
 *
 * Function names are case-insensitive to make it easier to match them with
 * possible LLM hallucinations.
 */
export class AIFunctionSet implements Iterable<types.AIFunction> {
  protected readonly _map: Map<string, types.AIFunction>
  protected readonly _transformNameKeysFn: (name: string) => string

  constructor(
    aiFunctionLikeObjects?: types.AIFunctionLike[],
    { transformNameKeysFn = transformName }: AIFunctionSetOptions = {}
  ) {
    this._transformNameKeysFn = transformNameKeysFn

    // TODO: these `instanceof` checks seem to be failing on some platforms,
    // so for now we're using an uglier, but more reliable approach to parsing
    // the AIFunctionLike objects.
    const fns = aiFunctionLikeObjects?.flatMap((fn) => {
      if (fn instanceof AIFunctionsProvider) {
        return [...fn.functions]
      }

      if (fn instanceof AIFunctionSet) {
        return [...fn]
      }

      if (isAIFunction(fn)) {
        return fn
      }

      const fa = ((fn as any).functions ?? fn) as AIFunctionSet
      if (fa) {
        try {
          const fns = [...fa]
          if (fns.every(isAIFunction)) {
            return fns
          }
        } catch {}
      }

      throw new Error(`Invalid AIFunctionLike: ${fn}`)
    })

    // TODO: This is the cleaner approach which should work in theory, but is
    // not working in practice due to the `instanceof` checks failing.
    // const fns = aiFunctionLikeObjects?.flatMap((fn) =>
    //   fn instanceof AIFunctionsProvider
    //     ? [...fn.functions]
    //     : fn instanceof AIFunctionSet
    //       ? [...fn]
    //       : [fn]
    // )

    if (fns) {
      for (const fn of fns) {
        if (!isAIFunction(fn)) {
          throw new Error(`Invalid AIFunctionLike: ${fn}`)
        }
      }
    }

    this._map = new Map(
      fns
        ? fns.map((fn) => [this._transformNameKeysFn(fn.spec.name), fn])
        : null
    )
  }

  get size(): number {
    return this._map.size
  }

  add(fn: types.AIFunction): this {
    this._map.set(this._transformNameKeysFn(fn.spec.name), fn)
    return this
  }

  get(name: string): types.AIFunction | undefined {
    return this._map.get(this._transformNameKeysFn(name))
  }

  set(name: string, fn: types.AIFunction): this {
    this._map.set(this._transformNameKeysFn(name), fn)
    return this
  }

  has(name: string): boolean {
    return this._map.has(this._transformNameKeysFn(name))
  }

  clear(): void {
    this._map.clear()
  }

  delete(name: string): boolean {
    return this._map.delete(this._transformNameKeysFn(name))
  }

  pick(...keys: string[]): AIFunctionSet {
    const keysToIncludeSet = new Set(keys.map(this._transformNameKeysFn))
    return new AIFunctionSet(
      Array.from(this).filter((fn) =>
        keysToIncludeSet.has(this._transformNameKeysFn(fn.spec.name))
      )
    )
  }

  omit(...keys: string[]): AIFunctionSet {
    const keysToExcludeSet = new Set(keys.map(this._transformNameKeysFn))
    return new AIFunctionSet(
      Array.from(this).filter(
        (fn) => !keysToExcludeSet.has(this._transformNameKeysFn(fn.spec.name))
      )
    )
  }

  map<T>(fn: (fn: types.AIFunction) => T): T[] {
    return [...this.entries].map(fn)
  }

  /**
   * Returns a new AIFunctionSet containing only the AIFunctions in this set
   * matching the given tags.
   */
  getFilteredByTags(...tags: string[]): AIFunctionSet {
    const tagsSet = new Set(tags)
    return this.getFilteredBy((fn) => fn.tags?.some((t) => tagsSet.has(t)))
  }

  /**
   * Returns a new AIFunctionSet containing only the AIFunctions in this set
   * matching a custom filter function.
   */
  getFilteredBy(
    filterFn: (fn: AIFunction) => boolean | undefined
  ): AIFunctionSet {
    return new AIFunctionSet(Array.from(this).filter((fn) => filterFn(fn)))
  }

  /**
   * Returns the functions in this set as an array compatible with OpenAI's
   * chat completions `functions`.
   */
  get specs(): types.AIFunctionSpec[] {
    return this.map((fn) => fn.spec)
  }

  /**
   * Returns the functions in this set as an array compatible with OpenAI's
   * chat completions `tools`.
   */
  get toolSpecs(): types.AIToolSpec[] {
    return this.map((fn) => ({
      type: 'function' as const,
      function: fn.spec
    }))
  }

  /**
   * Returns the tools in this set compatible with OpenAI's `responses` API.
   *
   * Note that this is currently the same type as `AIFunctionSet.specs`, but
   * they are separate APIs which may diverge over time, so if you're using the
   * OpenAI `responses` API, you should reference this property.
   */
  get responsesToolSpecs(): types.AIFunctionSpec[] {
    return this.specs
  }

  get entries(): IterableIterator<types.AIFunction> {
    return this._map.values()
  }

  [Symbol.iterator](): Iterator<types.AIFunction> {
    return this.entries
  }
}

function transformName(name: string): string {
  // TODO: decamalize?
  return name.toLowerCase()
}
