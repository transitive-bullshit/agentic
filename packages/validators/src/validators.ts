import { isCuid } from '@paralleldrive/cuid2'
import emailValidator from 'email-validator'

import type { ParseIdentifierOptions } from './types'
import { namespaceBlacklist } from './namespace-blacklist'
import { parseDeploymentIdentifier } from './parse-deployment-identifier'
import { parseProjectIdentifier } from './parse-project-identifier'
import { toolNameBlacklist } from './tool-name-blacklist'

export const namespaceRe = /^[a-z0-9-]{1,256}$/
export const passwordRe = /^.{3,1024}$/

export const projectSlugRe = /^[a-z0-9-]{1,256}$/
export const deploymentHashRe = /^[a-z0-9]{8}$/

export const toolNameRe = /^[a-zA-Z_][a-zA-Z0-9_-]{0,63}$/

export function isValidEmail(value: string): boolean {
  return emailValidator.validate(value)
}

export function isValidNamespace(value?: string): boolean {
  return !!value && namespaceRe.test(value)
}

export function isNamespaceAllowed(value?: string): boolean {
  return !!value && isValidNamespace(value) && !namespaceBlacklist.has(value)
}

export function isValidUsername(value?: string): boolean {
  return isValidNamespace(value)
}

export function isValidTeamSlug(value?: string): boolean {
  return isValidNamespace(value)
}

export function isValidPassword(value?: string): boolean {
  return !!value && passwordRe.test(value)
}

export function isValidProjectSlug(value?: string): boolean {
  return !!value && projectSlugRe.test(value)
}

export function isValidDeploymentHash(value?: string): boolean {
  return !!value && deploymentHashRe.test(value)
}

export function isValidProjectIdentifier(
  value?: string,
  opts?: ParseIdentifierOptions
): boolean {
  try {
    return !!parseProjectIdentifier(value, opts)
  } catch {
    return false
  }
}

export function isValidDeploymentIdentifier(
  value?: string,
  opts?: ParseIdentifierOptions
): boolean {
  try {
    return !!parseDeploymentIdentifier(value, opts)
  } catch {
    return false
  }
}

export function isValidToolName(value?: string): boolean {
  return !!value && toolNameRe.test(value)
}

export function isToolNameAllowed(value?: string): boolean {
  return !!value && isValidToolName(value) && !toolNameBlacklist.has(value)
}

export function isValidCuid(value?: string): boolean {
  return !!value && isCuid(value)
}
