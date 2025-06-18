import { AppConsumersList } from '@/components/app-consumers-list'

export function AppConsumersIndex() {
  return (
    <>
      <section>
        <h1
          className='text-center text-balance leading-snug md:leading-none
        text-4xl font-extrabold'
        >
          Your Subscriptions
        </h1>

        <AppConsumersList />
      </section>
    </>
  )
}
