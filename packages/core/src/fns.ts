import type { z } from 'zod'

import type * as types from './types'
import { AIFunctionSet } from './ai-function-set'
import { createAIFunction } from './create-ai-function'
import { assert } from './utils'

export interface PrivateAIFunctionMetadata {
  name: string
  description: string
  inputSchema: z.AnyZodObject
  methodName: string
  strict?: boolean
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
  private _functions?: AIFunctionSet

  get functions(): AIFunctionSet {
    if (!this._functions) {
      const metadata = this.constructor[Symbol.metadata]
      assert(
        metadata,
        'Your runtime does not appear to support ES decorator metadata: https://github.com/tc39/proposal-decorator-metadata/issues/14'
      )
      const invocables =
        (metadata?.invocables as PrivateAIFunctionMetadata[]) ?? []
      // console.log({ metadata, invocables })

      const aiFunctions = invocables.map((invocable) => {
        const impl = (this as any)[invocable.methodName]
        assert(impl)

        return createAIFunction(invocable, impl)
      })

      this._functions = new AIFunctionSet(aiFunctions)
    }

    return this._functions
  }
}

export function aiFunction<
  This extends AIFunctionsProvider,
  InputSchema extends z.SomeZodObject,
  OptionalArgs extends Array<undefined>,
  Return extends types.MaybePromise<any>
>({
  name,
  description,
  inputSchema,
  strict
}: {
  name?: string
  description: string
  inputSchema: InputSchema
  strict?: boolean
}) {
  return (
    _targetMethod: (
      this: This,
      input: z.infer<InputSchema>,
      ...optionalArgs: OptionalArgs
    ) => Return,
    context: ClassMethodDecoratorContext<
      This,
      (
        this: This,
        input: z.infer<InputSchema>,
        ...optionalArgs: OptionalArgs
      ) => Return
    >
  ) => {
    const methodName = String(context.name)
    if (!context.metadata.invocables) {
      context.metadata.invocables = []
    }

    ;(context.metadata.invocables as PrivateAIFunctionMetadata[]).push({
      name: name ?? methodName,
      description,
      inputSchema,
      methodName,
      strict
    })

    context.addInitializer(function () {
      ;(this as any)[methodName] = (this as any)[methodName].bind(this)
    })
  }
}
