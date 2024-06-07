import { useRouter } from 'next/router'
import { DocsThemeConfig, useConfig } from 'nextra-theme-docs'

import Title from './components/title.tsx'

const siteHost = 'agentic.co/docs'
const siteUrl = `https://${siteHost}`
const siteSocialUrl = `${siteUrl}/social.png`
const siteDesc = 'Build reliable AI Agents with TypeScript.'
const siteTitle = 'agentic'

const config: DocsThemeConfig = {
  logo: (
    <img
      src='/agentic-logo.png'
      alt='agentic'
      className='logo'
      width='1638'
      height='675'
      style={{
        height: 48,
        maxHeight: 48,
        width: 'auto'
      }}
    />
  ),

  project: {
    link: 'https://github.com/transitive-bullshit/agentic'
  },
  docsRepositoryBase:
    'https://github.com/transitive-bullshit/agentic/blob/main/docs',
  editLink: {
    text: 'Edit this page on GitHub'
  },
  useNextSeoProps() {
    const { asPath } = useRouter()
    if (asPath === '/') {
      return {
        titleTemplate: siteTitle
      }
    } else {
      return {
        titleTemplate: `%s – ${siteTitle}`
      }
    }
  },
  sidebar: {
    titleComponent: (props) => <Title {...props} />,
    toggleButton: true
  },
  head: function useHead() {
    const config = useConfig()
    const { asPath } = useRouter()
    const isIndex = asPath === '/'
    const title =
      config?.title && !isIndex ? `${config.title} - ${siteTitle}` : siteTitle

    return (
      <>
        <meta httpEquiv='Content-Language' content='en' />
        <meta name='viewport' content='width=device-width, initial-scale=1.0' />
        <meta name='robots' content='index,follow' />

        <meta name='description' content={siteDesc} />
        <meta property='og:description' content={siteDesc} />
        <meta name='twitter:description' content={siteDesc} />

        <meta property='og:site_name' content={siteTitle} />
        <meta name='apple-mobile-web-app-title' content={siteTitle} />

        <meta name='twitter:card' content='summary_large_image' />
        <meta name='twitter:image' content={siteSocialUrl} />
        <meta name='og:image' content={siteSocialUrl} />

        <meta property='twitter:domain' content={siteHost} />
        <meta name='twitter:site:domain' content={siteHost} />

        <meta name='twitter:url' content={siteUrl} />

        <meta property='og:title' content={title} />
        <meta name='twitter:title' content={title} />
        <title>{title}</title>

        <link rel='shortcut icon' href='/favicon.ico' />
        <link
          rel='icon'
          type='image/png'
          sizes='32x32'
          href='/favicon-32.png'
        />

        <style>
          {`
          ul.nx-mt-6 {
            margin-top: 0;
          }
          `}
        </style>
      </>
    )
  },
  footer: {
    text: (
      <span>
        {new Date().getFullYear()} ©{' '}
        <a href='https://agentic.so' target='_blank'>
          agentic
        </a>
        .
      </span>
    )
  }
}

export default config
