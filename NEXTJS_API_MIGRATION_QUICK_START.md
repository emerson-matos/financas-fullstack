# Spring to Next.js API Migration - Quick Start

## What Was Done

The Java Spring Boot backend API has been successfully migrated to Next.js API routes. This migration creates a lightweight adapter layer that proxies requests to your existing Spring backend while providing:

✅ Unified OAuth2/JWT authentication via Auth0  
✅ Standardized API response formatting  
✅ Centralized error handling  
✅ Type-safe API client utilities  
✅ React Query hooks for frontend integration  
✅ Comprehensive documentation  

## Directory Structure

```
app/api/
├── transactions/          # Transaction CRUD + import/bulk endpoints
├── users/                 # User management endpoints
├── categories/            # Category management endpoints
├── budgets/               # Budget management endpoints
├── accounts/              # User account management endpoints
├── groups/                # Group management endpoints
├── budget-items/          # Budget item endpoints
├── transaction-splits/    # Transaction split endpoints
├── group-memberships/     # Group membership endpoints
├── categorization-jobs/   # Categorization job endpoints
├── reports/               # Reporting endpoints
└── exports/               # Data export endpoints

lib/
├── api/
│   ├── errors.ts          # Custom error classes
│   ├── handlers.ts        # Response formatting helpers
│   ├── auth.ts            # Authentication utilities
│   └── backend-client.ts  # Spring backend HTTP client
├── api-utils.ts           # API query utilities
└── query-hooks.ts         # React Query hooks factory
```

## Getting Started

### 1. Set Up Environment Variables

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local` and fill in your configuration:

```env
# Auth0 settings (get from Auth0 dashboard)
AUTH0_SECRET=your_secret
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret

# Spring backend URL
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### 2. Start the Spring Backend

```bash
cd ../financas-spring
./gradlew bootRun
```

The backend should be running at `http://localhost:8080`

### 3. Start Next.js Development Server

```bash
pnpm dev
```

Visit `http://localhost:3000`

### 4. Test an API Endpoint

```bash
# Get list of transactions
curl -X GET http://localhost:3000/api/transactions

# Note: You'll need to be authenticated. If it fails, log in first via the UI.
```

## Using the API in Your Frontend Code

### Option 1: Direct API Calls

```typescript
import { api } from "@/lib/api";

// Fetch data
const response = await api.get("/api/transactions", { 
  params: { page: 0, size: 20 } 
});

// Create resource
const newTransaction = await api.post("/api/transactions", {
  amount: 100,
  category: "Food"
});
```

### Option 2: API Utils (Recommended)

```typescript
import { 
  fetchPaginatedResources, 
  createResource,
  endpoints 
} from "@/lib/api-utils";

// Fetch transactions
const transactions = await fetchPaginatedResources(endpoints.transactions, {
  page: 0,
  size: 20,
  sort: "transactedDate,desc"
});

// Create transaction
const newTx = await createResource(endpoints.transactions, {
  amount: 100,
  category: "Food"
});
```

### Option 3: React Query Hooks (Best for React Components)

```typescript
import { useTransactions, useCreateTransaction } from "@/lib/query-hooks";

function TransactionsList() {
  // Fetch transactions with automatic caching and refetching
  const { data, isLoading } = useTransactions({
    page: 0,
    size: 20,
    sort: "transactedDate,desc"
  });

  // Create transaction
  const createMutation = useCreateTransaction();
  
  const handleCreate = async () => {
    await createMutation.mutateAsync({
      amount: 100,
      category: "Food"
    });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Transactions</h1>
      {data?.content.map(tx => (
        <div key={tx.id}>{tx.amount}</div>
      ))}
      <button onClick={handleCreate}>Add Transaction</button>
    </div>
  );
}
```

## Available Endpoints

### Transactions
```
GET    /api/transactions              # List transactions
GET    /api/transactions/:id          # Get transaction
POST   /api/transactions              # Create transaction
PUT    /api/transactions/:id          # Update transaction
PATCH  /api/transactions/:id          # Partial update
DELETE /api/transactions/:id          # Delete transaction
POST   /api/transactions/import       # Import from file
POST   /api/transactions/bulk         # Bulk create
```

### Users
```
GET    /api/users                     # List users
GET    /api/users/:id                 # Get user
POST   /api/users                     # Create user
PUT    /api/users/:id                 # Update user
PATCH  /api/users/:id                 # Partial update
DELETE /api/users/:id                 # Delete user
```

### Categories
```
GET    /api/categories                # List categories (cached)
GET    /api/categories/:id            # Get category
POST   /api/categories                # Create category
PUT    /api/categories/:id            # Update category
PATCH  /api/categories/:id            # Partial update
DELETE /api/categories/:id            # Delete category
```

### Budgets
```
GET    /api/budgets                   # List budgets
GET    /api/budgets/:id               # Get budget
POST   /api/budgets                   # Create budget
PUT    /api/budgets/:id               # Update budget
PATCH  /api/budgets/:id               # Partial update
DELETE /api/budgets/:id               # Delete budget
```

