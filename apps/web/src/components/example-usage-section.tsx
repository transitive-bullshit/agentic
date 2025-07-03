import Link from 'next/link'

import { highlight } from '@/components/code-block/highlight'
import { ExampleUsage } from '@/components/example-usage'
import {
  defaultConfig,
  getCodeForDeveloperConfig
} from '@/lib/developer-config'
import { globalAgenticApiClient } from '@/lib/global-api'

export async function ExampleUsageSection() {
  const projectIdentifier = '@agentic/search'
  const tool = 'search'

  const initialProject =
    await globalAgenticApiClient.getPublicProjectByIdentifier({
      projectIdentifier,
      populate: ['lastPublishedDeployment']
    })

  // TODO: this should be loaded in `ExampleUsage`
  const initialCodeSnippet = getCodeForDeveloperConfig({
    config: defaultConfig,
    project: initialProject,
    deployment: initialProject.lastPublishedDeployment!,
    identifier: projectIdentifier,
    tool
  })
  const initialCodeBlock = await highlight(initialCodeSnippet)

  return (
    <section className='flex flex-col gap-8 mb-16'>
      <h2 className='text-center text-balance leading-snug md:leading-none text-3xl font-heading'>
        Agentic tools that{' '}
        <span className='font-semibold'>work everywhere</span>
      </h2>

      <ExampleUsage
        projectIdentifier={projectIdentifier}
        project={initialProject}
        tool={tool}
        initialCodeBlock={initialCodeBlock}
      />

      <div className='flex flex-col gap-4 text-sm max-w-2xl text-center'>
        <p>
          This example uses the{' '}
          <Link
            href={`/marketplace/projects/${projectIdentifier}`}
            className='link'
          >
            {projectIdentifier}
          </Link>{' '}
          tool to provide an LLM access to the web.
        </p>

        <p>
          All Agentic tools are exposed as both{' '}
          <span className='font-semibold'>MCP servers</span> as well as simple{' '}
          <span className='font-semibold'>HTTP APIs</span>. MCP is important for
          interop and future-proofing, whereas simple HTTP POST requests make
          tool use easy to debug and simplifies usage with LLM tool calling.
        </p>
      </div>
    </section>
  )
}
