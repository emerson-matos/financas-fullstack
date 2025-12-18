migration-to-next/docs/API_GUIDE.md#L1-400
# API Guide — Financas (Next.js + Supabase)

This document summarizes the runtime API surface implemented by the Next.js app, how authentication works, recommended usage patterns (client and server), and examples for common operations. It is a developer-focused reference derived from the code under `app/api/`, `lib/services/`, and `lib/supabase/`.

Quick links
- API routes root: `app/api/*`
- Server Supabase client: `lib/supabase/server.ts`
- Client Supabase helper: `lib/supabase/client.ts`
- Auth helper used in routes: `lib/api/auth.ts`
- Fetch-based client for frontend/services: `lib/api.ts`
- High-level service wrappers: `lib/services/*.ts`

If you need to run the app locally, follow `docs/QUICK_START.md`.

---

## High-level architecture

Request flow (typical):
1. Browser -> Next.js frontend (App Router page/component)
2. Component calls service/hook -> calls internal client (e.g. `lib/api.ts`) or React Query hook.
3. The client performs HTTP request to internal route under `/api/*`.
4. Route handler uses server Supabase client from `lib/supabase/server.ts` to read/write data.
5. Route returns standardized responses via `lib/api/handlers.ts`.

See the server client and auth helpers:
```migration-to-next/lib/supabase/server.ts#L1-200
// server-side Supabase client creation used by API route handlers
```

```migration-to-next/lib/api/auth.ts#L1-200
// requireAuth() validates session and returns { userId, session }
```

---

## Authentication

- Auth is handled by Supabase Auth.
- API routes use the server Supabase client (cookie-based) to check the current session via `requireAuth()` from `lib/api/auth.ts`.
- Typically, UI components sign in via the Supabase browser client (`lib/supabase/client.ts`), establishing a session cookie that server code will read when handling `/api/*` requests.

Server-side auth helper (routes call this):
```migration-to-next/lib/api/auth.ts#L1-200
export async function requireAuth(): Promise<AuthResult> { ... }
```

Notes:
- To call protected `/api/*` routes from CLI/Postman, include a valid Authorization header with a Supabase access token:
```migration-to-next/docs/API_GUIDE.md#L1-200
Authorization: Bearer <access_token>
```
- For browser-driven flows, sign-in via the UI is sufficient because server routes read the cookie.

---

## Response format and errors

Routes return JSON using helpers in `lib/api/handlers.ts`. Successful responses have the shape:
```migration-to-next/lib/api/handlers.ts#L1-200
{ data: <payload>, statusCode: 200 }
```

Errors use `createErrorResponse` and send:
```migration-to-next/lib/api/handlers.ts#L1-200
{ error: "<message>", statusCode: <status> }
```

Custom error classes live in `lib/api/errors.ts` (e.g., `BadRequestAlertException`, `NotFoundException`, `UnauthorizedException`).

---

## Main resource endpoints (overview)

The app implements REST-style endpoints under `/api/*`. Major resources:

- Transactions: `/api/transactions` (+ `/api/transactions/import`, `/api/transactions/bulk`)
- Users: `/api/users`, `/api/users/me`, `/api/users/complete-onboarding`, `/api/users/health`
- Categories: `/api/categories`
- Budgets: `/api/budgets`
- Accounts: `/api/accounts`
- Groups: `/api/groups`
- Budget Items: `/api/budget-items`
- Transaction Splits: `/api/transaction-splits`
- Group Memberships: `/api/group-memberships`
- Categorization Jobs: `/api/categorization-jobs`
- Reports: `/api/reports/*` (e.g., `/api/reports/monthly-summary`, `/api/reports/net-worth`)
- Exports: `/api/exports`

Each resource typically exposes:
- GET `/api/<resource>` — list (with pagination & filters)
- GET `/api/<resource>/:id` — fetch by id
- POST `/api/<resource>` — create
- PUT `/api/<resource>/:id` — replace/update
- PATCH `/api/<resource>/:id` — partial update
- DELETE `/api/<resource>/:id` — delete

Example: transactions route implementation:
```migration-to-next/app/api/transactions/[[...id]]/route.ts#L1-360
// GET/POST/PUT/PATCH/DELETE handlers for transactions (uses supabase server client)
```

---

## Pagination & common query params

List endpoints support:
- `page` (0-indexed)
- `size` (items per page)
- `sort` (e.g. `transacted_date,desc` or `name,asc`)
- Resource-specific filters (e.g., `start_date`, `end_date`, `account_id` for transactions)

Example request:
```migration-to-next/docs/API_GUIDE.md#L1-200
GET /api/transactions?page=0&size=20&sort=transacted_date,desc&account_id=<uuid>
```

Server returns paginated content using the page structure:
```migration-to-next/lib/api/handlers.ts#L1-200
{
  data: {
    content: [...],
    page: { size, total_elements, total_pages, number }
  },
  statusCode: 200
}
```

---

## Usage patterns (recommended)

Three main ways to interact with the API from frontend code:

1. React Query hooks (recommended)
   - Use prebuilt hooks (see `lib/query-client.ts` / `lib/query-hooks.ts`) for caching, mutations, and optimistic updates.
   - Example hook usage:
