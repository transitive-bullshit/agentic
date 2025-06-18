import { HeroButton } from '@/components/hero-button'

export default function IndexPage() {
  return (
    <>
      <section>
        <h1 className='my-0! text-center text-balance leading-snug md:leading-none text-4xl font-extrabold'>
          MCP tools that actually work
        </h1>

        <h5 className='my-8! text-center text-balance text-lg'>
          Deploy any MCP server or OpenAPI service to Agentic's MCP gateway, and
          in minutes have a production-ready, monetizable MCP product.
        </h5>

        <HeroButton>Get Started</HeroButton>
      </section>

      <section className='flex-1'>
        <h2 className='text-center text-balance text-lg'>How it works</h2>

        <div>TODO</div>
      </section>
    </>
  )
}
