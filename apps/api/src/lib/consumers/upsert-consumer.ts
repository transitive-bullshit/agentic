import { assert } from '@agentic/platform-core'

import type { AuthenticatedContext } from '@/lib/types'
import { and, db, eq, type RawDeployment, type RawProject, schema } from '@/db'
import { acl } from '@/lib/acl'
import { upsertStripeConnectCustomer } from '@/lib/billing/upsert-stripe-connect-customer'
import { upsertStripeCustomer } from '@/lib/billing/upsert-stripe-customer'
import { upsertStripePricing } from '@/lib/billing/upsert-stripe-pricing'
import { upsertStripeSubscription } from '@/lib/billing/upsert-stripe-subscription'
import { createConsumerToken } from '@/lib/create-consumer-token'

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
  let deployment: RawDeployment | undefined
  let project: RawProject | undefined
  let projectId: string | undefined

  async function initDeploymentAndProject() {
    assert(deploymentId, 400, 'Missing required "deploymentId"')
    if (deployment && project) {
      // Already initialized
      return
    }

    deployment = await db.query.deployments.findFirst({
      where: eq(schema.deployments.id, deploymentId),
      with: {
        project: true
      }
    })
    assert(deployment, 404, `Deployment not found "${deploymentId}"`)
    assert(
      !deployment.deletedAt,
      410,
      `Deployment has been deleted by its owner "${deployment.id}"`
    )
    await acl(c, deployment, { label: 'Deployment' })

    project = deployment.project!
    assert(
      project,
      404,
      `Project not found "${projectId}" for deployment "${deploymentId}"`
    )
    await acl(c, project, { label: 'Project' })
  }

  if (deploymentId) {
    await initDeploymentAndProject()
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
      !existingConsumer.isStripeSubscriptionActive ||
      existingConsumer.plan !== plan ||
      existingConsumer.deploymentId !== deploymentId,
    409,

    plan
      ? `User "${user.email}" already has an active subscription to plan "${plan}" for project "${projectId}"`
      : `User "${user.email}" already has cancelled their subscription for project "${projectId}"`
  )

  await initDeploymentAndProject()
  assert(deployment, 500, `Error getting deployment "${deploymentId}"`)
  assert(project, 500, `Error getting project "${projectId}"`)

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
      token: await createConsumerToken(),
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
