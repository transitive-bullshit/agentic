import type { Schema, SchemaDraft, ValidationResult } from './types'
import { dereference } from './dereference'
import { validate } from './validate'

export class Validator {
  private readonly lookup: ReturnType<typeof dereference>
  private readonly schema: Schema | boolean
  private readonly draft: SchemaDraft
  private readonly shortCircuit: boolean
  private readonly coerce: boolean

  constructor({
    schema,
    draft = '2019-09',
    shortCircuit = true,
    coerce = false
  }: {
    schema: Schema | boolean
    draft?: SchemaDraft
    shortCircuit?: boolean
    coerce?: boolean
  }) {
    this.schema = schema
    this.draft = draft
    this.shortCircuit = shortCircuit
    this.coerce = coerce
    this.lookup = dereference(schema)
  }

  public validate(instance: any): ValidationResult {
    return validate(
      instance,
      this.schema,
      this.draft,
      this.lookup,
      this.coerce,
      this.shortCircuit
    )
  }

  public addSchema(schema: Schema, id?: string): void {
    if (id) {
      schema = { ...schema, $id: id }
    }
    dereference(schema, this.lookup)
  }
}
