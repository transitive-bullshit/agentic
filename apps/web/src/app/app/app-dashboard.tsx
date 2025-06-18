import { AppConsumersList } from '@/components/app-consumers-list'
import { AppProjectsList } from '@/components/app-projects-list'

export function AppDashboard() {
  return (
    <>
      <section>
        <h1
          className='text-center text-balance leading-snug md:leading-none
        text-4xl font-extrabold mb-8'
        >
          Dashboard
        </h1>

        <div className='flex gap-8 space-around'>
          <AppConsumersList />

          <AppProjectsList />
        </div>
      </section>
    </>
  )
}
