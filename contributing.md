# Contributing

## Project Overview

This is a monorepo for Agentic - a platform that provides API gateway services for MCP (Model Context Protocol) and OpenAPI integrations.

### Development Prequisites

- `node >= 22`
- `pnpm >= 10.12.4`
- `apps/api` requires a postgres database (can be a local one) with connection URL stored in `DATABASE_URL`
  - You'll need to initialize the database running `pnpm drizzle-kit push` from the `apps/api` directory

### Core Architecture

The platform consists of:

- **API Service** (`apps/api/`) - Platform backend API with authentication, billing, and resource management
- **Gateway Service** (`apps/gateway/`) - Cloudflare Worker that proxies requests to origin MCP/OpenAPI services
- **Website** (`apps/web/`) - Next.js site for both the marketing site and authenticated webapp
- **E2E Tests** (`apps/e2e/`) - End-to-end test suite for HTTP and MCP gateway requests
- **Shared Packages** (`packages/`) - Common utilities, types, validators, and config
- **StdLib Packages** (`stdlib/`) - TS AI SDK adapters

The gateway accepts HTTP requests at `https://gateway.agentic.so/deploymentIdentifier/tool-name` or `https://gateway.agentic.so/deploymentIdentifier/mcp` for MCP.

### Development Commands

**Main development workflow:**

- `pnpm dev` - Start all services in development mode
- `pnpm build` - Build all packages and apps (except for the website)
- `pnpm test` - Run all tests (build, format, lint, typecheck, unit, but not e2e tests)
- `pnpm clean` - Clean all build artifacts
- `pnpm run docs` - Run the local mintlify docs server
- `pnpm release` - Bump all public packages and publish them to npm

**Individual test commands:**

- `pnpm test:format` - Check code formatting with Prettier
- `pnpm test:lint` - Run ESLint across all packages
- `pnpm test:typecheck` - Run TypeScript type checking
- `pnpm test:unit` - Run unit tests with Vitest

**Code quality:**

- `pnpm fix` - Auto-fix formatting and linting issues
- `pnpm knip` - Check for unused dependencies

**E2E testing:**

- (from the `apps/e2e` directory)
- `pnpm e2e` - Run all E2E tests
- `pnpm e2e-http` - Run HTTP edge E2E tests
- `pnpm e2e-mcp` - Run MCP edge E2E tests

### Key Database Models

The system uses Drizzle ORM with PostgreSQL. Core entities:

- **User** - Platform users
- **Team** - Organizations with members and billing
- **Project** - Namespace API products comprised of immutable Deployments
- **Deployment** - Immutable instances of MCP/OpenAPI services, including gateway and pricing config
- **Consumer** - Customer subscription tracking usage and billing

### Environment Variables

Every app has a `.env.example` file, which documents required environment variables.

To run the backend API and other apps, you'll need to set up:

- Stripe
- GitHub app with OAuth credentials
- Resend
- Sentry
