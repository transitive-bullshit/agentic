# Needle API Example

This example demonstrates how to use the Needle API with OpenAI to create a collection, add a website, and perform semantic search over its contents.

## Features

- Creates a collection in Needle
- Adds a website to the collection
- Waits for content indexing
- Performs semantic search using OpenAI
- Shows both raw search results and AI-generated summaries

## Prerequisites

You'll need:
- [Node.js](https://nodejs.org) installed
- [pnpm](https://pnpm.io) package manager
- A Needle API key (get it from [Needle Dashboard](https://app.needle-ai.com))
- An OpenAI API key

## Setup

1. Create a `.env` file in this directory with your API keys:
```env
NEEDLE_API_KEY=your_needle_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

2. Install dependencies:
```bash
pnpm install
```

## Running the Example

Run the example with:
```bash
pnpm tsx bin/needle.ts
```

The script will:
1. Create a new collection in Needle
2. Add the Needle website to the collection
3. Wait for content indexing (20 seconds)
4. Perform a semantic search
5. Display both raw search results and an AI-generated summary

## Example Output

```
=== AI Summary ===

Needle is described as a "Knowledge Threading™ platform for work." It aims to help users find information quickly, eliminating communication bottlenecks and information silos. Needle connects company data and allows for organization-wide searches, enabling users to get answers instantly and focus on what matters. It offers features such as enterprise-ready AI search, easy data connection, AI-powered workflows, access control, and a drop-in chat widget for websites.
```