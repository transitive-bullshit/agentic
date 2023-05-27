import Handlebars from 'handlebars'
import QuickLRU from 'quick-lru'

const lru = new QuickLRU({ maxSize: 1000 })

export function getCompiledTemplate(template: string) {
  let compiledTemplate = lru.get(template) as HandlebarsTemplateDelegate

  if (compiledTemplate) {
    return compiledTemplate
  }

  compiledTemplate = Handlebars.compile(template, {
    noEscape: true
  })

  lru.set(template, compiledTemplate)
  return compiledTemplate
}
