import { toJsxRuntime } from 'hast-util-to-jsx-runtime'
import { Fragment, type JSX, useEffect, useState } from 'react'
import { jsx, jsxs } from 'react/jsx-runtime'
import { type BundledLanguage, codeToHast } from 'shiki/bundle/web'

import { LoadingIndicator } from './loading-indicator'

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
}) {
  const out = await codeToHast(code, {
    lang,
    theme,
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

  return toJsxRuntime(out, {
    Fragment,
    jsx,
    jsxs
  }) as JSX.Element
}

export function CodeBlock({
  initial,
  code,
  lang,
  theme,
  className
}: {
  initial?: JSX.Element
  code: string
  lang?: BundledLanguage
  theme?: string
  className?: string
}) {
  const [nodes, setNodes] = useState(initial)

  useEffect(() => {
    void highlight({ code, lang, theme, className }).then(setNodes)
  }, [code, lang, theme, className])

  return nodes ?? <LoadingIndicator />
}
