export interface Logger {
  trace(message?: any, ...detail: any[]): void
  debug(message?: any, ...detail: any[]): void
  info(message?: any, ...detail: any[]): void
  warn(message?: any, ...detail: any[]): void
  error(message?: any, ...detail: any[]): void
}
