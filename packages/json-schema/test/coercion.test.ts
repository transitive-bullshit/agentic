import { describe, expect, it } from 'vitest'

import { validate } from '../src/index'

describe('json-schema coercion', () => {
  it('string => number coercion', () => {
    const result = validate('7', { type: 'number' }, { coerce: true })

    expect(result.valid).to.equal(true)
    expect(result.instance).to.equal(7)
  })

  it('boolean => number coercion', () => {
    const result = validate(true, { type: 'number' }, { coerce: true })

    expect(result.valid).to.equal(true)
    expect(result.instance).to.equal(1)
  })

  it('null => number coercion', () => {
    const result = validate(null, { type: 'number' }, { coerce: true })

    expect(result.valid).to.equal(true)
    expect(result.instance).to.equal(0)
  })

  it('array => number coercion', () => {
    const result = validate([1], { type: 'number' }, { coerce: true })

    expect(result.valid).to.equal(true)
    expect(result.instance).to.equal(1)
  })

  it('boolean => string coercion', () => {
    const result = validate(true, { type: 'string' }, { coerce: true })

    expect(result.valid).to.equal(true)
    expect(result.instance).to.equal('true')
  })

  it('number => string coercion', () => {
    const result = validate(72.3, { type: 'string' }, { coerce: true })

    expect(result.valid).to.equal(true)
    expect(result.instance).to.equal('72.3')
  })

  it('null => string coercion', () => {
    const result = validate(null, { type: 'string' }, { coerce: true })

    expect(result.valid).to.equal(true)
    expect(result.instance).to.equal('')
  })

  it('array => string coercion', () => {
    const result = validate(['nala'], { type: 'string' }, { coerce: true })

    expect(result.valid).to.equal(true)
    expect(result.instance).to.equal('nala')
  })

  it('string => boolean coercion', () => {
    const result = validate('true', { type: 'boolean' }, { coerce: true })

    expect(result.valid).to.equal(true)
    expect(result.instance).to.equal(true)
  })

  it('string => null coercion', () => {
    const result = validate('', { type: 'null' }, { coerce: true })

    expect(result.valid).to.equal(true)
    expect(result.instance).to.equal(null)
  })

  it('object property coercion', () => {
    const result = validate(
      {
        name: null,
        cool: 'true',
        cool2: 0,
        number: '5.12',
        integer: '5.12'
      },
      {
        type: 'object',
        properties: {
          name: { type: 'string' },
          cool: { type: 'boolean' },
          cool2: { type: 'boolean' },
          number: { type: 'number' },
          integer: { type: 'integer' }
        }
      },
      { coerce: true }
    )

    expect(result.valid).to.equal(true)
    expect(result.instance).to.deep.equal({
      name: '',
      cool: true,
      cool2: false,
      number: 5.12,
      integer: 5
    })
  })

  it('strictAdditionalProperties false', () => {
    const result = validate(
      {
        name: 'nala',
        extra: true
      },
      {
        type: 'object',
        properties: {
          name: { type: 'string' }
        }
      }
    )

    expect(result.valid).to.equal(true)
    expect(result.instance).to.deep.equal({
      name: 'nala',
      extra: true
    })
  })

  it('strictAdditionalProperties true', () => {
    const result = validate(
      {
        name: 'nala',
        extra: true
      },
      {
        type: 'object',
        properties: {
          name: { type: 'string' }
        }
      },
      { strictAdditionalProperties: true }
    )

    expect(result.valid).to.equal(false)
  })
})
