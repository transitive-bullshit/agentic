# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a monorepo for Agentic - a platform that provides API gateway services for MCP (Model Context Protocol) and OpenAPI integrations.

### Core Architecture

The platform consists of:

- **API Service** (`apps/api/`) - Internal platform API with authentication, billing, and resource management
- **Gateway Service** (`apps/gateway/`) - Cloudflare Worker that proxies requests to origin MCP/OpenAPI services
- **E2E Tests** (`apps/e2e/`) - End-to-end test suite for HTTP and MCP interfaces
- **Shared Packages** (`packages/`) - Common utilities, types, validators, and configuration

The gateway accepts requests at `https://gateway.agentic.so/deploymentIdentifier/toolName` for REST or `https://gateway.agentic.so/deploymentIdentifier/mcp` for MCP.

### Development Commands

**Main development workflow:**

- `pnpm dev` - Start all services in development mode
- `pnpm build` - Build all packages and apps
- `pnpm test` - Run all tests (format, lint, typecheck, unit)
- `pnpm clean` - Clean all build artifacts

**Individual test commands:**

- `pnpm test:format` - Check code formatting with Prettier
- `pnpm test:lint` - Run ESLint across all packages
- `pnpm test:typecheck` - Run TypeScript type checking
- `pnpm test:unit` - Run unit tests with Vitest

**Code quality:**

- `pnpm fix` - Auto-fix formatting and linting issues
- `pnpm knip` - Check for unused dependencies

**E2E testing:**

- `cd apps/e2e && pnpm e2e` - Run all E2E tests
- `cd apps/e2e && pnpm e2e-http` - Run HTTP edge E2E tests
- `cd apps/e2e && pnpm e2e-mcp` - Run MCP edge E2E tests

### Key Database Models

The system uses Drizzle ORM with PostgreSQL. Core entities:

- **User** - Platform users
- **Team** - Organizations with members and billing
- **Project** - Namespace API products comprised of immutable Deployments
- **Deployment** - Immutable instances of MCP/OpenAPI services
- **Consumer** - Customer subscription tracking usage and billing

### Agentic Configuration

Agentic projects use `agentic.config.{ts,js,json}` files to define:

- Project name and metadata
- Origin adapter (MCP server or OpenAPI spec)
- Tool configurations and permissions
- Pricing plans and rate limits
- Authentication requirements

The platform supports both MCP servers and OpenAPI specifications as origin adapters.

### Gateway Request Flow

1. Request hits gateway with deployment identifier
2. Gateway validates consumer authentication/rate limits
3. Request is transformed and forwarded to origin service
4. Response is processed and returned with appropriate headers
5. Usage is tracked for billing and analytics

### Environment Setup

Both `apps/api` and `apps/gateway` require environment variables for:

- Database connections (`DATABASE_URL`)
- External services (Stripe, GitHub, Resend, Sentry)
- Authentication secrets
- Admin API keys

## Coding Conventions

### General

- Write elegant, concise, and readable code
- Prefer `const` over `let` (never use `var`)
- Use kebab-case for file and directory names
- Use clear, descriptive names for variables, functions, and components

### Modules

- Always use ESM `import` and `export` (never use CJS `require`)
  - File imports should never use an extension (NOT `.js`, `.ts` or `.tsx`).
  - GOOD examples:
    - `import { Foo } from './foo'`
    - `import { type Route } from './types/root'`
    - `import zod from 'zod'`
    - `import { logger } from '~/types'`
  - BAD examples:
    - `import { Foo } from './foo.js'`
    - `import { type Route } from './types/root.js'`
    - `import { Foo } from './foo.ts'`
- Always prefer named exports over default exports

### Packages

All packages must follow these `package.json` rules:

- `type` must be set to `module`

### TypeScript

