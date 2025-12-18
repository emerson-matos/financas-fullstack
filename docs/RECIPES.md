migration-to-next/docs/RECIPES.md#L1-400
# RECIPES — Common Tasks (Supabase + Next.js + Vercel)

This file collects short, actionable recipes for frequent developer tasks in this repository:
- local Supabase workflows
- auth troubleshooting and token usage
- testing API routes (browser & CLI)
- DB migrations & types generation
- common debugging patterns
- quick examples for service usage

Use these as copy-paste snippets. If you need a longer how-to for any item, ask and I will expand.

---

## Table of contents
- Local Supabase: start / stop / migrate / seed
- Generate Supabase types
- Run the app locally
- Sign-in and obtain tokens (browser / CLI)
- Test protected API routes (curl / Postman)
- Reset DB & seed
- Import transactions (file import)
- Debugging auth & session issues
- Add a new API route (quick skeleton)
- Build & deploy to Vercel
- Useful file locations

---

## Local Supabase: start / stop / migrate / seed

Start the local Supabase stack (uses the Supabase CLI / Docker):

```migration-to-next/docs/RECIPES.md#L1-20
pnpm supabase:start      # runs `npx supabase start`
```

Apply local migrations (push schema changes to local Supabase):

```migration-to-next/docs/RECIPES.md#L21-40
pnpm db:migrate          # alias: npx supabase db push --local
```

Stop local Supabase:

```migration-to-next/docs/RECIPES.md#L41-60
pnpm supabase:stop       # runs `npx supabase stop`
```

Seed (if you have seed scripts configured):

```migration-to-next/docs/RECIPES.md#L61-80
pnpm db:seed             # runs `npx supabase db reset --seed-only` or similar
```

---

## Generate Supabase TypeScript types

Regenerate typed definitions from your Supabase schema (useful after schema or function changes):

```migration-to-next/docs/RECIPES.md#L81-100
pnpm supabase:types
# -> npx supabase gen types typescript --local > lib/supabase/types.ts
```

Check-in: `lib/supabase/types.ts` is usually generated and helpful for typesafe queries used by the services.

---

## Run the app locally

Install deps and start Next.js in dev mode:

```migration-to-next/docs/RECIPES.md#L101-120
pnpm install
pnpm dev                 # starts next dev server: http://localhost:3000
```

If you run Supabase locally, start it before `pnpm dev` and ensure `.env.local` points to the local instance or your hosted project.

---

## Sign-in and obtain tokens

A. From the browser console (fastest for CLI testing)

Open the app in the browser, sign in via the UI (email link or OAuth). Then in the console:

```migration-to-next/docs/RECIPES.md#L121-140
// In browser dev console, using the global/available supabase client:
const session = await supabase.auth.getSession();
console.log(session.data?.session?.access_token);
```

Use the printed token on the CLI for testing API routes.

B. From the server (for automated scripts)

