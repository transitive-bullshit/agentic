import { parseFaasIdentifier } from '@agentic/validators'

import { and, db, eq, schema } from '@/db'
import { assert } from '@/lib/utils'

import type { AuthenticatedContext } from '../types'
import { acl } from '../acl'
import { createConsumerToken } from '../create-consumer-token'
import { upsertStripeConnectCustomer } from './upsert-stripe-connect-customer'
import { upsertStripeCustomer } from './upsert-stripe-customer'
import { upsertStripePricing } from './upsert-stripe-pricing'
import { upsertStripeSubscription } from './upsert-stripe-subscription'

export async function upsertConsumer(
  c: AuthenticatedContext,
  {
    plan,
    deploymentId,
    consumerId
  }: {
    plan?: string
    deploymentId?: string
    consumerId?: string
  }
) {
  assert(consumerId || deploymentId, 400, 'Missing required "deploymentId"')
  const logger = c.get('logger')
  const userId = c.get('userId')
  let projectId: string | undefined

  if (deploymentId) {
    const parsedIds = parseFaasIdentifier(deploymentId)
    assert(parsedIds, 400, 'Invalid "deploymentId"')
    projectId = parsedIds.projectId
  }

  if (!consumerId) {
    assert(projectId, 400, 'Missing required "deploymentId"')
  }

  const [{ user, stripeCustomer }, existingConsumer] = await Promise.all([
    upsertStripeCustomer(c),

    db.query.consumers.findFirst({
      where: consumerId
        ? eq(schema.consumers.id, consumerId)
        : and(
            eq(schema.consumers.userId, userId),
            eq(schema.consumers.projectId, projectId!)
          )
    })
  ])

  if (consumerId) {
    assert(existingConsumer, 404, `Consumer not found "${consumerId}"`)
    assert(existingConsumer.id === consumerId, 403)
    await acl(c, existingConsumer, { label: 'Consumer' })

    if (projectId) {
      assert(
        existingConsumer.projectId === projectId,
        400,
        `Deployment "${deploymentId}" does not belong to project "${existingConsumer.projectId}" for consumer "${consumerId}"`
      )
    }

    deploymentId ??= existingConsumer.deploymentId
    projectId ??= existingConsumer.projectId
  } else {
    assert(
      !existingConsumer,
      409,
      `User "${user.email}" already has a subscription for project "${projectId ?? ''}"`
    )
  }

  assert(consumerId)
  assert(deploymentId)
  assert(projectId)

  assert(
    !existingConsumer ||
      !existingConsumer.enabled ||
      existingConsumer.plan !== plan ||
      existingConsumer.deploymentId !== deploymentId,
    409,
    `User "${user.email}" already has an active subscription to plan "${plan}" for project "${projectId}"`
  )

  const deployment = await db.query.deployments.findFirst({
    where: eq(schema.deployments.id, deploymentId),
    with: {
      project: true
    }
  })
  assert(deployment, 404, `Deployment not found "${deploymentId}"`)

  const { project } = deployment
  assert(
    project,
    404,
    `Project not found "${projectId}" for deployment "${deploymentId}"`
  )
  assert(
    deployment.enabled,
    410,
    `Deployment has been disabled by its owner "${deployment.id}"`
  )

  if (plan) {
    const pricingPlan = deployment.pricingPlans.find((p) => p.slug === plan)
    assert(
      pricingPlan,
      400,
      `Pricing plan "${plan}" not found for deployment "${deploymentId}"`
    )
  }

  let consumer = existingConsumer

  if (consumer) {
    ;[consumer] = await db
      .update(schema.consumers)
      .set({
        plan,
        deploymentId
      })
      .where(eq(schema.consumers.id, consumer.id))
      .returning()
  } else {
    ;[consumer] = await db.insert(schema.consumers).values({
      plan,
      userId,
      projectId,
      deploymentId,
      token: createConsumerToken(),
      _stripeCustomerId: stripeCustomer.id
    })
  }

  assert(consumer, 500, 'Error creating consumer')

  // Ensure that all Stripe pricing resources exist for this deployment
  await upsertStripePricing({ deployment, project })

  // Ensure that customer and default source are created on the stripe connect account
  // TODO: is this necessary?
  // consumer._stripeAccount = project._stripeAccount
  await upsertStripeConnectCustomer({ stripeCustomer, consumer, project })

  logger.info('SUBSCRIPTION', existingConsumer ? 'UPDATE' : 'CREATE', {
    project,
    deployment,
    consumer
  })

  const { subscription, consumer: updatedConsumer } =
    await upsertStripeSubscription(c, {
      consumer,
      user,
      project,
      deployment
    })
  logger.info('subscription', subscription)

  return updatedConsumer
}
