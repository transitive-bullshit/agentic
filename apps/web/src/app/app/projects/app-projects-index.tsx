import { AppProjectsList } from '@/components/app-projects-list'
import { PageContainer } from '@/components/page-container'

export function AppProjectsIndex() {
  return (
    <PageContainer>
      <section>
        <div className='flex gap-8 space-around'>
          <AppProjectsList />
        </div>
      </section>
    </PageContainer>
  )
}
