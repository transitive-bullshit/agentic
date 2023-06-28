import { EventEmitter } from 'eventemitter3'

import * as types from '@/types'
import { BaseTask } from '@/task'

import { TaskEvent, TaskStatus } from './event'

export class TaskEventEmitter<
  TInput extends types.TaskInput = void,
  TOutput extends types.TaskOutput = string
> extends EventEmitter {
  protected _task: BaseTask<TInput, TOutput>

  constructor(task: BaseTask<TInput, TOutput>) {
    super()

    this._task = task
  }

  emit(taskStatus: string | symbol, payload: object = {}): boolean {
    if (!Object.values(TaskStatus).includes(taskStatus as TaskStatus)) {
      return false
    }

    const event = new TaskEvent({
      payload: {
        taskStatus: taskStatus as TaskStatus,
        taskId: this._task.id,
        taskName: this._task.nameForModel,
        ...payload
      }
    })
    return super.emit(taskStatus, event)
  }
}
