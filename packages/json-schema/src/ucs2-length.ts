/* eslint-disable eqeqeq */
/* eslint-disable unicorn/prefer-code-point */

/**
 * Get UCS-2 length of a string
 * https://mathiasbynens.be/notes/javascript-encoding
 * https://github.com/bestiejs/punycode.js - punycode.ucs2.decode
 */
export function ucs2length(s: string): number {
  const length = s.length
  let result = 0
  let index = 0
  let charCode: number
  while (index < length) {
    result++
    charCode = s.charCodeAt(index++)
    if (charCode >= 0xd8_00 && charCode <= 0xdb_ff && index < length) {
      // high surrogate, and there is a next character
      charCode = s.charCodeAt(index)
      if ((charCode & 0xfc_00) == 0xdc_00) {
        // low surrogate
        index++
      }
    }
  }
  return result
}