### Accounts (User Accounts)
```
GET    /api/accounts                  # List accounts
GET    /api/accounts/:id              # Get account
POST   /api/accounts                  # Create account
PUT    /api/accounts/:id              # Update account
PATCH  /api/accounts/:id              # Partial update
DELETE /api/accounts/:id              # Delete account
```

### Groups
```
GET    /api/groups                    # List groups
GET    /api/groups/:id                # Get group
POST   /api/groups                    # Create group
PUT    /api/groups/:id                # Update group
PATCH  /api/groups/:id                # Partial update
DELETE /api/groups/:id                # Delete group
```

All other resources follow the same pattern:
- `/api/budget-items`
- `/api/transaction-splits`
- `/api/group-memberships`
- `/api/categorization-jobs`
- `/api/reports`
- `/api/exports`

## Error Handling

All API endpoints return standardized error responses:

```typescript
interface ApiError {
  error: string;
  statusCode: number;
  errorKey?: string;
}
```

Example error handling:

```typescript
try {
  const data = await api.get("/api/transactions");
} catch (error) {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as ApiError;
    console.error(`Error [${apiError.statusCode}]: ${apiError.error}`);
  }
}
```

## Query Parameters

All list endpoints support pagination and filtering:

```
GET /api/transactions?page=0&size=20&sort=transactedDate,desc&status=active
```

- `page` - Page number (0-indexed, default: 0)
- `size` - Items per page (default: 20)
- `sort` - Sort field and direction (e.g., "name,asc")
- Additional filter parameters are passed to Spring backend

## Authentication

All requests are automatically authenticated via the Auth0 session. The middleware in `middleware.ts` handles:

1. Checking if user is logged in
2. Validating JWT token
3. Attaching authorization headers to requests

No additional auth setup needed in your API routes! Just call `requireAuth()`:

```typescript
export async function GET(request: NextRequest) {
  const { userId, session } = await requireAuth(request);
  // Now you have user info and can proceed
}
```

## Troubleshooting

### 401 Unauthorized
- Make sure you're logged in
- Check Auth0 configuration in `.env.local`
- Clear browser cookies and log in again

### Connection to Spring Backend Failed
- Verify Spring backend is running on configured port
- Check `NEXT_PUBLIC_API_URL` environment variable
- Look for CORS errors in browser console

### "Cannot GET /api/transactions"
- Check the API route file exists
- Verify file is in correct location: `app/api/transactions/[[...id]]/route.ts`
- Restart Next.js dev server

### Types Not Found
```bash
# Run type checking
npm run build

# Or use TypeScript compiler
npx tsc --noEmit
```

## Next Steps

### To migrate Spring business logic to Node.js:

1. Set up database ORM (Prisma or Drizzle)
2. Migrate entity models to schema definitions
3. Create service layer in TypeScript
4. Gradually migrate endpoints to use local services
5. Run both backends in parallel during transition

### To add new endpoints:

```typescript
// 1. Create directory: app/api/my-resource/[[...id]]/
// 2. Create route.ts:

import { NextRequest } from "next/server";
import { createBackendClient } from "@/lib/api/backend-client";
import { createErrorResponse, createSuccessResponse } from "@/lib/api/handlers";
import { requireAuth } from "@/lib/api/auth";

export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);
    const client = createBackendClient();
    const data = await client.get("/api/my-resource");
    return createSuccessResponse(data);
  } catch (error) {
    return createErrorResponse(error);
  }
}
```

## Key Files to Know

| File | Purpose |
|------|---------|
| `lib/api.ts` | Main axios client instance |
| `lib/api-utils.ts` | Query utilities for API calls |
| `lib/query-hooks.ts` | React Query hooks |
| `lib/api/auth.ts` | Auth helpers and middleware |
| `lib/api/backend-client.ts` | HTTP client for Spring backend |
| `lib/api/handlers.ts` | Response formatting utilities |
| `lib/api/errors.ts` | Custom error classes |
| `app/api/**/route.ts` | API route handlers |
| `middleware.ts` | Auth0 middleware configuration |

## Performance Tips

1. Use React Query for automatic caching
2. Set appropriate cache times for different data types
3. Use pagination for large datasets (don't load all at once)
4. Filter data on backend before sending
5. Consider implementing ISR for read-only endpoints

## Security Notes

⚠️ **Important**: 
- All API keys and secrets stay in `.env.local` (server-side only)
- Never expose Spring backend URL in frontend code
- All API routes require authentication
- Validate all inputs in API routes before forwarding to Spring
- Use HTTPS in production

## Documentation

For detailed information, see:
- `API_MIGRATION_GUIDE.md` - Complete migration documentation
- `API_REFACTORING_MIGRATION_PLAN.md` - Original refactoring plan
- Spring API documentation (in `financas-spring/` folder)

## Support

If you encounter issues:

1. Check the logs: `npm run dev` shows request errors
2. Enable debug mode: `DEBUG=financas:* npm run dev`
3. Test endpoints with curl/Postman
4. Verify Spring backend is running
5. Check Auth0 configuration

Good luck! 🚀
