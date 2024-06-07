/**
 * Slightly modified version of [tiny-invariant](https://github.com/alexreardon/tiny-invariant).
 *
 * `assert` is used to [assert](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#assertion-functions) that the `condition` is [truthy](https://github.com/getify/You-Dont-Know-JS/blob/bdbe570600d4e1107d0b131787903ca1c9ec8140/up%20%26%20going/ch2.md#truthy--falsy).
 *
 * 💥 `assert` will `throw` an `Error` if the `condition` is [falsey](https://github.com/getify/You-Dont-Know-JS/blob/bdbe570600d4e1107d0b131787903ca1c9ec8140/up%20%26%20going/ch2.md#truthy--falsy)
 *
 * @example
 *
 * ```ts
 * const value: Person | null = { name: 'Alex' };
 * assert(value, 'Expected value to be a person');
 * // type of `value`` has been narrowed to `Person`
 * ```
 */
export function assert(
  condition: any,
  /**
   * Can provide a string, or a function that returns a string for cases where
   * the message takes a fair amount of effort to compute.
   */
  message?: string | (() => string)
): asserts condition {
  if (condition) {
    return
  }

  const providedMessage: string | undefined =
    typeof message === 'function' ? message() : message

  throw new Error(providedMessage ?? 'Assertion failed')
}
