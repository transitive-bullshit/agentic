import { remark } from 'remark'
import stripMarkdown from 'strip-markdown'

export function markdownToText(markdown?: string): string {
  return remark()
    .use(stripMarkdown)
    .processSync(markdown ?? '')
    .toString()
}
