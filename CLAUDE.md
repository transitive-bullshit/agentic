# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Core Architecture

This is a monorepo for the Agentic platform - a system that provides API gateway services for MCP (Model Context Protocol) and OpenAPI integrations. The platform consists of:

- **API Service** (`apps/api/`) - Internal platform API with authentication, billing, and resource management
- **Gateway Service** (`apps/gateway/`) - Cloudflare Worker that proxies requests to origin MCP/OpenAPI services
- **E2E Tests** (`apps/e2e/`) - End-to-end test suite for HTTP and MCP interfaces
- **Shared Packages** (`packages/`) - Common utilities, types, validators, and configuration

The gateway accepts requests at `https://gateway.agentic.so/deploymentIdentifier/toolName` for REST or `https://gateway.agentic.so/deploymentIdentifier/mcp` for MCP.

## Development Commands

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

## Key Database Models

The system uses Drizzle ORM with PostgreSQL. Core entities:

- **User** - Platform users
- **Team** - Organizations with members and billing
- **Project** - Namespace API products comprised of immutable Deployments
- **Deployment** - Immutable instances of MCP/OpenAPI services
- **Consumer** - Customer subscription tracking usage and billing

## Agentic Configuration

Agentic projects use `agentic.config.{ts,js,json}` files to define:

- Project name and metadata
- Origin adapter (MCP server or OpenAPI spec)
- Tool configurations and permissions
- Pricing plans and rate limits
- Authentication requirements

The platform supports both MCP servers and OpenAPI specifications as origin adapters.

## Gateway Request Flow

1. Request hits gateway with deployment identifier
2. Gateway validates consumer authentication/rate limits
3. Request is transformed and forwarded to origin service
4. Response is processed and returned with appropriate headers
5. Usage is tracked for billing and analytics

## Environment Setup

Both `apps/api` and `apps/gateway` require environment variables for:

- Database connections (`DATABASE_URL`)
- External services (Stripe, GitHub, Resend, Sentry)
- Authentication secrets
- Admin API keys
