# AGENTS.md - AI Agent Guidelines for Financial Dashboard

This document guides coding agents in maintaining consistency, quality, and security across the project. Keep it handy.

## 1. Core Commands

```
# Start dev server (https://localhost:3000)
pnpm dev

# Build for production
pnpm build

# Open existing server
pnpm start

# Lint & format
pnpm lint

# Run tests
pnpm test          # All tests
pnpm test:watch    # Watch mode
pnpm test filename.test.ts          # Single test file
vitest run filename.test.ts         # Alternative single file
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

---

*This file serves as the single source of truth for agents interacting with the repository.*
