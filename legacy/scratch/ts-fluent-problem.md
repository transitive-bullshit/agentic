For the following TypeScript code:

```ts
import { ZodType, z } from 'zod'

class Super<TInput, TOutput> {
  protected _inputSchema: ZodType<TInput> | undefined
  protected _outputSchema: ZodType<TOutput> | undefined

  input<U>(outputSchema: ZodType<U>): Super<U, TOutput> {
    const refinedInstance = this as unknown as Super<U, TOutput>
    refinedInstance._inputSchema = inputSchema
    return refinedInstance
  }

  output<U>(outputSchema: ZodType<U>): Super<TInput, U> {
    const refinedInstance = this as unknown as Super<TInput, U>
    refinedInstance._outputSchema = outputSchema
    return refinedInstance
  }
}

class SubA<TInput, TOutput> extends Super<TInput, TOutput> {}
class SubB<TInput, TOutput> extends Super<TInput, TOutput> {}
```

```ts
const a = new SubA<number, number>()
a.output<string>() // SubA<number, string>

const b = new SubB<string, boolean>()
b.output<string>() // SubB<string, string>
```

How can I change this implementation so `input` and `output` return the correct subclassed types?
