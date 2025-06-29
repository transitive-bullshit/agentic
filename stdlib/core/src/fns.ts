import type * as types from './types'
import type { AIFunction } from './types'
import { AIFunctionSet } from './ai-function-set'
import {
  createAIFunction,
  type CreateAIFunctionArgs
} from './create-ai-function'
import { assert } from './utils'

export type PrivateAIFunctionMetadata = CreateAIFunctionArgs & {
  methodName: string
}

// Polyfill for `Symbol.metadata`
// https://github.com/microsoft/TypeScript/issues/53461
declare global {
  interface SymbolConstructor {
    readonly metadata: unique symbol
  }
}

;(Symbol as any).metadata ??= Symbol.for('Symbol.metadata')

const _metadata = Object.create(null)

if (typeof Symbol === 'function' && Symbol.metadata) {
  Object.defineProperty(globalThis, Symbol.metadata, {
    enumerable: true,
    configurable: true,
    writable: true,
    value: _metadata
  })
}

export abstract class AIFunctionsProvider {
  protected _functions?: AIFunctionSet

  /**
   * An `AIFunctionSet` containing all of the AI-compatible functions exposed
   * by this class.
   *
   * This property is useful for manipulating AI functions across multiple
   * sources, picking specific functions, ommitting certain functions, etc.
   */
  get functions(): AIFunctionSet {
    if (!this._functions) {
      const metadata = this.constructor[Symbol.metadata]
      assert(
        metadata,
        'Your runtime does not appear to support ES decorator metadata: https://github.com/tc39/proposal-decorator-metadata/issues/14'
      )
      const invocables =
        (metadata?.invocables as PrivateAIFunctionMetadata[]) ?? []

      const aiFunctions = invocables.map((invocable) => {
        const impl = (this as any)[invocable.methodName]
        assert(impl)

        return createAIFunction(invocable, impl)
      })

      this._functions = new AIFunctionSet(aiFunctions)
    }

    return this._functions
  }

  /**
   * Returns the AIFunctions provided by this class filtered by the given tags.
   */
  getFunctionsFilteredByTags(...tags: string[]): AIFunctionSet {
    return this.functions.getFilteredByTags(...tags)
  }

  /**
   * Returns the AIFunctions provided by this class which match a custom filter
   * function.
   */
  getFunctionsFilteredBy(
    filterFn: (fn: AIFunction) => boolean | undefined
  ): AIFunctionSet {
    return this.functions.getFilteredBy(filterFn)
  }
}

export function aiFunction<
  This extends AIFunctionsProvider,
  InputSchema extends types.AIFunctionInputSchema,
  OptionalArgs extends Array<undefined>,
  Return extends types.MaybePromise<any>
>(args: CreateAIFunctionArgs<InputSchema>) {
  return (
    _targetMethod: (
      this: This,
      input: types.inferInput<InputSchema>,
      ...optionalArgs: OptionalArgs
    ) => Return,
    context: ClassMethodDecoratorContext<
      This,
      (
        this: This,
        input: types.inferInput<InputSchema>,
        ...optionalArgs: OptionalArgs
      ) => Return
    >
  ) => {
    const methodName = String(context.name)
    if (!context.metadata.invocables) {
      context.metadata.invocables = []
    }

    assert(args.name, 'aiFunction requires a non-empty "name" argument')
    ;(context.metadata.invocables as PrivateAIFunctionMetadata[]).push({
      ...args,
      methodName
    })

    context.addInitializer(function () {
      ;(this as any)[methodName] = (this as any)[methodName].bind(this)
      // ;(this as any)[methodName].aiFunction = this.functions.get(
      //   name ?? methodName
      // )
    })
  }
}

// declare module './fns' {
//   // Define a type for methods decorated with @aiFunction
//   type AIFunctionMethod<
//     T extends z.ZodObject<any> = z.ZodObject<any>,
//     R = any
//   > = ((...args: any[]) => R) & {
//     aiFunction?: AIFunction<T, R>
//   }

//   interface AIFunctionsProvider {
//     [methodName: string]: AIFunctionMethod<any, any>
//   }
// }
