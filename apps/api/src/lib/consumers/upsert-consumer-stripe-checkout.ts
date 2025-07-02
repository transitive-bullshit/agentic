import { assert } from '@agentic/platform-core'

import type { AuthenticatedHonoContext } from '@/lib/types'
import {
  and,
  db,
  eq,
  type RawConsumer,
  type RawDeployment,
  type RawProject,
  schema
} from '@/db'
import { acl } from '@/lib/acl'
import { upsertStripeConnectCustomer } from '@/lib/billing/upsert-stripe-connect-customer'
import { upsertStripeCustomer } from '@/lib/billing/upsert-stripe-customer'
import { upsertStripePricingResources } from '@/lib/billing/upsert-stripe-pricing-resources'
import { createConsumerApiKey } from '@/lib/create-consumer-api-key'

import { aclPublicProject } from '../acl-public-project'
import { createStripeCheckoutSession } from '../billing/create-stripe-checkout-session'

export async function upsertConsumerStripeCheckout(
  c: AuthenticatedHonoContext,
  {
    plan,
    deploymentId,
    consumerId
  }: {
    plan?: string
    deploymentId?: string
    consumerId?: string
  }
): Promise<{
  checkoutSession: { id: string; url: string }
  consumer: RawConsumer
}> {
  assert(
    consumerId || deploymentId,
    400,
    'Internal error: upsertConsumerStripeCheckout missing required "deploymentId" or "consumerId"'
  )
  const logger = c.get('logger')
  const userId = c.get('userId')
  let deployment: RawDeployment | undefined
  let project: RawProject | undefined
  let projectId: string | undefined

  logger.info('upsertConsumerStripeCheckout', {
    plan,
    deploymentId,
    consumerId
  })

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

    project = deployment.project!
    assert(
      project,
      404,
      `Project not found "${projectId}" for deployment "${deploymentId}"`
    )
    aclPublicProject(project)

    // Validate the deployment only after we're sure the project is publicly
    // accessible.
    assert(
      !deployment.deletedAt,
      410,
      `Deployment has been deleted by its owner "${deployment.id}"`
    )

    projectId = project.id
  }

  if (deploymentId) {
    await initDeploymentAndProject()
  }

  if (!consumerId) {
    assert(projectId, 400, 'Missing required "projectId"')
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
  }

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
    // Don't update the consumer until the checkout session is completed
    // successfully.
    // ;[consumer] = await db
    //   .update(schema.consumers)
    //   .set({
    //     plan,
    //     deploymentId
    //   })
    //   .where(eq(schema.consumers.id, consumer.id))
    //   .returning()
  } else {
    // Create a new consumer, but don't set the plan yet until the checkout
    // session is completed successfully.
    ;[consumer] = await db
      .insert(schema.consumers)
      .values({
        // plan,
        userId,
        projectId,
        deploymentId,
        token: await createConsumerApiKey(),
        _stripeCustomerId: stripeCustomer.id
      })
      .returning()
  }

  assert(
    consumer,
    500,
    'Internal error: upsertConsumerStripeCheckout error creating consumer'
  )

  // Ensure that all Stripe pricing resources exist for this deployment
  await upsertStripePricingResources({ deployment, project })

  // Ensure that customer and default source are created on the stripe connect account
  // TODO: is this necessary?
  // consumer._stripeAccount = project._stripeAccount
  // TODO: this function may mutate `consumer`
  await upsertStripeConnectCustomer({ stripeCustomer, consumer, project })

  logger.info(
    'CONSUMER STRIPE CHECKOUT',
    existingConsumer ? 'UPDATE' : 'CREATE',
    {
      project,
      deployment,
      consumer
    }
  )

  const checkoutSession = await createStripeCheckoutSession(c, {
    consumer,
    user,
    project,
    deployment,
    plan
  })
  logger.info('checkout session', checkoutSession)

  return {
    checkoutSession,
    consumer
  }
}
