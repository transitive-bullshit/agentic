import emailValidator from 'email-validator'
import isRelativeUrl from 'is-relative-url'

export const usernameRe = /^[a-zA-Z0-9-]{1,64}$/
export const passwordRe = /^.{3,1024}$/

export const projectNameRe = /^[a-z0-9-]{3,64}$/
export const deploymentHashRe = /^[a-z0-9]{8}$/

export const projectRe = /^[a-zA-Z0-9-]{1,64}\/[a-z0-9-]{3,64}$/
export const deploymentRe = /^[a-zA-Z0-9-]{1,64}\/[a-z0-9-]{3,64}@[a-z0-9]{8}$/

// service names may be any valid JavaScript identifier
// TODO: should service names be any label?
export const serviceNameRe = /^[a-zA-Z_][a-zA-Z0-9_]*$/
export const servicePathRe = /^\/[a-zA-Z0-9\-._~%!$&'()*+,;=:/]*$/

export function email(value: string): boolean {
  return emailValidator.validate(value)
}

export function username(value: string): boolean {
  return !!value && usernameRe.test(value)
}

export function password(value: string): boolean {
  return !!value && passwordRe.test(value)
}

export function projectName(value: string): boolean {
  return !!value && projectNameRe.test(value)
}

export function deploymentHash(value: string): boolean {
  return !!value && deploymentHashRe.test(value)
}

export function project(value: string): boolean {
  return !!value && projectRe.test(value)
}

export function deployment(value: string): boolean {
  return !!value && deploymentRe.test(value)
}

export function serviceName(value: string): boolean {
  return !!value && serviceNameRe.test(value)
}

export function servicePath(value: string): boolean {
  return !!value && servicePathRe.test(value) && isRelativeUrl(value)
}
