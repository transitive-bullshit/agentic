import { type ClassValue, clsx } from 'clsx'
import prettyMs from 'pretty-ms'
import { twMerge } from 'tailwind-merge'

export { default as humanNumber } from 'human-number'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function randomInRange(min: number, max: number) {
  return Math.random() * (max - min) + min
}

export function pricingAmountToFixedString(amount: number): string {
  const output = (amount / 100)
    // Cap the precision to 10 because of floating point issues
    // (could remove this constraint in the future by not dividing by 100
    // and handling the precision manually if needed)
    .toFixed(10)
    .replace(/0+$/, '')
    .replace(/\.0*$/, '.00')
    // (not a $ sign, but a substitution $1)
    .replace(/(\.\d)$/, '$10')

  if (output === '0.00') {
    return '0'
  }

  return output
}

export function getRateLimitIntervalLabel(rateLimitInterval: number): string {
  const label = prettyMs(rateLimitInterval * 1000, {
    verbose: true
  })

  if (label === '1 second') {
    return 'second'
  }

  if (label === '1 minute') {
    return 'minute'
  }

  if (label === '1 hour') {
    return 'hour'
  }

  if (label === '1 day') {
    return 'day'
  }

  if (label === '1 week') {
    return 'week'
  }

  if (label === '1 month') {
    return 'month'
  }

  if (label === '1 year') {
    return 'year'
  }

  return label
}
