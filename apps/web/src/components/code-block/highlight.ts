import { toJsxRuntime } from 'hast-util-to-jsx-runtime'
import { Fragment, type JSX } from 'react'
import { jsx, jsxs } from 'react/jsx-runtime'
import { type BundledLanguage, codeToHast } from 'shiki/bundle/web'

import { cn } from '@/lib/utils'

// TODO: consider adding [twoslash](https://shiki.style/packages/twoslash)

export async function highlight({
  code,
  lang = 'ts',
  theme = 'github-dark',
  className
}: {
  code: string
  lang?: BundledLanguage
  theme?: string
  className?: string
}): Promise<JSX.Element> {
  className = cn('w-full text-wrap p-2 md:p-4 text-sm rounded-sm', className)

  const hast = await codeToHast(code, {
    lang,
    theme,
    // TODO: use a custom `pre` element down below instead of this
    transformers: [
      {
        pre(node) {
          if (className) {
            this.addClassToHast(node, className)
          }
        }
      }
    ]
  })

  return toJsxRuntime(hast, {
    Fragment,
    jsx,
    jsxs
  })
}
