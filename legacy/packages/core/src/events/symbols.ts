import isUnicodeSupported from 'is-unicode-supported'

const UNICODE_SYMBOLS = {
  ARROW_RIGHT: '→',
  CIRCLE: '●',
  WARNING: '▲',
  CROSS: '⨯',
  SQUARE_SMALL_FILLED: '◼',
  SPINNER: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
  BAR_START: '┌',
  BAR: '│',
  BAR_END: '└',
  ACTIVE: '◆',
  LEFT_ARROW: '←',
  RIGHT_ARROW: '→'
}
const ASCII_SYMBOLS = {
  ARROW_RIGHT: '→',
  CIRCLE: '•',
  WARNING: '‼',
  CROSS: '×',
  SQUARE_SMALL_FILLED: '■',
  SPINNER: ['-', '\\', '|', '/'],
  BAR_START: 'T',
  BAR: '|',
  BAR_END: '—',
  ACTIVE: '*',
  LEFT_ARROW: '<',
  RIGHT_ARROW: '>'
}

export const SYMBOLS = isUnicodeSupported() ? UNICODE_SYMBOLS : ASCII_SYMBOLS
