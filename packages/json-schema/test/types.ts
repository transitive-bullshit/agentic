import type { Schema, SchemaDraft } from '../src/types'

export interface SchemaTestSuite {
  draft: SchemaDraft
  name: string
  tests: SchemaTest[]
}

export interface SchemaTest {
  description: string
  schema: any
  tests: SchemaTestCase[]
}

export interface SchemaTestCase {
  description: string
  data: any
  valid: boolean
  debug?: true
}

export interface Remote {
  name: string
  schema: Schema
}
