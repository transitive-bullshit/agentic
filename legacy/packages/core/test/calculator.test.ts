import test from 'ava'
import { expectTypeOf } from 'expect-type'

import { CalculatorTool } from '@/tools/calculator'

import { createTestAgenticRuntime } from './_utils'

test('CalculatorTool', async (t) => {
  const agentic = createTestAgenticRuntime()
  const tool = new CalculatorTool({ agentic })

  const res = await tool.call({ expression: '1 + 1' })
  t.is(res, 2)
  expectTypeOf(res).toMatchTypeOf<number>()

  const res2 = await tool.callWithMetadata({ expression: 'cos(0)' })
  t.is(res2.result, 1)
  expectTypeOf(res2.result).toMatchTypeOf<number>()

  const { taskId, callId, parentCallId, parentTaskId, ...metadata } =
    res2.metadata
  t.true(typeof taskId === 'string')
  t.true(typeof callId === 'string')
  t.deepEqual(metadata, {
    success: true,
    taskName: 'calculator',
    cacheStatus: 'miss',
    numRetries: 0,
    error: undefined
  })
})

test('CalculatorTool - caching', async (t) => {
  const agentic = createTestAgenticRuntime()
  const tool = new CalculatorTool({ agentic })

  const res00 = await tool.callWithMetadata({ expression: '2 * 3' })
  t.is(res00.result, 6)
  t.is(res00.metadata.cacheStatus, 'miss')
  expectTypeOf(res00.result).toMatchTypeOf<number>()

  const res01 = await tool.callWithMetadata({ expression: '2 * 3' })
  t.is(res01.result, 6)
  t.is(res01.metadata.cacheStatus, 'hit')

  const res02 = await tool.callWithMetadata({ expression: '4 + 3' })
  t.is(res02.result, 7)
  t.is(res02.metadata.cacheStatus, 'miss')

  const res03 = await tool.callWithMetadata({ expression: '2 * 3' })
  t.is(res03.result, 6)
  t.is(res03.metadata.cacheStatus, 'hit')

  const tool2 = new CalculatorTool({ agentic })
  const res20 = await tool2.callWithMetadata({ expression: '2 * 3' })
  t.is(res20.result, 6)
  t.is(res20.metadata.cacheStatus, 'miss')
})

test('CalculatorTool - disable caching', async (t) => {
  const agentic = createTestAgenticRuntime()
  const tool = new CalculatorTool({
    agentic,
    cacheConfig: { cacheStrategy: 'none' }
  })

  const res00 = await tool.callWithMetadata({ expression: '2 * 3' })
  t.is(res00.result, 6)
  t.is(res00.metadata.cacheStatus, 'miss')
  expectTypeOf(res00.result).toMatchTypeOf<number>()

  const res01 = await tool.callWithMetadata({ expression: '2 * 3' })
  t.is(res01.result, 6)
  t.is(res01.metadata.cacheStatus, 'miss')

  const res02 = await tool.callWithMetadata({ expression: '4 + 3' })
  t.is(res02.result, 7)
  t.is(res02.metadata.cacheStatus, 'miss')

  const res03 = await tool.callWithMetadata({ expression: '2 * 3' })
  t.is(res03.result, 6)
  t.is(res03.metadata.cacheStatus, 'miss')

  const tool2 = new CalculatorTool({
    agentic,
    cacheConfig: { cacheStrategy: 'default' }
  })
  const res20 = await tool2.callWithMetadata({ expression: '2 * 3' })
  t.is(res20.result, 6)
  t.is(res20.metadata.cacheStatus, 'miss')

  const res21 = await tool2.callWithMetadata({ expression: '2 * 3' })
  t.is(res21.result, 6)
  t.is(res21.metadata.cacheStatus, 'hit')
})
