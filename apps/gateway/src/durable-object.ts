import { DurableObject } from 'cloudflare:workers'

/** A Durable Object's behavior is defined in an exported Javascript class */
export class DurableObjectRateLimiter extends DurableObject<Env> {
  /**
   * The constructor is invoked once upon creation of the Durable Object, i.e. the first call to
   * 	`DurableObjectStub::get` for a given identifier (no-op constructors can be omitted)
   *
   * @param ctx - The interface for interacting with Durable Object state
   * @param env - The interface to reference bindings declared in wrangler.jsonc
   */
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env)
  }

  /**
   * The Durable Object exposes an RPC method sayHello which will be invoked
   * when when a Durable Object instance receives a request from a Worker via
   * the same method invocation on the stub.
   */
  async sayHello(name: string): Promise<string> {
    return `Hello, ${name}!`
  }
}
