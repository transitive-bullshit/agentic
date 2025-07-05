import { type ClassValue, clsx } from 'clsx'
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
