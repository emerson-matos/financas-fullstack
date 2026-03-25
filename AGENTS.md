# AGENTS.md - AI Agent Guidelines for Financial Dashboard

This document guides coding agents in maintaining consistency, quality, and security across the project. Keep it handy.

## 1. Core Commands

```
# Development
pnpm dev                           # Start dev server (https://localhost:3000 with HTTPS)
pnpm build                         # Build for production
pnpm start                         # Open existing production server

# Linting & Formatting
pnpm lint                          # Run ESLint on entire codebase

# Testing (Vitest + React Testing Library)
pnpm test                          # Run all tests once
pnpm test:watch                    # Run tests in watch mode
pnpm test filename.test.ts         # Run single test file
vitest run filename.test.ts        # Alternative: run single test file

# Database (Supabase local)
pnpm db:migrate                    # Push migrations to local DB
pnpm db:migrate:prod               # Push migrations to production DB
pnpm db:reset                      # Reset local database
pnpm db:seed                       # Reset and seed local database
pnpm db:diff                       # Show diff between schema and migrations
pnpm db:status                     # List migration status

# Supabase CLI
pnpm supabase:start                # Start local Supabase services
pnpm supabase:stop                 # Stop local Supabase services
pnpm supabase:types                # Generate TypeScript types from DB schema
```

## 2. Code Style & Conventions

### Imports
- **Only absolute imports** in non‑test files. Prefix project root with `@/`.
- Order: `react` → external libs → internal modules → types.
- Example:

```ts
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { transactionService } from "@/lib/services/transactions";
import type { Transaction } from "@/lib/types";
``` 

### Formatting
- Follow Prettier config (ts, json, md, yaml).
- ESLint rules are enforced; run `pnpm lint` before commits.

### Types
- Place shared types in `lib/types.ts`. Export as `export type { User, Transaction, ... }`.
- Prefer `type` for plain objects, `interface` for extending classes.
- Use Zod for runtime validation and derive TS types via `z.infer`.

### Naming
| Kind | Convention |
|------|------------|
| Files | kebab‑case (`transaction-form.tsx`) |
| Components | PascalCase (`TransactionForm`) |
| Hooks | `use…` prefix (`useTransactions`) |
| Services | lowercase (`transactionService`) |
| API routes | RESTful with dynamic segments (`[[...id]]`) |

### File Structure
```
app/
 ├── api/               # Next.js API routes
 ├── (public)/          # Public auth pages
 └── (protected)/       # Dashboard pages

lib/
 ├── api/              # HTTP client & error wrappers
 ├── services/         # Business logic
 ├── supabase/         # Database queries
 ├── schemas/          # Zod schemas
 └── types.ts          # Shared types

components/
 ├── ui/               # Shadcn/ui primitives
 └── <feature>/        # Feature‑specific components

hooks/                   # React‑Query hooks
```

### State Management
- **React Query** for server state (data fetching, caching, mutations)
- Use `@tanstack/react-query` for all async data operations
- Create custom hooks in `hooks/` folder wrapping React Query
- Example: `useTransactions`, `useCreateTransaction`
- Invalidate queries after mutations to refetch data

## 3. Error Handling
- Central error definitions: `lib/error-handler.ts`.
- Use enum `ErrorType` and `ErrorSeverity`.
- Wrap async calls with `try/catch` and translate errors via `classifyError`.
- React‑Query mutation example:

```ts
const mutation = useMutation({
  mutationFn: transactionService.create,
  onError: e => {
    const err = classifyError(e);
    // handle based on err.type / err.severity
  },
});
```

## 4. Testing
- Vitest + React‑Testing‑Library.
- Keep tests in same folder with `.test.ts` suffix.
- Use `renderHook` or `render` with `queryClientProvider` for React‑Query.
- Test files *may* use relative imports.

## 5. Database / Supabase
- Client‑side: `@/lib/supabase/client`.
- Server‑side: `@/lib/supabase/server`.
- Generate types with `pnpm supabase:types`.
- Enforce Row Level Security.

## 6. Security & Secrets
- Never expose Supabase service keys on the client.
- Store secrets in `.env` or GitHub secrets.
- Validate all inputs with Zod.
- Sanitize any user‑generated content before rendering.

## 7. Common Gotchas
1. **Relative imports in non‑tests** – always use `@/`.
2. **Environment variables** – prefix with `NEXT_PUBLIC_` for client access.
3. **Form schemas** – keep Zod schemas as source of truth for TS types.
4. **Error boundaries** – wrap layout or page components where errors might propagate.

## 8. Performance Tips
- Memoize heavy components with `React.memo`.
- Lazy‑load routes and heavy UI modules.
- Keep React‑Query cache keys unique per query.
- Monitor bundle size via `pnpm build`.

## 9. Development Notes
- Dev server runs on **HTTPS** (`https://localhost:3000`) with self-signed certificates
- Next.js 16 uses React 19 with async APIs for `params`, `searchParams`, `cookies`, `headers`
- Use `cache` function for data caching in server components
- Prefer Server Actions for form submissions where applicable

## 10. Running Tests
- Tests use **Vitest** with React Testing Library
- Test files: `*.test.ts` or `*.test.tsx` in same folder as source
- Import via `@testing-library/react` for component tests
- Import via `@testing-library/jest-dom` for DOM assertions
- Use `vitest` config for setup files and mocks

### Example Test Pattern
```ts
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MyComponent } from "./my-component";

const queryClient = new QueryClient();

test("renders correctly", () => {
  render(
    <QueryClientProvider client={queryClient}>
      <MyComponent />
    </QueryClientProvider>
  );
  expect(screen.getByText("Hello")).toBeInTheDocument();
});
```

---

*This file serves as the single source of truth for agents interacting with the repository.*
