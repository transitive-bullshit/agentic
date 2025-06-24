'use client'

import { useLocalStorage } from 'react-use'

import { CodeBlock } from '@/components/code-block'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  defaultConfig,
  type DeveloperConfig,
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

export function ExampleUsage() {
  const [config, setConfig] = useLocalStorage<DeveloperConfig>(
    'config',
    defaultConfig
  )

  return (
    <Tabs
      defaultValue={config!.target}
      onValueChange={(value) =>
        setConfig({
          ...defaultConfig,
          ...config,
          target: value as Target
        })
      }
      className='w-full max-w-2xl'
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
          defaultValue={config!.mcpClientTarget}
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
                className='cursor-pointer'
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
                code={JSON.stringify(config, null, 2)}
                lang='json'
                className='p-4 rounded-sm w-full'
              />
            </TabsContent>
          ))}
        </Tabs>
      </TabsContent>

      <TabsContent value='typescript' className='w-full'>
        <Tabs
          defaultValue={config!.tsFrameworkTarget ?? 'ai'}
          onValueChange={(value) =>
            setConfig({
              ...defaultConfig,
              ...config,
              tsFrameworkTarget: value as TsFrameworkTarget
            })
          }
          className='w-full'
        >
          <TabsList className='h-auto flex-wrap'>
            {tsFrameworkTargets.map((framework) => (
              <TabsTrigger
                key={framework}
                value={framework}
                className='cursor-pointer'
              >
                {tsFrameworkTargetLabels[framework]}
              </TabsTrigger>
            ))}
          </TabsList>

          {tsFrameworkTargets.map((framework) => (
            <TabsContent key={framework} value={framework} className='w-full'>
              <CodeBlock
                code={JSON.stringify(config, null, 2)}
                lang='ts'
                className='p-4 rounded-sm w-full'
              />
            </TabsContent>
          ))}
        </Tabs>
      </TabsContent>

      <TabsContent value='python' className='w-full'>
        <Tabs
          defaultValue={config!.pyFrameworkTarget}
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
                className='cursor-pointer'
              >
                {pyFrameworkTargetLabels[framework]}
              </TabsTrigger>
            ))}
          </TabsList>

          {pyFrameworkTargets.map((framework) => (
            <TabsContent key={framework} value={framework} className='w-full'>
              <CodeBlock
                code={JSON.stringify(config, null, 2)}
                lang='py'
                className='p-4 rounded-sm w-full'
              />
            </TabsContent>
          ))}
        </Tabs>
      </TabsContent>

      <TabsContent value='http' className='w-full'>
        <Tabs
          defaultValue={config!.httpTarget}
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
                className='cursor-pointer'
              >
                {httpTargetLabels[httpTarget]}
              </TabsTrigger>
            ))}
          </TabsList>

          {httpTargets.map((httpTarget) => (
            <TabsContent key={httpTarget} value={httpTarget} className='w-full'>
              <CodeBlock
                code={JSON.stringify(config, null, 2)}
                lang='bash'
                className='p-4 rounded-sm w-full'
              />
            </TabsContent>
          ))}
        </Tabs>
      </TabsContent>
    </Tabs>
  )
}
