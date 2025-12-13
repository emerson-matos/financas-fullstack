# Supabase Migration Notes

## Overview
This project has been migrated from a Spring Boot backend proxy pattern to a fully server-side rendered Next.js application with Supabase as the database.

## Architecture Changes

### Before (Spring Backend Proxy)
- Frontend → Axios with Bearer token → Spring Backend → Database
- Complex auth token management (getAccessToken, interceptors, refresh logic)
- Axios interceptors for 401 handling, retry logic, token refresh

### After (Supabase Direct)
- Frontend → Native Fetch (session cookies) → Next.js API Routes → Supabase
- Simple session-based auth via Auth0 + @auth0/nextjs-auth0
- Built-in cookie handling - no Bearer tokens needed
- Supabase client (supabaseAdmin) only on server-side

## Key Changes

### 1. API Client (`lib/api.ts`)
- **Removed**: axios, axios-retry, complex interceptors
- **Added**: Simple fetch-based wrapper with timeout handling
- **Authentication**: Now uses session cookies automatically (Auth0)
- **No Bearer tokens**: Server validates session via `requireAuth()` middleware

### 2. Database Access
- **Location**: All in Next.js API routes (`app/api/*`)
- **Library**: @supabase/supabase-js (server-side only)
- **Authentication**: Service role key for server operations
- **Type Safety**: Full TypeScript definitions in `lib/supabase/types.ts`

### 3. Query Utilities (`lib/supabase/queries.ts`)
- `paginate()` - List with pagination, filtering, sorting
- `findById()` - Get single record
- `create()` - Insert with audit fields
- `update()` - Update with audit fields  
- `deleteById()` - Delete record

## API Routes Structure

All 14 API routes follow the same pattern:

```typescript
export async function GET(request: NextRequest, { params }) {
  const { userId } = await requireAuth(request); // Validates Auth0 session
  const data = await paginate("table_name", { page, size, sort });
  return createSuccessResponse(data);
}
```

Routes handle:
- ✅ Session authentication (Auth0)
- ✅ Database operations (Supabase)
- ✅ Response formatting
- ✅ Error handling

## Environment Setup

Required environment variables:

```env
# Auth0
AUTH0_SECRET=...
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
AUTH0_CLIENT_ID=...
AUTH0_CLIENT_SECRET=...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=... (server-side only)
```

## Removed Dependencies

- `axios` - No longer needed
- `axios-retry` - No longer needed
- Old proxy backend client (`lib/api/backend-client.ts`)

## Benefits

1. **Simpler authentication** - No token management, just session cookies
2. **Type-safe database** - Full TypeScript types from Supabase
3. **Faster queries** - Direct database access vs. HTTP + Java Spring
4. **Fewer dependencies** - Native fetch API instead of axios
5. **Better security** - Credentials never exposed to frontend
6. **Server-side rendering** - Can use Supabase in Server Components

## Migration Status

- ✅ All 14 API routes migrated to Supabase
- ✅ Database type definitions complete (9 tables)
- ✅ Query utilities implemented
- ✅ Axios removed
- ✅ Simple fetch-based API client
- ⚠️ Report/Export endpoints (partial - need custom query logic)
- ⏳ File import logic (needs implementation)

## Testing Checklist

- [ ] Auth0 login works
- [ ] Session cookies are set
- [ ] API requests succeed without 401 errors
- [ ] CRUD operations work on all resources
- [ ] Pagination and filtering work
- [ ] Error handling works correctly
- [ ] File upload/download works
- [ ] Reports/Exports work

## Notes

- Auth0 session is validated server-side via `requireAuth()`
- No Bearer tokens - cookies handle auth
- All database access is server-side only
- Frontend cannot access Supabase directly (only service role key on server)
- Failed requests will return HTTP error codes (4xx/5xx) that need proper error UI
