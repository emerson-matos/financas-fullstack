# Architecture — Financas (Next.js + Supabase, deployed to Vercel)

This document describes the current system architecture, auth and request flows, data flows for common operations, deployment guidance for Vercel + Supabase, and where to look when making changes. The project uses Next.js (App Router), Supabase for Auth + Postgres, and is deployed to Vercel.

Table of contents
- Purpose
- High-level architecture (ASCII diagram)
- Components
- Authentication & session model
- Request flow (browser → Vercel → Next → Supabase)
- Data flow examples
  - GET transactions (list)
  - POST create transaction
- Deployment & environment variables
- Performance and scaling considerations
- Security best practices
- Observability / monitoring
- How to add an API route
- Where to change behavior (important files)
- Glossary

---

Purpose
- Provide a single-source reference for engineers working on the frontend/server API layer.
- Reflect the current production setup: Next.js app hosted on Vercel, Supabase for Auth and Postgres.
- Make it easy to reason about where to implement changes and how requests flow end-to-end.

---

High-level architecture

ASCII overview:

  Browser (User)
      │
      │ HTTPS (static assets, API calls)
      ▼
  Vercel (Edge / Serverless)
      ├─ Serves Next.js App Router pages and server functions
      └─ Executes API route handlers under `app/api/*`
      │
      ▼
  Next.js API route (server-side)
      ├─ Creates a server Supabase client (reads cookies)
      ├─ Validates session with `requireAuth()` when needed
      └─ Reads/writes data via Supabase Postgres
      │
      ▼
  Supabase
      ├─ Auth (user sessions, tokens)
      └─ Postgres (data layer)

Notes:
- There is no Spring backend in this architecture any longer. All data access is performed against Supabase (Postgres).
- The app is Vercel-first: pages and API routes run in Vercel serverless/Edge runtime (App Router).

---

Components

- Next.js (App Router)
  - Routes and server handlers live under `app/` (for API routes: `app/api/<resource>/.../route.ts`).
  - Server logic is executed on Vercel in serverless functions.

- Supabase
  - Auth: manages users, sessions, and JWTs.
  - Postgres: the primary database for application data.
  - Optional: Supabase edge functions / storage if used elsewhere.

- Server-side helpers / libraries (in repo)
  - `lib/supabase/server.ts` — constructs the server-side Supabase client (reads cookies).
  - `lib/supabase/client.ts` — browser-side Supabase client (used in UI).
  - `lib/api/auth.ts` — `requireAuth()` and optional auth helpers used by route handlers.
  - `lib/services/*.ts` — service wrappers implementing business mappings and calling `lib/api` client.
  - `lib/api.ts` — small fetch-based client used by UI/services to call internal `/api/*` endpoints.
  - `lib/api/handlers.ts` — standardized response and error formatting.
  - `lib/api/errors.ts` — custom error classes.

---

Authentication & session model

- Primary provider: Supabase Auth.
- Browser sign-in:
  - The browser uses the client Supabase instance (`lib/supabase/client.ts`) to sign in (email/magic link or OAuth, depending on config).
  - Supabase sets a session (cookies or local storage, depending on client usage).
- Server-side validation:
  - API routes call `requireAuth()` (from `lib/api/auth.ts`) which uses the server Supabase client to validate the session and obtain `userId` and `session`.
  - Because server code uses a Supabase server client tied to the request (reads cookies), no manual token forwarding is necessary.
- CLI/Postman testing:
  - You can call protected API routes by including `Authorization: Bearer <access_token>` in the request or by using the session cookie.

---

Request flow (detailed)

1. Browser component calls a fetch/mutation (for UI code usually via React Query hook or service).
2. The client code calls the internal URL under `/api/*` (e.g., `fetch('/api/transactions')`) using `lib/api.ts` or React Query hooks which use it.
3. The request reaches Vercel and routes to the Next.js API route handler at `app/api/.../route.ts`.
4. Inside the API handler:
   - The handler creates a server Supabase client via `lib/supabase/server.ts`.
   - If the route is protected, it calls `requireAuth()` from `lib/api/auth.ts` to validate session/cookie and get `userId`.
   - The handler performs DB reads/writes via Supabase client (e.g., `.from('transactions').select(...)`).
   - The handler returns a standardized response via `lib/api/handlers.ts` (success or error).
5. The browser receives the response and React Query caches/updates the UI.

Benefits of this model:
- The server has direct secure access to the DB via Supabase (no client-side DB secrets exposed).
- Sessions are validated on the server using server-side clients that can read cookies.
- Deploying to Vercel is straightforward (App Router + API routes).

---

Data flow examples

A. GET transactions (list)

1. Component -> `useTransactions()` (React Query hook) or `transactionService.getTransactions()`.
2. Hook/service calls `lib/api.get('/transactions', { params: { page, size, ... } })`.
3. Next.js API handler `app/api/transactions/[[...id]]/route.ts` receives GET:
   - Creates server Supabase client via `lib/supabase/server.ts`.
   - Optionally calls `requireAuth()` to ensure session.
   - Builds query (filters, sort, range) and calls Supabase `.from('transactions').select(...)` with `count: 'exact'`.
   - Formats paginated response and returns JSON via `createSuccessResponse`.
