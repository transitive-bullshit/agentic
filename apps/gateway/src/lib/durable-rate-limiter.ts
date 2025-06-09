import { DurableObject } from 'cloudflare:workers'

// TODO: implement

export class DurableRateLimiter extends DurableObject {
  async sayHello(name: string): Promise<string> {
    return `Hello, ${name}!`
  }
}
