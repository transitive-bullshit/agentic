import { GitHubStarCounter } from './github-star-counter'

export function OpenSourceSection() {
  return (
    <section className='flex flex-col items-center gap-8'>
      <h2 className='text-center text-balance leading-snug md:leading-none text-2xl font-heading italic'>
        Agentic is 100% open source
      </h2>

      <GitHubStarCounter />
    </section>
  )
}
