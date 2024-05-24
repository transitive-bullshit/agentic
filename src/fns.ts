import './symbol-polyfill.js'

import type * as z from 'zod'

import type * as types from './types.js'
import { createAIFunction } from './ai-function.js'
import { AIFunctionSet } from './ai-function-set.js'
import { AIToolSet } from './ai-tool-set.js'
import { assert } from './utils.js'

export const invocableMetadataKey = Symbol('invocable')

export abstract class AIToolsProvider {
  private _tools?: AIToolSet
  private _functions?: AIFunctionSet

  get tools(): AIToolSet {
    if (!this._tools) {
      this._tools = AIToolSet.fromAIFunctionSet(this.functions)
    }

    return this._tools
  }

  get functions(): AIFunctionSet {
    if (!this._functions) {
      const metadata = this.constructor[Symbol.metadata]
      const invocables = (metadata?.invocables as Invocable[]) ?? []

      const aiFunctions = invocables.map((invocable) => {
        const impl = (this as any)[invocable.methodName]?.bind(this)
        assert(impl)

        return createAIFunction(invocable, impl)
      })

      this._functions = new AIFunctionSet(aiFunctions)
    }

    return this._functions
  }
}

export interface Invocable {
  name: string
  description?: string
  inputSchema: z.AnyZodObject
  methodName: string
}

export function aiFunction<
  This,
  InputSchema extends z.SomeZodObject,
  OptionalArgs extends Array<undefined>,
  Return extends types.MaybePromise<any>
>({
  name,
  description,
  inputSchema
}: {
  name?: string
  description?: string
  inputSchema: InputSchema
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

    ;(context.metadata.invocables as Invocable[]).push({
      name: name ?? methodName,
      description,
      inputSchema,
      methodName
    })

    // context.addInitializer(function () {
    //   ;(this as any)[methodName] = (this as any)[methodName].bind(this)
    // })
  }
}
