export { AbortError, type FailedAttemptError } from 'p-retry'

export class RetryableError extends Error {}

export class ParseError extends RetryableError {}
