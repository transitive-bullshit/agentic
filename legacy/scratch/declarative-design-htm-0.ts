/* eslint-disable */
import { z } from 'zod'

// framework mocks
function htm(...params: any[]) {
  return (...p: any[]) => ``
}
htm.System = function System() {}
htm.User = function User() {}
htm.Assistant = function Assistant() {}
htm.Example = function Example() {}
const $: any = {}

async function ExampleLLMQuery({ texts }: { texts: string[] }) {
  const examples = [
    { input: 'The food was digusting', output: 'negative' },
    { input: 'We had a fantastic night', output: 'positive' },
    { input: 'Recommended', output: 'positive' },
    { input: 'The waiter was rude', output: 'negative' }
  ]

  // TODO: this doesn't handle type inference
  const prompt = htm`
    <System>You are an expert sentiment-labelling assistant</System>

    <User>
      Label the following texts as positive or negative:

      <ul>
        ${texts.map((text) => htm`<li>${text}</li>`)}
      </ul>
    </User>

    <System>
      ${examples.map((example) => htm`<${htm.Example} ...${example} />`)}
    </System>

    <Output schema=${z.array(
      z.object({ text: z.string(), label: z.string() })
    )} />
  `

  return $.gpt4(prompt)
}

ExampleLLMQuery({
  texts: [
    'I went to this place and it was just so awful.',
    'I had a great time.',
    'I had a terrible time.',
    'Food poisoning...'
  ]
})
