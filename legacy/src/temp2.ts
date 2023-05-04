import { ZodRawShape, ZodType, ZodTypeAny, z } from 'zod'

import * as types from './types'

class Test<T extends ZodRawShape | ZodTypeAny = ZodTypeAny> {
  _schema: T

  schema<U extends ZodRawShape | ZodTypeAny>(schema: U): Test<U> {
    ;(this as unknown as Test<U>)._schema = schema
    return this as unknown as Test<U>
  }

  call(value: types.ParsedData<T>): types.ParsedData<T> {
    const finalSchema =
      this._schema instanceof ZodType ? this._schema : z.object(this._schema)
    return finalSchema.parse(value)
  }
}

async function main() {
  const t = new Test()
  const t2 = t.schema(z.string())
  const t3 = t2.call('foo')

  console.log(t3)
}

main()
