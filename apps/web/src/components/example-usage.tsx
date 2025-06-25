'use client'

import type { Project } from '@agentic/platform-types'
import type { JSX } from 'react'
import { useLocalStorage } from 'react-use'

import { useAgentic } from '@/components/agentic-provider'
import { CodeBlock } from '@/components/code-block'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  defaultConfig,
  type DeveloperConfig,
  getCodeForDeveloperConfig,
  type HTTPTarget,
  httpTargetLabels,
  httpTargets,
  type MCPClientTarget,
  mcpClientTargetLabels,
  mcpClientTargets,
  type PyFrameworkTarget,
  pyFrameworkTargetLabels,
  pyFrameworkTargets,
  type Target,
  targetLabels,
  targets,
  type TsFrameworkTarget,
  tsFrameworkTargetLabels,
  tsFrameworkTargets
} from '@/lib/developer-config'
import { useQuery } from '@/lib/query-client'

import { LoadingIndicator } from './loading-indicator'

export function ExampleUsage({
  projectIdentifier,
  prompt,
  project: initialProject,
  initialCodeBlock
}: {
  projectIdentifier: string
  prompt: string
  project?: Project
  initialCodeBlock?: JSX.Element
}) {
  const ctx = useAgentic()

  const [config, setConfig] = useLocalStorage<DeveloperConfig>(
    'config',
    defaultConfig
  )

  // TODO: make this configurable
  // TODO: allow to take the project and/or consumer in as props
  // TODO: need a way of fetching a project and target deployment; same as in `AgenticToolClient.fromIdentifier` (currently only supports latest)

  // Load the public project
  const {
    data: project,
    isLoading,
    isError
  } = useQuery({
    queryKey: ['project', projectIdentifier],
    queryFn: () =>
      ctx!.api.getPublicProjectByIdentifier({
        projectIdentifier,
        populate: ['lastPublishedDeployment']
      }),
    enabled: !!ctx,
    initialData: initialProject
  })

  // If the user is authenticated, check if they have an active subscription to
  // this project
  // TODO: use consumer for apiKey
  // const {
  //   data: consumer,
  //   isLoading: isConsumerLoading
  //   // isError: isConsumerError
  // } = useQuery({
  //   queryKey: [
  //     'project',
  //     projectIdentifier,
  //     'user',
  //     ctx?.api.authSession?.user.id
  //   ],
  //   queryFn: () =>
  //     ctx!.api.getConsumerByProjectIdentifier({
  //       projectIdentifier
  //     }),
  //   enabled: !!ctx?.isAuthenticated
  // })

  if (isLoading || !config) {
    return <LoadingIndicator className='w-full max-w-3xl' />
  }

  // TODO: allow to target a specific deployment
  const deployment = project?.lastPublishedDeployment

  if (isError || !project || !deployment) {
    return (
      <div>
        Error loading project. Please refresh the page or contact{' '}
        <a href='mailto:support@agentic.so'>support@agentic.so</a>.
      </div>
    )
  }

  const codeSnippet = getCodeForDeveloperConfig({
    config,
    project,
    deployment,
    identifier: projectIdentifier,
    prompt
  })

  return (
    <Tabs
      defaultValue={config.target}
      onValueChange={(value) =>
        setConfig({
          ...defaultConfig,
          ...config,
          target: value as Target
        })
      }
      className='w-full max-w-3xl'
    >
      <TabsList>
        {targets.map((target) => (
          <TabsTrigger key={target} value={target} className='cursor-pointer'>
            {targetLabels[target]}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value='mcp' className='w-full'>
        <Tabs
          defaultValue={config.mcpClientTarget}
          onValueChange={(value) =>
            setConfig({
              ...defaultConfig,
              ...config,
              mcpClientTarget: value as MCPClientTarget
            })
          }
          className='w-full'
        >
          <TabsList className='h-auto flex-wrap'>
            {mcpClientTargets.map((mcpClientTarget) => (
              <TabsTrigger
                key={mcpClientTarget}
                value={mcpClientTarget}
                className='cursor-pointer text-xs!'
              >
                {mcpClientTargetLabels[mcpClientTarget]}
              </TabsTrigger>
            ))}
          </TabsList>

          {mcpClientTargets.map((mcpClientTarget) => (
            <TabsContent
              key={mcpClientTarget}
              value={mcpClientTarget}
              className='w-full'
            >
              <CodeBlock
                code={codeSnippet.code}
                lang={codeSnippet.lang}
                initial={initialCodeBlock}
              />
            </TabsContent>
          ))}
        </Tabs>
      </TabsContent>

      <TabsContent value='typescript' className='w-full'>
        <Tabs
          defaultValue={config.tsFrameworkTarget ?? 'ai'}
          onValueChange={(value) =>
            setConfig({
              ...defaultConfig,
              ...config,
              tsFrameworkTarget: value as TsFrameworkTarget
            })
          }
          className='w-full'
        >
          <TabsList className='w-full h-auto flex-wrap'>
            {tsFrameworkTargets.map((framework) => (
              <TabsTrigger
                key={framework}
                value={framework}
                className='cursor-pointer text-xs!'
              >
                {tsFrameworkTargetLabels[framework]}
              </TabsTrigger>
            ))}
          </TabsList>

          {tsFrameworkTargets.map((framework) => (
            <TabsContent key={framework} value={framework} className='w-full'>
              <CodeBlock
                code={codeSnippet.code}
                lang={codeSnippet.lang}
                initial={initialCodeBlock}
              />
            </TabsContent>
          ))}
        </Tabs>
      </TabsContent>

      <TabsContent value='python' className='w-full'>
        <Tabs
          defaultValue={config.pyFrameworkTarget}
          onValueChange={(value) =>
            setConfig({
              ...defaultConfig,
              ...config,
              pyFrameworkTarget: value as PyFrameworkTarget
            })
          }
          className='w-full'
        >
          <TabsList className='h-auto flex-wrap'>
            {pyFrameworkTargets.map((framework) => (
              <TabsTrigger
                key={framework}
                value={framework}
                className='cursor-pointer text-xs!'
              >
                {pyFrameworkTargetLabels[framework]}
              </TabsTrigger>
            ))}
          </TabsList>

          {pyFrameworkTargets.map((framework) => (
            <TabsContent key={framework} value={framework} className='w-full'>
              <CodeBlock
                code={codeSnippet.code}
                lang={codeSnippet.lang}
                initial={initialCodeBlock}
              />
            </TabsContent>
          ))}
        </Tabs>
      </TabsContent>

      <TabsContent value='http' className='w-full'>
        <Tabs
          defaultValue={config.httpTarget}
          onValueChange={(value) =>
            setConfig({
              ...defaultConfig,
              ...config,
              httpTarget: value as HTTPTarget
            })
          }
          className='w-full'
        >
          <TabsList className='h-auto flex-wrap'>
            {httpTargets.map((httpTarget) => (
              <TabsTrigger
                key={httpTarget}
                value={httpTarget}
                className='cursor-pointer text-xs!'
              >
                {httpTargetLabels[httpTarget]}
              </TabsTrigger>
            ))}
          </TabsList>

          {httpTargets.map((httpTarget) => (
            <TabsContent key={httpTarget} value={httpTarget} className='w-full'>
              <CodeBlock
                code={codeSnippet.code}
                lang={codeSnippet.lang}
                initial={initialCodeBlock}
              />
            </TabsContent>
          ))}
        </Tabs>
      </TabsContent>
    </Tabs>
  )
}
