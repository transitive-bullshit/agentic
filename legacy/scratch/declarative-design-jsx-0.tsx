/* eslint-disable */
import React from 'react'
import { z } from 'zod'

// framework mocks
function LLMCall() {}
function System() {}
function User() {}
function Assistant() {}
function Example() {}

// TODO
// - [ ] handle reactive state?
// - [ ] handle side effects?
// - [ ] handle async?

async function ExampleLLMQuery({ texts }: { texts: string[] }) {
  const examples = [
    { input: 'The food was digusting', output: 'negative' },
    { input: 'We had a fantastic night', output: 'positive' },
    { input: 'Recommended', output: 'positive' },
    { input: 'The waiter was rude', output: 'negative' }
  ]

  return (
    <LLMCall
      model='gpt-4'
      temperature={0.1}
      output={z.array(z.object({ text: z.string(), label: z.string() }))}
    >
      <System>You are an expert sentiment-labelling assistant</System>

      {/* <ConversationHistory /> */}
      {/* <PineconeMemory /> */}

      <User>
        Label the following texts as positive or negative:
        {/* {texts.map((text) => `- ${text}\n`)} */}
        <ul>
          {texts.map((text, index) => (
            <li key={index}>{text}</li>
          ))}
        </ul>
      </User>

      <System>
        {examples.map((example) => (
          <Example {...example} />
        ))}
      </System>
    </LLMCall>
  )
}

ExampleLLMQuery({
  texts: [
    'I went to this place and it was just so awful.',
    'I had a great time.',
    'I had a terrible time.',
    'Food poisoning...'
  ]
})