4. React Query receives `data` and renders the list.

B. POST create transaction

1. Component submits a transaction form.
2. UI calls `transactionService.createTransaction(payload)` which uses `lib/api.post('/transactions', payload)`.
3. Next.js POST handler:
   - Creates server Supabase client and validates user via `requireAuth()` to get `userId`.
   - Translates DTO fields to DB fields (service or handler logic).
   - For `TRANSFER` kind, may create two linked transactions (source/destination) inside the server logic.
   - Calls Supabase `insert` operations via the server client.
   - Returns created resource (201) via `createSuccessResponse`.
4. React Query mutation resolves and cache is updated/invalidation happens.

---

Deployment & environment variables

- Deploy to Vercel.
- Required environment variables (set in Vercel Project Settings):
  - `SUPABASE_URL` — Supabase project URL (server-side).
  - `SUPABASE_PUBLISHABLE_KEY` — Supabase server key (if used server-side; keep secret).
  - `NEXT_PUBLIC_SUPABASE_URL` — public Supabase URL (client-side).
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — public/publishable key (client-side).
  - `SUPABASE_DB_URL` — optional, used by migration scripts or CI when pushing DB changes.
- Local development:
  - Use `.env.local` (gitignored) and `pnpm supabase:start` to run Supabase locally.
  - Use `pnpm db:migrate` and `pnpm supabase:types` for migrations and type generation.

---

Performance and scaling

- Serverless functions: short-lived; aim to keep handlers fast and avoid long-running synchronous tasks.
- Use database indexes on frequently-filtered fields (dates, user_id, account_id).
- Use pagination for lists: avoid returning large result sets.
- Consider caching at edge for truly static/read-only endpoints (but be careful with per-user data).
- Use connection pooling or Supabase edge functions if you hit connection limits — Supabase handles pooling on its hosted plan but monitor connections.

---

Security best practices

- Keep server keys secret (do not commit `SUPABASE_PUBLISHABLE_KEY` or `SUPABASE_DB_URL` to VCS).
- Validate and sanitize all incoming request data in API handlers.
- Use `requireAuth()` on routes that touch user-scoped data.
- For cross-tenant or multi-tenant flows, always scope queries by `user_id` or `group_id` as appropriate.
- Ensure Vercel project has only required environment variables for production. Use preview/environment-specific values for PR previews.

---

Observability / monitoring

- Log meaningful errors in API handlers (use `lib/api/handlers.ts` to log stack traces for non-production builds).
- On Vercel, enable project logs and set up alerting/monitoring for function errors or high latency.
- For database monitoring, use Supabase metrics and Postgres observability tools.
- Add structured logging (request ids, user ids) to trace requests across the stack.

---

How to add an API route (quick steps)

1. Create folder: `app/api/<resource>/[[...id]]/`.
2. Add `route.ts` and implement handlers: `export async function GET(...)`, `POST`, `PUT`, `PATCH`, `DELETE`.
3. Inside handler:
   - Create server Supabase client: `const supabase = await createClient()` from `lib/supabase/server.ts`.
   - If needed, call `await requireAuth()` from `lib/api/auth.ts`.
   - Use Supabase client to perform queries.
   - Return formatted responses using `createSuccessResponse()` or `createErrorResponse()` from `lib/api/handlers.ts`.
4. Optionally add service wrapper under `lib/services/<resource>.ts` and React Query hooks in `hooks/use-<resource>.ts`.

---

Where to change behavior (important files)

- `app/api/*/route.ts` — API route implementations for each resource.
- `lib/supabase/server.ts` — server-side client creation; adjust cookie handling or schema if needed.
- `lib/supabase/client.ts` — browser client; adjust auth flows or providers.
- `lib/api/auth.ts` — `requireAuth()` behavior and session handling.
- `lib/services/*.ts` — business mapping between frontend DTOs and DB shape.
- `lib/api.ts` — small fetch utility used by services and hooks for internal `/api` calls.
- `lib/api/handlers.ts` and `lib/api/errors.ts` — response formatting and error classes.

---

Glossary

- Server client: Supabase client created server-side that can read cookies and perform queries with server privileges.
- Publishable key: Public key safe to expose on client; server key must be kept secret.
- Route handler: The function(s) exported from `route.ts` in App Router that handle HTTP methods.
- React Query: The library used for caching/fetching on the client.

---

Questions / next actions

If you want, I can:
- Produce a one-page diagram (SVG/PNG) of the request flow for your README or Confluence.
- Generate an endpoint inventory (method + path + brief description) by scanning `app/api/*` and output a CSV/Markdown table.
- Add a short troubleshooting checklist for common auth/session problems.

Pick one and I'll prepare it next.