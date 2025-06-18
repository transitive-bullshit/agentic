import { OpenSourceSection } from '@/components/open-source-section'
import { SupplySideCTA } from '@/components/supply-side-cta'

export default function IndexPage() {
  return (
    <>
      <section className='gap-8'>
        <h1 className='text-center text-balance leading-snug md:leading-none text-4xl font-extrabold'>
          Your API → Paid MCP, Instantly
        </h1>

        <h5 className='text-center text-lg max-w-2xl'>
          Run one command to turn any MCP server or OpenAPI service into a paid
          MCP product,{' '}
          <em>with built-in distribution to over 20k AI engineers</em>.
        </h5>

        <SupplySideCTA />
      </section>

      <section className='flex-1'>
        <h2 className='text-center text-balance text-lg'>How it works</h2>

        <div>TODO</div>
      </section>

      <OpenSourceSection />
    </>
  )
}
