# CLAUDE.md — Claude Code Instructions

> For full project conventions, code style, error handling, and database guidelines see [AGENTS.md](./AGENTS.md).

## Commands

```bash
pnpm test               # Run all tests once
pnpm test:watch         # Run tests in watch mode
pnpm db:reset           # Reset local database (applies all migrations)
pnpm db:migrate         # Push migrations to local DB
pnpm db:seed            # Reset and seed local database
pnpm dev                # Start dev server (https://localhost:3000)
pnpm lint               # Run ESLint
```

## Test Conventions

- Test files use the `.test.ts` suffix and live **in the same directory as the file under test** — never inside `__tests__/` folders.
- Use `vitest` with `vi.mock` for mocks. See existing tests in `app/api/groups/` for patterns.

## Security: User Ownership in API Handlers

**When creating a record that belongs to a user, always set `user_id: userId` explicitly.**

```ts
// CORRECT
const record = await create("table_name", {
  ...body,
  user_id: userId,   // ← always explicit
  created_by: userId,
});

// WRONG — user_id stays NULL, RLS may expose record to all users
const record = await create("table_name", {
  ...body,
  created_by: userId,
});
```

Never rely on `created_by` for data isolation — RLS policies filter by `user_id`, not `created_by`.

## RLS Requirements

Every new table that holds per-user data must have a SELECT policy that filters by `user_id = auth.uid()` (or equivalent). A policy of `USING (TRUE)` exposes all rows to all authenticated users.
