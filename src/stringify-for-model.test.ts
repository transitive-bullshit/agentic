import { describe, expect, it } from 'vitest'

import { stringifyForModel } from './stringify-for-model.js'

describe('stringifyForModel', () => {
  it('handles basic objects', () => {
    const input = {
      foo: 'bar',
      nala: ['is', 'cute'],
      kittens: null,
      cats: undefined,
      paws: 4.3
    }
    const result = stringifyForModel(input)
    expect(result).toEqual(JSON.stringify(input, null))
  })

  it('handles empty input', () => {
    const result = stringifyForModel()
    expect(result).toEqual('')
  })
})
