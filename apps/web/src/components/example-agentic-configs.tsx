'use client'

import type { BundledLanguage } from 'shiki/bundle/web'
import { useLocalStorage } from 'react-use'

import { CodeBlock } from '@/components/code-block'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { LoadingIndicator } from './loading-indicator'

const formatLabels = {
  typescript: 'TypeScript',
  json: 'JSON'
} as const
const formats = Object.keys(formatLabels) as (keyof typeof formatLabels)[]
type Format = (typeof formats)[number]

const originAdaptorLabels = {
  mcp: 'MCP',
  openapi: 'OpenAPI'
} as const
const originAdaptors = Object.keys(
  originAdaptorLabels
) as (keyof typeof originAdaptorLabels)[]
type OriginAdaptor = (typeof originAdaptors)[number]

type ExampleAgenticConfig = {
  format: Format
  originAdaptor: OriginAdaptor
}

const defaultExampleAgenticConfig: ExampleAgenticConfig = {
  format: 'typescript',
  originAdaptor: 'mcp'
}

type CodeSnippet = {
  code: string
  lang: BundledLanguage
}

export function ExampleAgenticConfigs() {
  const [config, setConfig] = useLocalStorage<ExampleAgenticConfig>(
    'example-agentic-config',
    defaultExampleAgenticConfig
  )

  if (!config) {
    return <LoadingIndicator className='w-full max-w-3xl' />
  }

  return (
    <div className='w-full max-w-3xl flex flex-col items-center border rounded-lg shadow-sm p-2 md:p-4 bg-background'>
      <ExampleAgenticConfigsContent config={config} setConfig={setConfig} />
    </div>
  )
}

function ExampleAgenticConfigsContent({
  config,
  setConfig
}: {
  config: ExampleAgenticConfig
  setConfig: (config: ExampleAgenticConfig) => void
}) {
  const codeSnippet = getCodeSnippetForExampleAgenticConfig(config)

  return (
    <Tabs
      defaultValue={config!.format}
      onValueChange={(value) =>
        setConfig({
          ...defaultExampleAgenticConfig,
          ...config,
          format: value as Format
        })
      }
      className='w-full max-w-3xl'
    >
      <TabsList>
        {formats.map((format) => (
          <TabsTrigger key={format} value={format} className='cursor-pointer'>
            {formatLabels[format]}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value={config.format} className='w-full'>
        <Tabs
          defaultValue={config.originAdaptor}
          onValueChange={(value) =>
            setConfig({
              ...defaultExampleAgenticConfig,
              ...config,
              originAdaptor: value as OriginAdaptor
            })
          }
          className='w-full'
        >
          <TabsList className='w-full h-auto flex-wrap'>
            {originAdaptors.map((originAdaptor) => (
              <TabsTrigger
                key={originAdaptor}
                value={originAdaptor}
                className='cursor-pointer text-xs!'
              >
                {originAdaptorLabels[originAdaptor]}
              </TabsTrigger>
            ))}
          </TabsList>

          {originAdaptors.map((originAdaptor) => (
            <TabsContent
              key={originAdaptor}
              value={originAdaptor}
              className='w-full flex flex-col gap-2'
            >
              <div className='text-sm text-gray-500'>
                {config.format === 'typescript'
                  ? 'agentic.config.ts'
                  : 'agentic.config.json'}
              </div>

              <CodeBlock code={codeSnippet.code} lang={codeSnippet.lang} />
            </TabsContent>
          ))}
        </Tabs>
      </TabsContent>
    </Tabs>
  )
}

function getCodeSnippetForExampleAgenticConfig(
  config: ExampleAgenticConfig
): CodeSnippet {
  if (config.format === 'typescript') {
    if (config.originAdaptor === 'mcp') {
      return {
        code: `
import { defineConfig } from '@agentic/platform'

export default defineConfig({
  name: 'mcp-example',
  origin: {
    type: 'mcp',
    // Your origin MCP server URL supporting the streamable HTTP transport
    url: '<YOUR_REMOTE_MCP_SERVER_URL>'
  }
})`.trim(),
        lang: 'typescript'
      }
    } else {
      return {
        code: `
import { defineConfig } from '@agentic/platform'

export default defineConfig({
  name: 'openapi-example',
  origin: {
    type: 'openapi',
    // Your origin OpenAPI server base URL
    url: '<YOUR_OPENAPI_SERVER_BASE_URL>',
    // Your origin OpenAPI spec path or URL
    spec: '<YOUR_OPENAPI_SPEC_PATH_OR_URL>'
  }
})`.trim(),
        lang: 'typescript'
      }
    }
  } else if (config.format === 'json') {
    if (config.originAdaptor === 'mcp') {
      return {
        code: `
{
  "$schema": "https://agentic.so/schema.json",
  "name": "mcp-example",
  "origin": {
    "type": "mcp",
    "url": "<YOUR_REMOTE_MCP_SERVER_URL>"
  }
}`.trim(),
        lang: 'json'
      }
    } else {
      return {
        code: `
{
  "$schema": "https://agentic.so/schema.json",
  "name": "openapi-example",
  "origin": {
    "type": "openapi",
    "url": "<YOUR_OPENAPI_SERVER_BASE_URL>",
    "spec": "<YOUR_OPENAPI_SPEC_PATH_OR_URL>"
  }
}`.trim(),
        lang: 'json'
      }
    }
  }

  return {
    code: '',
    lang: 'json'
  }
}
