import type { Schema, SchemaDraft, ValidationResult } from './types'
import { dereference } from './dereference'
import { validate } from './validate'

export class Validator {
  protected readonly lookup: ReturnType<typeof dereference>
  protected readonly schema: Schema | boolean
  protected readonly draft: SchemaDraft
  protected readonly shortCircuit: boolean
  protected readonly coerce: boolean
  protected readonly strictAdditionalProperties: boolean

  constructor({
    schema,
    draft = '2019-09',
    shortCircuit = true,
    coerce = false,
    strictAdditionalProperties = false
  }: {
    schema: Schema | boolean
    draft?: SchemaDraft
    shortCircuit?: boolean
    coerce?: boolean
    strictAdditionalProperties?: boolean
  }) {
    this.schema = schema
    this.draft = draft
    this.shortCircuit = shortCircuit
    this.coerce = coerce
    this.strictAdditionalProperties = strictAdditionalProperties
    this.lookup = dereference(schema)
  }

  public validate(instance: any): ValidationResult {
    return validate(structuredClone(instance), this.schema, {
      draft: this.draft,
      lookup: this.lookup,
      coerce: this.coerce,
      shortCircuit: this.shortCircuit,
      strictAdditionalProperties: this.strictAdditionalProperties
    })
  }

  public addSchema(schema: Schema, id?: string): void {
    if (id) {
      schema = { ...schema, $id: id }
    }
    dereference(schema, this.lookup)
  }
}
