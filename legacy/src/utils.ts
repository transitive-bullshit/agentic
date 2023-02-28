const uuidv4Re =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function isValidUUIDv4(str: string): boolean {
  return str && uuidv4Re.test(str)
}
