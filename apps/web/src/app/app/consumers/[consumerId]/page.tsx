import { AppConsumerIndex } from './app-consumer-index'

export default async function AppConsumerIndexPage({
  params
}: {
  params: Promise<{
    consumerId: string
  }>
}) {
  const { consumerId } = await params

  return <AppConsumerIndex consumerId={consumerId} />
}
