export function isDurableObjectNamespace(
  namespace: unknown
): namespace is DurableObjectNamespace {
  return (
    typeof namespace === 'object' &&
    namespace !== null &&
    'newUniqueId' in namespace &&
    typeof namespace.newUniqueId === 'function' &&
    'idFromName' in namespace &&
    typeof namespace.idFromName === 'function'
  )
}
