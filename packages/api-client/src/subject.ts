/**
 * Subjects are what the access token generated at the end of the auth flow will map to. Under
 * the hood, the access token is a JWT that contains this data.
 *
 * #### Define subjects
 *
 * ```ts title="subjects.ts"
 * import { object, string } from "valibot"
 *
 * const subjects = createSubjects({
 *   user: object({
 *     userID: string()
 *   })
 * })
 * ```
 *
 * We are using [valibot](https://github.com/fabian-hiller/valibot) here. You can use any
 * validation library that's following the
 * [standard-schema specification](https://github.com/standard-schema/standard-schema).
 *
 * :::tip
 * You typically want to place subjects in its own file so it can be imported by all of your apps.
 * :::
 *
 * You can start with one subject. Later you can add more for different types of users.
 *
 * #### Set the subjects
 *
 * Then you can pass it to the `issuer`.
 *
 * ```ts title="issuer.ts"
 * import { subjects } from "./subjects"
 *
 * const app = issuer({
 *   providers: { ... },
 *   subjects,
 *   // ...
 * })
 * ```
 *
 * #### Add the subject payload
 *
 * When your user completes the flow, you can add the subject payload in the `success` callback.
 *
 * ```ts title="issuer.ts"
 * const app = issuer({
 *   providers: { ... },
 *   subjects,
 *   async success(ctx, value) {
 *     let userID
 *     if (value.provider === "password") {
 *       console.log(value.email)
 *       userID = ... // lookup user or create them
 *     }
 *     return ctx.subject("user", {
 *       userID
 *     })
 *   },
 *   // ...
 * })
 * ```
 *
 * Here we are looking up the userID from our database and adding it to the subject payload.
 *
 * :::caution
 * You should only store properties that won't change for the lifetime of the user.
 * :::
 *
 * Since these will be stored in the access token, you should avoid storing information
 * that'll change often. For example, if you store the user's username, you'll need to
 * revoke the access token when the user changes their username.
 *
 * #### Decode the subject
 *
 * Now when your user logs in, you can use the OpenAuth client to decode the subject. For
 * example, in our SSR app we can do the following.
 *
 * ```ts title="app/page.tsx"
 * import { subjects } from "../subjects"
 *
 * const verified = await client.verify(subjects, cookies.get("access_token")!)
 * console.log(verified.subject.properties.userID)
 * ```
 *
 * All this is typesafe based on the shape of the subjects you defined.
 *
 * @packageDocumentation
 */
import type { StandardSchemaV1 } from '@standard-schema/spec'
import type { Simplify } from 'type-fest'

/**
 * Subject schema is a map of types that are used to define the subjects.
 */
export type SubjectSchema = Record<string, StandardSchemaV1>

/** @internal */
export type SubjectPayload<T extends SubjectSchema> = Simplify<
  {
    [type in keyof T & string]: {
      type: type
      properties: StandardSchemaV1.InferOutput<T[type]>
    }
  }[keyof T & string]
>

/**
 * Create a subject schema.
 *
 * @example
 * ```ts
 * const subjects = createSubjects({
 *   user: object({
 *     userID: string()
 *   }),
 *   admin: object({
 *     workspaceID: string()
 *   })
 * })
 * ```
 *
 * This is using [valibot](https://github.com/fabian-hiller/valibot) to define the shape of the
 * subjects. You can use any validation library that's following the
 * [standard-schema specification](https://github.com/standard-schema/standard-schema).
 */
export function createSubjects<Schema extends SubjectSchema>(
  types: Schema
): Schema {
  return { ...types }
}
