import { Jsonifiable } from '@/types'
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
interface EventData {
  id?: string
  timestamp?: Date
  payload?: EventPayload
  version?: number
}

/**
 * Events that occur within the library (should be treated as immutable).
 */
export class Event {
  public readonly id: string
  public readonly timestamp: Date
  public readonly payload?: EventPayload
  public readonly version: number

  constructor(data: EventData = {}) {
    this.id = defaultIDGeneratorFn()
    this.timestamp = data.timestamp ?? new Date()

    this.payload = data.payload
      ? JSON.parse(JSON.stringify(data.payload))
      : undefined
    this.version = data.version ?? 1 // Default to version 1 if not provided...
  }

  /**
   * Converts a JSON string representation of an event back into an Event object.
   */
  static fromJSON(json: string): Event {
    const data = JSON.parse(json)

    // Convert the timestamp back into a Date object, since `JSON.parse()` will have turned it into a string:
    data.timestamp = new Date(data.timestamp)
    const event = new Event(data)
    return event
  }

  /**
   * Converts the event to a JSON string representation.
   *
   * @returns JSON representation
   */
  toJSON(): string {
    return JSON.stringify({
      id: this.id,
      timestamp: this.timestamp.toISOString(),
      payload: this.payload,
      version: this.version
    })
  }

  /**
   * Converts the event to a human-readable string representation suitable for logging.
   *
   * @returns string representation
   */
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
  taskInputs: any // Consider replacing 'any' with the actual task data type if possible.,
  taskOutput?: any // Consider replacing 'any' with the actual task data type if possible.,
  taskParent?: string
}

/**
 * Data required to create a new TaskEvent object.
 */
interface TaskEventData extends EventData {
  payload?: TaskEventPayload
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
export class TaskEvent extends Event {
  public readonly name: string
  public readonly taskId: string
  public readonly status: TaskStatus
  public readonly inputs: any
  public readonly output?: Jsonifiable
  public readonly parent?: string

  constructor(data: TaskEventData = {}) {
    super(data)

    this.name = data.payload?.taskName ?? ''
    this.taskId = data.payload?.taskId ?? ''
    this.status = data.payload?.taskStatus ?? TaskStatus.RUNNING
    this.inputs = data.payload?.taskData ?? ''
    this.output = data.payload?.taskOutput ?? ''
    this.parent = data.payload?.taskParent ?? 'root'
  }

  /**
   * Converts a JSON string representation of a task event back into a TaskEvent object.
   */
  static fromJSON(json: string): TaskEvent {
    const data = JSON.parse(json)
    // Convert the timestamp back into a Date object, since `JSON.parse()` will have turned it into a string:
    data.timestamp = new Date(data.timestamp)
    const taskEvent = new TaskEvent(data)
    return taskEvent
  }

  /**
   * Converts the task event to a JSON string representation.
   */
  toJSON(): string {
    return JSON.stringify({
      id: this.id,
      timestamp: this.timestamp.toISOString(),
      payload: this.payload,
      version: this.version
    })
  }

  /**
   * Converts the task event to a human-readable string representation suitable for logging.
   */
  toString(): string {
    return `TaskEvent { id: ${
      this.id
    }, timestamp: ${this.timestamp.toISOString()}, payload: ${JSON.stringify(
      this.payload
    )} }`
  }
}
