import { defaultIDGeneratorFn } from '@/utils'

/**
 * Payload of an event.
 */
interface EventPayload {
  [key: string]: unknown
}

/**
 * Data required to create a new Event object.
 */
interface EventData<T extends EventPayload> {
  id?: string
  timestamp?: Date
  payload?: T
  version?: number
  type?: string
}

/**
 * Events that occur within the library (should be treated as immutable).
 */
export class Event<T extends EventPayload> {
  public readonly id: string
  public readonly timestamp: Date
  public readonly payload?: T
  public readonly version: number

  constructor(data: EventData<T> = {}) {
    this.id = defaultIDGeneratorFn()
    this.timestamp = data.timestamp ?? new Date()
    this.payload = data.payload
      ? JSON.parse(JSON.stringify(data.payload))
      : undefined
    this.version = data.version ?? 1
  }

  /**
   * Converts a JSON string representation of an event back into an Event object.
   */
  static fromJSON<T extends EventPayload>(json: string): Event<T> {
    const data = JSON.parse(json)
    data.timestamp = new Date(data.timestamp)
    let Type
    switch (data.type) {
      case 'TaskEvent':
        Type = TaskEvent
        break
      case 'Event':
        Type = Event
        break
      default:
        throw new Error(`Unknown event type: ${data.type}`)
    }

    return new Type(data)
  }

  toJSON(): string {
    return JSON.stringify({
      id: this.id,
      timestamp: this.timestamp.toISOString(),
      payload: this.payload,
      version: this.version,
      type: this.constructor.name
    })
  }

  toString(): string {
    return `Event { id: ${
      this.id
    }, timestamp: ${this.timestamp.toISOString()}, payload: ${JSON.stringify(
      this.payload
    )} }`
  }
}

/**
 * Payload of a task event.
 */
interface TaskEventPayload extends EventPayload {
  taskName: string
  taskId: string
  taskStatus: TaskStatus
  taskInputs?: any // Consider replacing 'any' with the actual task data type if possible.,
  taskOutput?: any // Consider replacing 'any' with the actual task data type if possible.,
  taskParent?: string
}

/**
 * Status of a task.
 */
export enum TaskStatus {
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  RETRYING = 'RETRYING',
  SKIPPED = 'SKIPPED',
  RUNNING = 'RUNNING',
  CANCELLED = 'CANCELLED'
}

/**
 * Events that occur within the library related to tasks.
 */
export class TaskEvent extends Event<TaskEventPayload> {
  get name(): string {
    return this.payload?.taskName ?? ''
  }

  get taskId(): string {
    return this.payload?.taskId ?? ''
  }

  get status(): TaskStatus {
    return this.payload?.taskStatus ?? TaskStatus.RUNNING
  }

  get inputs(): any {
    return this.payload?.taskInputs ?? ''
  }

  get output(): any {
    return this.payload?.taskOutput ?? ''
  }

  get parent(): string {
    return this.payload?.taskParent ?? 'root'
  }
}
