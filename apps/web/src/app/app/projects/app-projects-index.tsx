import { AppProjectsList } from '@/components/app-projects-list'

export function AppProjectsIndex() {
  return (
    <>
      <section>
        <div className='flex gap-8 space-around'>
          <AppProjectsList />
        </div>
      </section>
    </>
  )
}