If you have a service role key and need a server-side token for admin tasks, use server SDK patterns (be careful: don't expose service keys to the browser).

---

## Test protected API routes

A. Using curl with the access token (recommended for single requests):

```migration-to-next/docs/RECIPES.md#L141-160
curl -H "Authorization: Bearer <ACCESS_TOKEN>" \
  "http://localhost:3000/api/transactions?page=0&size=20"
```

B. Using Postman / HTTP client

- Add header: `Authorization: Bearer <ACCESS_TOKEN>`
- Request URL: `http://localhost:3000/api/transactions`
- Use `GET` / `POST` as needed. For POST/PUT, set `Content-Type: application/json` and include JSON body.

C. Browser (preferred for session-cookie-based flows)

- Sign in through the UI, then use the app to execute actions that hit `/api/*`.
- Use Network tab to inspect request/response and cookies.

---

## Reset DB & seed (careful, destructive)

Reset local DB (uses Supabase CLI; this will drop data):

```migration-to-next/docs/RECIPES.md#L161-180
pnpm db:reset            # alias for npx supabase db reset --local
# Or if you have a specific seed flow:
pnpm db:seed
```

For production databases, never run destructive commands locally. Use migration scripts and backups.

---

## Import transactions (file import recipe)

If your app supports importing transactions (see `app/api/transactions/import/route.ts`), the typical flow:

1. Use the UI to upload a file (the route parses and returns a preview).
2. Alternatively, call the import endpoint directly with the expected payload shape:

```migration-to-next/docs/RECIPES.md#L181-220
POST http://localhost:3000/api/transactions/import
Headers: Authorization: Bearer <token>, Content-Type: application/json
Body:
{
  "file_content": "...", // base64 or expected format depending on route
  "file_name": "bank.ofx",
  "file_format": "OFX",
  "account_id": "<account-uuid>"
}
```

The service `lib/services/transactions.ts` contains helpers (`parseFileImport`, `importTransactions`) — follow those shapes when calling programmatically.

---

## Debugging auth & session issues

Common causes:
- Wrong env vars (pointing to a different Supabase project)
- No session cookie in server requests
- Using a client-side token that has expired

Checklist:
1. Confirm `.env.local` or Vercel env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`.
2. In a server handler, log session retrieval path:

```migration-to-next/docs/RECIPES.md#L221-260
// Inspect requireAuth behavior (example)
import { requireAuth } from '@/lib/api/auth';
try {
  const { userId, session } = await requireAuth();
  console.log('userId', userId);
} catch (err) {
  console.error('Auth failed', err);
}
```

3. From the Browser console, verify session:

```migration-to-next/docs/RECIPES.md#L261-280
const s = await supabase.auth.getSession();
console.log(s);
```

4. If cookies are not sent, ensure the request domain and cookie configuration match (e.g. localhost dev differences vs deployed domain).

---

## Add a new API route — quick skeleton

Steps:
1. Create folder: `app/api/my-resource/[[...id]]/`
2. Create `route.ts` with method handlers (GET/POST/PUT/PATCH/DELETE).
3. Use server supabase client and `requireAuth()` where needed.
4. Reuse `createSuccessResponse()` / `createErrorResponse()` from `lib/api/handlers.ts`.

Example skeleton:

```migration-to-next/docs/RECIPES.md#L281-320
// app/api/my-resource/[[...id]]/route.ts
import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/api/auth';
import { createSuccessResponse, createErrorResponse } from '@/lib/api/handlers';

export async function GET(request: NextRequest, { params }){
  try {
    const supabase = await createClient();
    await requireAuth();
    // query supabase and return
    return createSuccessResponse({ ok: true });
  } catch (err) {
    return createErrorResponse(err);
  }
}
```

---

## Build & deploy to Vercel

1. Ensure repository is connected to Vercel.
2. Add environment variables (Vercel Project → Settings → Environment Variables):
   - `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - Optional: `SUPABASE_DB_URL` for migrations in CI
3. Push to Git and Vercel will run the build. Local build commands:

```migration-to-next/docs/RECIPES.md#L321-340
pnpm build
pnpm start                # start production server locally
```

Notes:
- For preview deployments, add preview env vars as needed.
- Avoid exposing server keys in `NEXT_PUBLIC_*` variables.

---

## Useful file locations (where to look)

- Server Supabase client: `lib/supabase/server.ts`
- Browser Supabase client: `lib/supabase/client.ts`
- API auth helpers: `lib/api/auth.ts`
- Response & error helpers: `lib/api/handlers.ts`, `lib/api/errors.ts`
- Fetch-based client used by UI/services: `lib/api.ts`
- Business logic: `lib/services/*.ts`
- Routes: `app/api/<resource>/[[...id]]/route.ts`

---

## Quick troubleshooting commands

- Show Next dev output:
```migration-to-next/docs/RECIPES.md#L341-360
pnpm dev
# Check console for stack traces, request logs, and error messages.
```

- Run TypeScript checks:
```migration-to-next/docs/RECIPES.md#L361-380
pnpm build
# or
npx tsc --noEmit
```

---

If you'd like, I can:
- Generate a `curl` cheat-sheet for every API endpoint based on `app/api/` routes.
- Create a Postman / HTTP collection file for import.
- Add step-by-step instructions for migrating any remaining database logic into `lib/services`.

Which recipe should I expand next?