```migration-to-next/docs/API_GUIDE.md#L1-200
import { useTransactions, useCreateTransaction } from '@/lib/query-hooks';

const { data } = useTransactions({ page: 0, size: 20 });
await useCreateTransaction().mutateAsync({ amount: 100, accountId: '...' });
```

2. Service wrappers (higher-level)
   - `lib/services/*.ts` expose typed functions that call the internal client.
   - Example: `lib/services/transactions.ts` provides `getTransactions`, `createTransaction`, `updateTransaction`, `importTransactions`.
```migration-to-next/lib/services/transactions.ts#L1-200
// transactionService.getTransactions / createTransaction / importTransactions
```

3. Direct client for special cases
   - `lib/api.ts` is a small fetch-based client used by services. It resolves endpoints to `/api/*` by default (or to `NEXT_PUBLIC_API_URL` if full URLs are given).
```migration-to-next/lib/api.ts#L1-200
export const api = { get, post, put, patch, delete, downloadFile }
```

---

## Examples

A. Fetch transactions from a React component using the service
```migration-to-next/lib/services/transactions.ts#L1-200
// service: transactionService.getTransactions(params)
```

B. Creating a transaction via service (handles mapping to backend DTO)
```migration-to-next/lib/services/transactions.ts#L1-200
await transactionService.createTransaction({
  name: "Lunch",
  amount: 25.0,
  currency: "BRL",
  kind: "DEBIT",
  transactedDate: "2024-12-01",
  accountId: "<account-uuid>",
  categoryId: "<category-uuid>"
});
```

C. Using the fetch client directly
```migration-to-next/lib/api.ts#L1-200
const { data } = await api.get('/transactions', { params: { page: 0, size: 20 } });
```

D. cURL example (requires valid Supabase token or cookie)
```migration-to-next/docs/API_GUIDE.md#L1-200
curl -H "Authorization: Bearer <access_token>" \
  "http://localhost:3000/api/transactions?page=0&size=20"
```

---

## File-level pointers (where to change behavior)

- Authentication and session lookup:
```migration-to-next/lib/api/auth.ts#L1-200
```

- Server Supabase client (how cookies/session are read):
```migration-to-next/lib/supabase/server.ts#L1-200
```

- Client Supabase creation (browser):
```migration-to-next/lib/supabase/client.ts#L1-200
```

- Route examples (implementations):
```migration-to-next/app/api/transactions/[[...id]]/route.ts#L1-360
```

- Service layer:
```migration-to-next/lib/services/transactions.ts#L1-200
```

- Fetch client used by services:
```migration-to-next/lib/api.ts#L1-200
```

---

## Testing & local debugging tips

- To exercise protected routes, sign in through the UI locally so the session cookie exists.
- Use the browser devtools Network tab to inspect outgoing requests to `/api/*` and server responses.
- To test via CLI, get an access token from Supabase (or copy the session cookie) and include an `Authorization: Bearer <token>` header.
- Re-generate Supabase types after schema changes:
```migration-to-next/docs/QUICK_START.md#L1-200
pnpm supabase:types
```
- Local Supabase: `pnpm supabase:start`, `pnpm db:migrate` and stop with `pnpm supabase:stop`.

---

## Common troubleshooting

- 401 Unauthorized:
  - Ensure the user is signed in (browser session cookie present) or include a valid Supabase access token.
  - Verify `NEXT_PUBLIC_SUPABASE_URL` and publishable keys are correct in `.env.local` and in Vercel env settings.

- Data not found / 404:
  - Confirm route is implemented under `app/api/<resource>/[[...id]]/route.ts`.
  - Check `lib/api/errors.ts` and the route logic that throws `NotFoundException`.

- Unexpected data / missing fields:
  - Inspect service mapping in `lib/services/*` (some fields are mapped between frontend DTOs and database shape).
  - Compare direct Supabase query results in Supabase SQL editor to the route output.

---

## Extending the API

To add a new resource:
1. Create a new folder under `app/api/<resource>/[[...id]]` and add `route.ts` implementing handlers (GET/POST/PUT/PATCH/DELETE).
2. Use `lib/supabase/server.ts` to create a server client inside each handler.
3. Add error handling via `lib/api/errors.ts` and `lib/api/handlers.ts` helpers.
4. Add a service wrapper in `lib/services/<resource>.ts` and (optionally) React Query hooks in `lib/query-hooks.ts`.

Skeleton example:
// See app/api/transactions/[[...id]]/route.ts for a full implementation example.

---

## Closing notes

- The app has transitioned from a proxy model (previously Spring) to a Supabase-first model. All data-access patterns should be implemented using `lib/supabase/*` helpers and service wrappers.
- Keep docs in sync — this `docs/API_GUIDE.md` is intended as a living reference. If you add routes or change authentication flow, update this guide and `docs/ARCHITECTURE.md`.

If you want, I can also:
- Generate a full endpoint-by-endpoint table with expected request/response shapes (I can derive that from route implementations).
- Create a quick `curl` collection that includes how to obtain a temporary Supabase token for CLI testing.