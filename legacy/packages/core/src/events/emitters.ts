import { EventEmitter } from 'eventemitter3'

import * as types from '@/types'
import type { Agentic } from '@/agentic'
import { BaseTask } from '@/task'

import { TaskEvent, TaskStatus } from './event'

/**
 * Event emitter for task events.
 */
export class TaskEventEmitter<
  TInput extends types.TaskInput = void,
  TOutput extends types.TaskOutput = string
> extends EventEmitter {
  protected _agentic: Agentic
  protected _task: BaseTask<TInput, TOutput>

  constructor(task: BaseTask<TInput, TOutput>, agentic: Agentic) {
    super()

    this._task = task
    this._agentic = agentic
  }

  on<T extends string | symbol>(
    takStatus: T,
    fn: (event: TaskEvent<TInput, TOutput>) => void,
    context?: any
  ): this {
    return super.on(takStatus, fn, context)
  }

  emit(taskStatus: string | symbol, payload: object = {}): boolean {
    if (!Object.values(TaskStatus).includes(taskStatus as TaskStatus)) {
      throw new Error(`Invalid task status: ${String(taskStatus)}`)
    }

    const { id, nameForModel } = this._task
    const event = new TaskEvent<TInput, TOutput>({
      payload: {
        taskStatus: taskStatus as TaskStatus,
        taskId: id,
        taskName: nameForModel,
        ...payload
      }
    })
    this._agentic.taskTracker.addEvent(event)

    this._agentic.eventEmitter.emit(taskStatus, event)

    return super.emit(taskStatus, event)
  }
}
