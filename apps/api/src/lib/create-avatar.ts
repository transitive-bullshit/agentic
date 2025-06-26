import { identicon } from '@dicebear/collection'
import { createAvatar as createAvatarImpl } from '@dicebear/core'

export function createAvatar(seed: string): string {
  return createAvatarImpl(identicon, { seed }).toDataUri()
}
