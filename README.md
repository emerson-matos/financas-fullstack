# Financas — Next.js Frontend (Supabase + Vercel)

This repository contains the Next.js frontend and server-side API routes that power the Financas application. The project now uses Supabase for authentication and data (Postgres) and is deployed to Vercel. The Next.js API routes operate directly against Supabase (via the `lib/supabase/*` utilities) and provide a TypeScript-first client surface plus React Query hooks for the UI.

This README is organized to get you running quickly and then provide reference information for development, debugging, and contributing.

---

Table of contents
- [Quick start (5 minutes)](#quick-start-5-minutes)
- [Prerequisites](#prerequisites)
- [Environment variables](#environment-variables)
- [Run the system](#run-the-system)
- [API usage patterns](#api-usage-patterns)
- [Authentication and middleware](#authentication-and-middleware)
- [Available endpoints (overview)](#available-endpoints-overview)
- [Project structure](#project-structure)
- [Testing and debugging tips](#testing-and-debugging-tips)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License & contact](#license--contact)

---

## Quick start (5 minutes)

1. Copy and edit environment variables:
   - Copy the example env: `cp .env.local.example .env.local`
   - Edit `.env.local` to include your Supabase keys and any Vercel / production variables (see Environment variables below).

2. Start local Supabase (optional, for local dev):
   - Start the local Supabase stack: `pnpm supabase:start` (this runs `npx supabase start`)
   - Apply DB migrations (if any): `pnpm db:migrate`
   - Generate Supabase types: `pnpm supabase:types`

3. Start the Next.js app:
   - Install dependencies: `pnpm install` (or `npm install`)
   - Run dev server: `pnpm dev` (or `npm run dev`)
   - Open: `http://localhost:3000`

4. Authenticate and test:
   - Use the UI to sign in via Supabase auth
   - Call API routes under `/api/*` from the frontend — they interact with Supabase directly

Deployment:
- Deploy to Vercel and configure the same env vars in Vercel's dashboard (see Environment variables). The app is Vercel-first and designed to run the Next.js App Router there.

---

## Prerequisites

- Node.js 18+ (LTS recommended)
- pnpm (optional but recommended) or npm/yarn
- Local Supabase CLI for local development

---

## Environment variables

Create `./.env.local` (file is gitignored). Minimal example for Supabase + Vercel:

- `SUPABASE_URL` — Supabase project URL (server-side)
- `SUPABASE_PUBLISHABLE_KEY` — Supabase anon/public key (server-side when using SSR libs)
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase URL for client-side code
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — Supabase public key for client-side code
- `DATABASE_URL` or other DB connection string (if used for migrations/scripts)
- `NEXTAUTH_URL` / `AUTH_BASE_URL` — Not required for Supabase auth; only set if you have custom needs

Examples:
```
NEXT_PUBLIC_SUPABASE_URL=https://xyzcompany.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=pk.abcdef...
SUPABASE_URL=https://xyzcompany.supabase.co
SUPABASE_PUBLISHABLE_KEY=sk-xxxxxxxx...
```

Tip: keep secrets out of VCS and set production env vars in Vercel's dashboard (Project Settings → Environment Variables).

---

## Run the system

- Install deps:
  - `pnpm install` (or `npm install`)

- Development:
  - `pnpm dev` — runs Next.js in dev mode with hot reload

- Build / production:
  - `pnpm build`
  - `pnpm start` — starts production server

- Lint / format:
  - `pnpm lint`
  - `pnpm format` (if configured)

---

## API usage patterns

This project exposes a TypeScript-first API surface. You have three recommended ways to interact with the backend:

1. React Query hooks (recommended for UI code)
   - Hooks live in `lib/query-hooks.ts` and follow resource patterns like `useTransactions`, `useCreateTransaction`.
   - They provide caching, optimistic updates, and integration with forms.

2. API utilities
   - Helpers in `lib/api-utils.ts` provide functions like `fetchPaginatedResources`, `createResource`, and a central `endpoints` map so you can write concise data layer code.

3. Direct API client
   - A thin wrapper `lib/api` exports an `api` client (fetch-based). Use `api.get('/api/transactions')` for quick scripts or server-side code.

Usage example (UI / component):
- Use `useTransactions` to fetch and render a paginated list. Use `useCreateTransaction` mutation to create a new transaction and let React Query handle cache updates.



---

## Authentication and middleware

- Authentication is handled using Supabase Auth.
- Server-side helpers use `@supabase/ssr` and the helper clients in `lib/supabase/`:
  - `lib/supabase/server.ts` — create server-side Supabase client (used in API routes)
  - `lib/supabase/client.ts` — create browser Supabase client
- API route handlers call `requireAuth()` in `lib/api/auth.ts` to validate the current session and obtain the user ID and session object.

If you need to modify session handling, inspect:
- `lib/supabase/server.ts`
- `lib/api/auth.ts`

---

## Available endpoints (overview)

All proxied routes live under `/api/*` and map to your Spring resources. Major resources include:

- Transactions — `/api/transactions` (+ `/import`, `/bulk`)
- Users — `/api/users`
- Categories — `/api/categories`
- Budgets — `/api/budgets`
- Accounts — `/api/accounts`
- Groups — `/api/groups`
- Budget Items — `/api/budget-items`
- Transaction Splits — `/api/transaction-splits`
- Group Memberships — `/api/group-memberships`
- Categorization Jobs — `/api/categorization-jobs`
- Reports — `/api/reports`
- Exports — `/api/exports`

HTTP methods:
- `GET`, `POST`, `PUT`/`PATCH`, `DELETE` are available consistent with RESTful patterns. Bulk/import endpoints exist where applicable.

For in-depth mapping and parameter details, see `docs/API_GUIDE.md` and `docs/ARCHITECTURE.md`.

---

## Project structure

Top-level overview (abridged):

- `app/` — Next.js App Router pages and route handlers
  - `app/api/` — API route handlers that interact with Supabase (via `lib/supabase/*`)
- `lib/` — Utilities and data-layer code
  - `lib/supabase/` — Supabase helpers (`server.ts`, `client.ts`, `queries.ts`, generated types)
  - `lib/api/` — API utilities and error/response handlers (`auth.ts`, `handlers.ts`, `errors.ts`)
  - `lib/api.ts` — simple fetch-based client used by services
  - `lib/services/` — higher-level service functions used by route handlers and UI
  - `lib/query-client.ts` / `lib/query-hooks.ts` — React Query client/hooks
- `public/`, `components/`, `styles/` — UI assets and components
- `README.md` — this file
- `docs/` — detailed docs and migration notes (see below)

Note: Spring is no longer used. The application reads/writes data directly from Supabase/Postgres.

---

## Testing and debugging tips

- Use browser devtools and the Network tab to inspect requests to `/api/*` and responses.
- To assert headers are forwarded, check `Authorization` header in outgoing requests from `lib/api.ts`.
- Add or inspect logging in `lib/api.ts` to see outgoing requests and response bodies.
- For unit tests: mock `lib/supabase/*` clients and the Supabase session methods.

Common debug commands:
- Check route file: `app/api/transactions/[[...id]]/route.ts` (or similar path)
- Test endpoint with curl (after login/with token): `curl -H "Authorization: Bearer <SUPABASE_JWT>" http://localhost:3000/api/transactions`
