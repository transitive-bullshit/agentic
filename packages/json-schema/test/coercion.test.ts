import { describe, expect, it } from 'vitest'

import { validate } from '../src/index'

describe('json-schema coercion', () => {
  it('string => number coercion', () => {
    const result = validate('7', { type: 'number' }, '2019-09', undefined, true)

    expect(result.valid).to.equal(true)
    expect(result.instance).to.equal(7)
  })

  it('boolean => number coercion', () => {
    const result = validate(
      true,
      { type: 'number' },
      '2019-09',
      undefined,
      true
    )

    expect(result.valid).to.equal(true)
    expect(result.instance).to.equal(1)
  })

  it('null => number coercion', () => {
    const result = validate(
      null,
      { type: 'number' },
      '2019-09',
      undefined,
      true
    )

    expect(result.valid).to.equal(true)
    expect(result.instance).to.equal(0)
  })

  it('array => number coercion', () => {
    const result = validate([1], { type: 'number' }, '2019-09', undefined, true)

    expect(result.valid).to.equal(true)
    expect(result.instance).to.equal(1)
  })

  it('boolean => string coercion', () => {
    const result = validate(
      true,
      { type: 'string' },
      '2019-09',
      undefined,
      true
    )

    expect(result.valid).to.equal(true)
    expect(result.instance).to.equal('true')
  })

  it('number => string coercion', () => {
    const result = validate(
      72.3,
      { type: 'string' },
      '2019-09',
      undefined,
      true
    )

    expect(result.valid).to.equal(true)
    expect(result.instance).to.equal('72.3')
  })

  it('null => string coercion', () => {
    const result = validate(
      null,
      { type: 'string' },
      '2019-09',
      undefined,
      true
    )

    expect(result.valid).to.equal(true)
    expect(result.instance).to.equal('')
  })

  it('array => string coercion', () => {
    const result = validate(
      ['nala'],
      { type: 'string' },
      '2019-09',
      undefined,
      true
    )

    expect(result.valid).to.equal(true)
    expect(result.instance).to.equal('nala')
  })

  it('string => boolean coercion', () => {
    const result = validate(
      'true',
      { type: 'boolean' },
      '2019-09',
      undefined,
      true
    )

    expect(result.valid).to.equal(true)
    expect(result.instance).to.equal(true)
  })

  it('string => null coercion', () => {
    const result = validate('', { type: 'null' }, '2019-09', undefined, true)

    expect(result.valid).to.equal(true)
    expect(result.instance).to.equal(null)
  })
})