- Avoid semicolons at the end of lines
- Use TypeScript's utility types (e.g., `Partial`, `Pick`, `Omit`) to manipulate existing types
- Create custom types for complex data structures used throughout the application
- If possible, avoid using `any`/`unknown` or casting values like `(value as any)` in TypeScript outside of test files e.g. `*.test.ts` or test fixtures e.g. `**/test-data.ts`.
- Don't rely on `typeof`, `ReturnType<>`, `Awaited<>`, etc for complex type inference (it's ok for simple types)
- You can use `as const` as needed for better type inference
- Functions should accept an object parameter instead of multiple parameters
  - Good examples:
    ```ts
    function myFunction({ foo, bar }: { foo: boolean; bar: string }) {}
    function VideoPlayer({ sid }: { sid: string }) {}
    ```
  - Bad examples:
    ```ts
    function myFunction(foo: boolean, bar: string, baz: number) {}
    ```
- Arguments should generally be destructured in the function definition, not the function body.
  - Good example:
    ```ts
    function myFunction({ foo, bar }: { foo: boolean; bar: string }) {}
    ```
  - Bad example:
    ```ts
    function myFunction(args: { foo: boolean; bar: string }) {
      const { foo, bar } = args
    }
    ```
- Zod should be used to parse untrusted data, but not for data that is trusted like function arguments
- Prefer Zod unions over Zod enums
  - For example, this union `z.union([ z.literal('youtube'), z.literal('spotify') ])` is better than this enum `z.enum([ 'youtube', 'spotify' ])`
- Promises (and `async` functions which implicitly create Promises) must always be properly handled, either via:
  - Using `await` to wait for the Promise to resolve successfully
  - Using `.then` or `.catch` to handle Promise resolution
  - Returning a Promise to a calling function which itself has to handle the Promise.

## Node.js

- Utilize the `node:` protocol when importing Node.js modules (e.g., `import fs from 'node:fs/promises'`)
- Prefer promise-based APIs over Node's legacy callback APIs
- Use environment variables for secrets (avoid hardcoding sensitive information)

### Web Standard APIs

Always prefer using standard web APIs like `fetch`, `WebSocket`, and `ReadableStream` when possible. Avoid redundant libraries (like `node-fetch`).

- Prefer the `fetch` API for making HTTP requests instead of Node.js modules like `http` or `https`
  - Prefer using the `ky` `fetch` wrapper for HTTP requests instead of `axios`, `superagent`, `node-fetch` or any other HTTP request library
  - Never use `node-fetch`; prefer `ky` or native `fetch` directly
- Use the WHATWG `URL` and `URLSearchParams` classes instead of the Node.js `url` module
- Use `Request` and `Response` objects from the Fetch API instead of Node.js-specific request and response objects

### Error Handling

- Prefer `async`/`await` over `.then()` and `.catch()`
- Always handle errors correctly (eg: `try`/`catch` or `.catch()`)
- Avoid swallowing errors silently; always log or handle caught errors appropriately

### Comments

Comments should be used to document and explain code. They should complement the use of descriptive variable and function names and type declarations.

- Add comments to explain complex sections of code
- Add comments that will improve the autocompletion preview in IDEs (eg: functions and types)
- Don't add comments that just reword symbol names or repeat type declarations
- Use **JSDoc** formatting for comments (not TSDoc or inline comments)

### Logging

- Just use `console` for logging.

### Testing

#### Unit Testing

- **All unit tests should use Vitest**
  - DO NOT attempt to install or use other testing libraries like Jest
- Test files should be named `[target].test.ts` and placed in the same directory as the code they are testing (NOT a separate directory)
  - Good example: `src/my-file.ts` and `src/my-file.test.ts`
  - Bad example: `src/my-file.ts` and `src/test/my-file.test.ts` or `test/my-file.test.ts` or `src/__tests__/my-file.test.ts`
- Tests should be run with `pnpm test:unit`
- You may use `any`/`unknown` in test files (such as `*.test.ts`) or test fixtures (like `**/test-data.ts`) to facilitate mocking or stubbing external modules or partial function arguments, referencing the usage guidelines in the TypeScript section.
- Frontend react code does not need unit tests

#### Test Coverage

- Test critical business logic and edge cases
- Don't add tests for trivial code or just to increase test coverage
- Don't make tests too brittle or flaky by relying on implementation details

### Git

- When possible, combine the `git add` and `git commit` commands into a single `git commit -am` command, to speed things up
