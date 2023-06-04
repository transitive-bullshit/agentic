import logger from 'debug'
import { v4 as uuidv4 } from 'uuid'

/**
 * Type of events that can occur within the library.
 */
export enum EventType {
  LLM_CALL = 'LLM_CALL',
  LLM_COMPLETION = 'LLM_COMPLETION'
}

/**
 * Severity levels of an event.
 */
export enum EventSeverity {
  DEBUG,
  INFO,
  WARNING,
  ERROR,
  CRITICAL
}

/*
 * Define minimum LOG_LEVEL, defaulting to EventSeverity.INFO if not provided or if an invalid value is provided. Any events below that level won't be logged to the console.
 */
let LOG_LEVEL: EventSeverity = EventSeverity.INFO
if (
  process.env.DEBUG_LOG_LEVEL &&
  EventSeverity[process.env.DEBUG_LOG_LEVEL.toUpperCase()] !== undefined
) {
  LOG_LEVEL = EventSeverity[process.env.DEBUG_LOG_LEVEL.toUpperCase()]
} else if (process.env.DEBUG_LOG_LEVEL) {
  throw new Error(`Invalid value for LOG_LEVEL: ${process.env.DEBUG_LOG_LEVEL}`)
}

/**
 * Define loggers for each severity level such that logs can be filtered by severity.
 */
const LOGGERS: Record<EventSeverity, ReturnType<typeof logger>> = {
  [EventSeverity.CRITICAL]: logger('agentic:events:critical'),
  [EventSeverity.ERROR]: logger('agentic:events:error'),
  [EventSeverity.WARNING]: logger('agentic:events:warning'),
  [EventSeverity.INFO]: logger('agentic:events:info'),
  [EventSeverity.DEBUG]: logger('agentic:events:debug')
}

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
  parentId?: string
  id?: string
  timestamp?: Date
  payload?: EventPayload
  severity?: EventSeverity
  version?: number
}

/**
 * Events that occur within the library (should be treated as immutable).
 */
export class Event {
  public readonly type: EventType
  public readonly parentId?: string
  public readonly id: string
  public readonly timestamp: Date
  public readonly payload?: EventPayload
  public readonly severity?: EventSeverity
  public readonly version: number

  constructor(type: EventType, data: EventData = {}) {
    this.type = type
    this.parentId = data.parentId ?? null
    this.id = data.id ?? uuidv4()
    this.timestamp = data.timestamp ?? new Date()
    this.payload = data.payload ? { ...data.payload } : {} // Only doing a shallow instead of a deep copy for performance reasons..
    this.severity = data.severity ?? EventSeverity.INFO
    this.version = data.version ?? 1 // Default to version 1 if not provided...
  }

  /**
   * Converts a JSON string representation of an event back into an Event object.
   */
  static fromJSON(json: string): Event {
    const { type, ...data } = JSON.parse(json)

    // Convert the timestamp back into a Date object, since `JSON.parse()` will have turned it into a string:
    data.timestamp = new Date(data.timestamp)
    const event = new Event(type, data)
    return event
  }

  /**
   * Converts the event to a JSON string representation.
   *
   * @returns JSON representation
   */
  toJSON(): string {
    return JSON.stringify({
      type: this.type,
      parentId: this.parentId,
      id: this.id,
      timestamp: this.timestamp.toISOString(),
      payload: this.payload,
      severity: this.severity,
      version: this.version
    })
  }

  /**
   * Converts the event to a human-readable string representation suitable for logging.
   *
   * @returns string representation
   */
  toString(): string {
    return `Event { type: ${this.type}, parentId: ${this.parentId}, id: ${
      this.id
    }, timestamp: ${this.timestamp.toISOString()}, payload: ${JSON.stringify(
      this.payload
    )}, severity: ${this.severity} }`
  }

  /**
   * Logs the event to the console.
   */
  log(): void {
    if (this.severity >= LOG_LEVEL) {
      const logger = LOGGERS[this.severity]
      logger(this.toString())
    }
  }
}
