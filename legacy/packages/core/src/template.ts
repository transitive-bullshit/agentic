import Handlebars from 'handlebars'
import QuickLRU from 'quick-lru'

import { TemplateValidationError } from './errors'

export type CompiledTemplate = (data: unknown) => string

const lru = new QuickLRU<string, CompiledTemplate>({ maxSize: 1000 })

export function getCompiledTemplate(template: string) {
  let compiledTemplate = lru.get(template)

  if (compiledTemplate) {
    return compiledTemplate
  }

  const handlebarsTemplate = Handlebars.compile(template, {
    noEscape: true,
    strict: true,
    knownHelpers: {},
    knownHelpersOnly: true
  })

  compiledTemplate = (data: unknown) => {
    try {
      return handlebarsTemplate(data)
    } catch (err: any) {
      const msg = err.message?.replace('[object Object]', 'input')
      const message = ['Template error', msg].filter(Boolean).join(': ')
      throw new TemplateValidationError(message, { cause: err })
    }
  }

  lru.set(template, compiledTemplate)
  return compiledTemplate
}
