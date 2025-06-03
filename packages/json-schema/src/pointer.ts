export function encodePointer(p: string): string {
  return encodeURI(escapePointer(p))
}

export function escapePointer(p: string): string {
  return p.replaceAll('~', '~0').replaceAll('/', '~1')
}
