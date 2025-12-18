# Quick Start — Local development & Vercel deployment (Supabase)

This quick start covers how to run the project locally using Supabase and how to deploy to Vercel. It assumes the repository root is the current working directory and that you use `pnpm` (substitute `npm` where appropriate).

Contents
- Prerequisites
- Environment variables
- Local Supabase (optional)
- Local development
- Generating Supabase types & migrations
- Testing API routes
- Deploying to Vercel
- Troubleshooting
- Where to look in the code

---

## Prerequisites

- Node.js 18+ (LTS recommended)
- pnpm (recommended) or npm/yarn
- Docker (required for `supabase start` when running Supabase locally)
- Supabase account (hosted) OR Supabase CLI for local dev
- Vercel account for production deployment (recommended)

---

## Environment variables

Create a local env file (ignored by git):

```bash
cp .env.local.example .env.local
```

Minimal `.env.local` for Supabase-driven app:

```env
# Client-facing (public) keys used by browser-side code
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=pk.<public_key>

# Server-side keys used by SSR/server helpers
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=sk.<server_key>

# Optional: DB URL for migrations / CI
SUPABASE_DB_URL=postgres://user:pass@host:5432/dbname
```

Notes:
- Keep secret keys out of source control. Use Vercel Environment Variables for production.
- The project expects `lib/supabase/server.ts` and `lib/supabase/client.ts` to read these env vars.

---

## Local Supabase (optional)

If you want to run Supabase locally for full offline development (requires Docker & Supabase CLI):

1. Start local Supabase:
   ```bash
   pnpm supabase:start
   # alias for: npx supabase start
   ```

2. Apply local DB migrations (if you have them):
   ```bash
   pnpm db:migrate
   # alias for: npx supabase db push --local
   ```

3. Generate TypeScript types for Supabase schema:
   ```bash
   pnpm supabase:types
   # alias for:
   # npx supabase gen types typescript --local > lib/supabase/types.ts
   ```

4. Stop the local Supabase stack when done:
   ```bash
   pnpm supabase:stop
   ```

If you use hosted Supabase, skip the local start and ensure the env vars point to your hosted project.

---

## Local development

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Run dev server:
   ```bash
   pnpm dev
   # runs `next dev`
   ```

3. Open the app:
   - Visit `http://localhost:3000`

4. Sign in:
   - Use the UI to authenticate via Supabase Auth (email/magic link or OAuth, depending on your Supabase settings).

While developing, most API logic lives under `app/api/**/route.ts` and interacts with Supabase via `lib/supabase/*`.

---

## Generating types & migrations

- Generate Supabase TypeScript types:
  ```bash
  pnpm supabase:types
  ```

- DB migration helper commands:
  - Push local migrations:
    ```bash
    pnpm db:migrate
    # npx supabase db push --local
    ```
  - Push to production DB (uses `SUPABASE_DB_URL`):
    ```bash
    pnpm db:migrate:prod
    # npx supabase db push --db-url "$SUPABASE_DB_URL"
    ```

Use these when you change database schema or add new tables/columns.

---

## Testing API routes

API route handlers are available at `/api/*` (e.g. `/api/transactions`). Because this app uses Supabase auth and server-side cookies, testing endpoints directly has two primary approaches:

1. Via the browser / frontend UI
   - Sign in through the UI, open the Network tab, and make UI actions that call `/api/*`. This is the simplest for routes that require session cookies.

2. Via curl / Postman (requires auth cookie or bearer token)
   - Obtain an access token in the browser console (from the Supabase client or response) and include it as header:
     ```
     Authorization: Bearer <access_token>
     ```
   - Example (replace token):
     ```bash
     curl -H "Authorization: Bearer <token>" http://localhost:3000/api/transactions
     ```
   - Alternatively, use the browser to copy the session cookie and include it in your requests when testing locally.

For most dev tasks, using the frontend UI to exercise the endpoints is fastest.

---

## Deploying to Vercel

1. Connect the Git repository to Vercel.

2. Set environment variables in Vercel (Project → Settings → Environment Variables):
   - `SUPABASE_URL`
   - `SUPABASE_PUBLISHABLE_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_DB_URL` (if you run migrations in CI)

3. Build & run:
   - Vercel will run the default build (`pnpm build`) and deploy the app. Ensure `pnpm` is available, or set the install command to `npm install` if you prefer.

4. Post-deploy:
   - Confirm the site (production domain) can authenticate and that API routes return expected results.
   - If you use managed Supabase, ensure CORS / allowed origins are configured (not usually required for server-side calls but relevant for client requests).

Optional: Use Vercel's dashboard to add preview environment variables for PR previews.

---

## Troubleshooting

- 401 Unauthorized on API routes
  - Ensure you are authenticated in the browser (Supabase session cookie must be present).
  - Inspect `lib/supabase/server.ts` to see how cookies are read for SSR/API routes.
  - Check that `NEXT_PUBLIC_SUPABASE_URL` and publishable keys are correct.

- Local Supabase not starting
  - Ensure Docker is running.
  - Run `pnpm supabase:start` and inspect logs from the Supabase CLI.

- Migrations fail / DB connection errors
  - Ensure `SUPABASE_DB_URL` is correct when using `db:migrate:prod`.
  - Check network access to the DB from CI / your environment.

- Missing types or TS errors
  - Run `pnpm supabase:types` to regenerate `lib/supabase/types.ts`.
  - Run `pnpm build` or `npx tsc --noEmit` to see type errors.

- Unexpected responses / data differences
  - Check the SQL/queries in `lib/supabase/queries.ts` (if present) and the service wrappers in `lib/services/*.ts`.
  - Compare direct Supabase queries (via Supabase UI or psql) to what the route returns.

---

## Where to look (important files)

- `app/api/**/route.ts` — API route handlers
- `lib/supabase/server.ts` — server-side Supabase client creation (used in API routes)
- `lib/supabase/client.ts` — browser/client Supabase client creation
- `lib/supabase/types.ts` — generated TypeScript types for the Supabase schema
- `lib/api/auth.ts` — auth helper `requireAuth()` used by routes
- `lib/api.ts` — fetch-based client used by services / UI code
- `lib/services/*.ts` — higher-level services for transactions, users, reports, etc.
- `package.json` — scripts (e.g., `supabase:start`, `db:migrate`, `supabase:types`)

---

If you'd like, I can:
- Create `docs/ARCHITECTURE.md` describing the request & auth flow (browser -> Next.js -> Supabase) with diagrams.
- Create a `docs/API_GUIDE.md` that lists endpoints and example requests/responses based on the current `app/api` routes.
- Generate a `curl` quick-reference that includes a short method to fetch a Supabase token for CLI tests.

Which of those should I create next?