import { HeroButton } from '@/components/hero-button'

export default function IndexPage() {
  return (
    <>
      <section>
        <h1 className='my-0! text-center text-balance leading-snug md:leading-none text-4xl font-extrabold tracking-tight'>
          Agentic MCP Gateway
        </h1>

        <h5 className='my-8! text-center text-balance text-lg'>
          An API gateway built exclusively for AI agents.
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
