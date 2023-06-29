import test from 'ava'

import { getChatMessageFunctionDefinitionFromTask } from '@/llms/llm-utils'
import { CalculatorTool } from '@/tools/calculator'

import { createTestAgenticRuntime } from '../_utils'

test('getChatMessageFunctionDefinitionFromTask', async (t) => {
  const agentic = createTestAgenticRuntime()

  const tool = new CalculatorTool({ agentic })
  const functionDefinition = getChatMessageFunctionDefinitionFromTask(tool)

  t.is(functionDefinition.name, 'calculator')
  t.is(functionDefinition.description, tool.descForModel)

  console.log(JSON.stringify(functionDefinition, null, 2))
  t.snapshot(functionDefinition)
})
