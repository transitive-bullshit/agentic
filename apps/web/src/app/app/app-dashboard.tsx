import { AppConsumersList } from '@/components/app-consumers-list'
import { AppProjectsList } from '@/components/app-projects-list'
import { PageContainer } from '@/components/page-container'

export function AppDashboard() {
  return (
    <PageContainer>
      <section>
        <h1
          className='text-center text-balance leading-snug md:leading-none
        text-4xl font-extrabold mb-8'
        >
          Dashboard
        </h1>

        <div className='flex flex-col lg:flex-row gap-8 space-around'>
          <AppConsumersList />

          <AppProjectsList />
        </div>
      </section>
    </PageContainer>
  )
}
