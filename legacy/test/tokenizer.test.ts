import test from 'ava'

import * as tokenizers from '@/tokenizer'

import './_utils'

const models = [
  'gpt-3.5-turbo',
  'gpt-4',
  'gpt-4',
  'gpt-4',
  'gpt-4',
  'gpt-4',
  'gpt-4',
  'gpt-4-0613',
  'text-davinci-003',
  'code-davinci-002'
]

for (let i = 0; i < models.length; ++i) {
  const model = models[i]
  test(`getTokenizerForModel ${model} (${i})`, async (t) => {
    t.timeout(10_000)

    const tokenizer = await tokenizers.getTokenizerForModel(model)
    t.truthy(tokenizer)

    const texts = ['Hello World!', 'foo\n\nbar. 123 and also -- 456']

    for (const text of texts) {
      const encoded = tokenizer.encode(text)
      t.true(encoded.length > 0)

      const decoded = tokenizer.decode(encoded)
      t.is(decoded, text)
    }
  })
}
