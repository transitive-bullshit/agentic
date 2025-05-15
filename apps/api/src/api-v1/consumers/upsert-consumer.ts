import { parseFaasIdentifier } from '@agentic/validators'
import { createRoute, type OpenAPIHono } from '@hono/zod-openapi'

import type { AuthenticatedEnv } from '@/lib/types'
import { and, db, eq, schema } from '@/db'
import { upsertStripeConnectCustomer } from '@/lib/billing/upsert-stripe-connect-customer'
import { upsertStripeCustomer } from '@/lib/billing/upsert-stripe-customer'
import { upsertStripePricingPlans } from '@/lib/billing/upsert-stripe-pricing-plans'
import { upsertStripeSubscription } from '@/lib/billing/upsert-stripe-subscription'
import {
  openapiAuthenticatedSecuritySchemas,
  openapiErrorResponse404,
  openapiErrorResponse409,
  openapiErrorResponse410,
  openapiErrorResponses
} from '@/lib/openapi-utils'
import { assert, parseZodSchema, sha256 } from '@/lib/utils'

const route = createRoute({
  description:
    'Upserts a consumer (customer), subscribing to a specific deployment within project.',
  tags: ['consumers'],
  operationId: 'createConsumer',
  method: 'post',
  path: 'consumers',
  security: openapiAuthenticatedSecuritySchemas,
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: schema.consumerInsertSchema
        }
      }
    }
  },
  responses: {
    200: {
      description: 'A consumer object',
      content: {
        'application/json': {
          schema: schema.consumerSelectSchema
        }
      }
    },
    ...openapiErrorResponses,
    ...openapiErrorResponse404,
    ...openapiErrorResponse409,
    ...openapiErrorResponse410
  }
})

export function registerV1ConsumersUpsertConsumer(
  app: OpenAPIHono<AuthenticatedEnv>
) {
  return app.openapi(route, async (c) => {
    const body = c.req.valid('json')
    const userId = c.get('userId')

    const parsedIds = parseFaasIdentifier(body.deploymentId)
    assert(parsedIds, 400, 'Invalid "deploymentId"')
    const { projectId } = parsedIds

    const [{ user, stripeCustomer }, existing] = await Promise.all([
      upsertStripeCustomer(c),

      db.query.consumers.findFirst({
        where: and(
          eq(schema.consumers.userId, userId),
          eq(schema.consumers.projectId, projectId)
        )
      })
    ])

    assert(
      !existing ||
        !existing.enabled ||
        existing.plan !== body.plan ||
        existing.deploymentId !== body.deploymentId,
      409,
      `User "${user.email}" already has an active subscription to plan "${body.plan}" for project "${projectId}"`
    )

    const deployment = await db.query.deployments.findFirst({
      where: eq(schema.deployments.id, body.deploymentId),
      with: {
        project: true
      }
    })
    assert(deployment, 404, `Deployment not found "${body.deploymentId}"`)

    const { project } = deployment
    assert(
      project,
      404,
      `Project not found "${projectId}" for deployment "${body.deploymentId}"`
    )
    assert(
      deployment.enabled,
      410,
      `Deployment has been disabled by its owner "${deployment.id}"`
    )

    let consumer = existing

    if (consumer) {
      consumer.plan = body.plan
      consumer.deploymentId = body.deploymentId
      ;[consumer] = await db
        .update(schema.consumers)
        .set(consumer)
        .where(eq(schema.consumers.id, consumer.id))
        .returning()
    } else {
      ;[consumer] = await db.insert(schema.consumers).values({
        ...body,
        userId,
        projectId,
        token: sha256().slice(0, 24),
        _stripeCustomerId: stripeCustomer.id
      })
    }

    assert(consumer, 500, 'Error creating consumer')

    // make sure all pricing plans exist
    await upsertStripePricingPlans({ deployment, project })

    // make sure that customer and default source are created on stripe connect acct
    // TODO: is this necessary?
    // consumer._stripeAccount = project._stripeAccount
    await upsertStripeConnectCustomer({ stripeCustomer, consumer, project })

    console.log('SUBSCRIPTION', existing ? 'UPDATE' : 'CREATE', {
      project,
      deployment,
      consumer
    })

    const { subscription, consumer: updatedConsumer } =
      await upsertStripeSubscription({
        consumer,
        user,
        project,
        deployment
      })
    console.log({ subscription })

    return c.json(parseZodSchema(schema.consumerSelectSchema, updatedConsumer))
  })
}
