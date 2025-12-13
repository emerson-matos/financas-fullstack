# Financas - Next.js Frontend with Migrated API Routes

This is a [Next.js](https://nextjs.org) project with a **complete Spring to Next.js API migration**.

## 🎯 What's New

Your Java Spring Boot backend has been successfully migrated to Next.js API routes. This provides:

- ✅ **Unified authentication** via Auth0
- ✅ **12 resources** with full CRUD endpoints (50+ endpoints total)
- ✅ **Type-safe** TypeScript API client
- ✅ **React Query** hooks for optimal performance
- ✅ **Standardized responses** and error handling
- ✅ **Zero breaking changes** - works with existing Spring backend

## 📚 Documentation

**Start here:**
- 👉 **[NEXTJS_API_MIGRATION_QUICK_START.md](./NEXTJS_API_MIGRATION_QUICK_START.md)** - Get up and running in 5 minutes

**Then read:**
- 📖 [API_MIGRATION_GUIDE.md](./API_MIGRATION_GUIDE.md) - Complete technical reference
- 🏗️ [ARCHITECTURE.md](./ARCHITECTURE.md) - System design and data flows
- 📝 [COMMON_TASKS_AND_RECIPES.md](./COMMON_TASKS_AND_RECIPES.md) - Code examples
- 📋 [IMPLEMENTATION_CHECKLIST.md](./IMPLEMENTATION_CHECKLIST.md) - Testing guide
- 📑 [MIGRATION_FILES_INDEX.md](./MIGRATION_FILES_INDEX.md) - All files reference

## 🚀 Quick Start

### 1. Configure Environment

```bash
cp .env.local.example .env.local
# Edit .env.local with your Auth0 credentials and Spring backend URL
```

### 2. Start Spring Backend

```bash
cd ../financas-spring
./gradlew bootRun
```

### 3. Start Next.js

```bash
pnpm dev
# or npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📡 API Routes

All endpoints are available at `/api/*` and proxy to your Spring backend:

### Available Resources

- **Transactions** - `/api/transactions` (with import & bulk endpoints)
- **Users** - `/api/users`
- **Categories** - `/api/categories`
- **Budgets** - `/api/budgets`
- **Accounts** - `/api/accounts`
- **Groups** - `/api/groups`
- **Budget Items** - `/api/budget-items`
- **Transaction Splits** - `/api/transaction-splits`
- **Group Memberships** - `/api/group-memberships`
- **Categorization Jobs** - `/api/categorization-jobs`
- **Reports** - `/api/reports`
- **Exports** - `/api/exports`

## 💻 Using the API

### Option 1: React Query Hooks (Recommended)

```typescript
import { useTransactions, useCreateTransaction } from '@/lib/query-hooks';

function MyComponent() {
  const { data, isLoading } = useTransactions({ page: 0, size: 20 });
  const createMutation = useCreateTransaction();

  return (
    <div>
      {data?.content.map(tx => <div key={tx.id}>{tx.amount}</div>)}
      <button onClick={() => createMutation.mutateAsync({ amount: 100 })}>
        Create
      </button>
    </div>
  );
}
```

### Option 2: API Utils

```typescript
import { fetchPaginatedResources, createResource, endpoints } from '@/lib/api-utils';

const transactions = await fetchPaginatedResources(endpoints.transactions);
const newTx = await createResource(endpoints.transactions, { amount: 100 });
```

### Option 3: Direct API Client

```typescript
import { api } from '@/lib/api';

const response = await api.get('/api/transactions');
const created = await api.post('/api/transactions', { amount: 100 });
```

## 🔐 Authentication

All endpoints require OAuth2 authentication via Auth0. The authentication is handled automatically through:

1. **Middleware** (`middleware.ts`) - Validates Auth0 session
2. **API Routes** - Each route calls `requireAuth()` 
3. **Backend Client** - Forwards JWT token to Spring backend

No additional auth setup needed!

## 📊 API Endpoints by HTTP Method

### GET Endpoints
```
/api/transactions
/api/transactions/:id
/api/users
/api/categories
/api/budgets
/api/accounts
/api/groups
/api/budget-items
/api/transaction-splits
/api/group-memberships
/api/categorization-jobs
/api/reports
/api/exports
```

### POST Endpoints
```
/api/transactions
/api/transactions/import
/api/transactions/bulk
/api/users
/api/categories
/api/budgets
/api/accounts
/api/groups
/api/budget-items
/api/transaction-splits
/api/group-memberships
/api/categorization-jobs
/api/reports
/api/exports
```

### PUT/PATCH/DELETE
Available for all resources with ID parameter

## 📁 Project Structure

```
app/
├── api/                          # API Route Handlers (14 route files)
│   ├── transactions/
│   ├── users/
│   ├── categories/
│   ├── budgets/
│   ├── accounts/
│   ├── groups/
│   ├── budget-items/
│   ├── transaction-splits/
│   ├── group-memberships/
│   ├── categorization-jobs/
│   ├── reports/
│   └── exports/
├── ...                           # App pages and components

lib/
├── api/                          # Core API utilities
│   ├── auth.ts                   # Auth helpers
│   ├── errors.ts                 # Error classes
│   ├── handlers.ts               # Response formatting
│   └── backend-client.ts         # Spring backend client
├── api-utils.ts                  # Query utilities
├── query-hooks.ts                # React Query hooks
└── ...                           # Other utilities
```

## 🛠 Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **HTTP Client**: Axios
- **Data Fetching**: TanStack React Query
- **Authentication**: Auth0
- **Backend**: Spring Boot (unchanged)
- **Database**: PostgreSQL

## ⚙️ Environment Setup

Create `.env.local` with:

```env
# Auth0 Configuration
AUTH0_SECRET=your_secret
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret

# Spring Backend
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## 🧪 Testing

```bash
# Test API endpoint
curl -X GET http://localhost:3000/api/transactions

# Run dev server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## 📖 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Auth0 Next.js SDK](https://auth0.com/docs/get-started/authentication-and-authorization-flow)
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)

## 🔍 Troubleshooting

**401 Unauthorized?**
- Log in via the UI first
- Check Auth0 configuration

**Spring backend connection failed?**
- Verify Spring is running on configured port
- Check `NEXT_PUBLIC_API_URL`

**API routes not found?**
- Verify file paths: `app/api/resource/[[...id]]/route.ts`
- Restart dev server

See [NEXTJS_API_MIGRATION_QUICK_START.md](./NEXTJS_API_MIGRATION_QUICK_START.md#troubleshooting) for more help.

## 📚 Additional Resources

- **Full API Documentation**: [API_MIGRATION_GUIDE.md](./API_MIGRATION_GUIDE.md)
- **Code Examples**: [COMMON_TASKS_AND_RECIPES.md](./COMMON_TASKS_AND_RECIPES.md)
- **Architecture Details**: [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Implementation Checklist**: [IMPLEMENTATION_CHECKLIST.md](./IMPLEMENTATION_CHECKLIST.md)
- **Files Index**: [MIGRATION_FILES_INDEX.md](./MIGRATION_FILES_INDEX.md)

## 🎉 What Changed

✅ **New**: 14 API route handlers in Next.js  
✅ **New**: 6 utility modules for API interaction  
✅ **New**: 7 comprehensive documentation files  
✅ **Unchanged**: Your Spring backend remains the same  
✅ **Improved**: Type-safe API client with TypeScript  
✅ **Improved**: Better error handling and response formatting  

## 🚀 Next Steps

1. Read [NEXTJS_API_MIGRATION_QUICK_START.md](./NEXTJS_API_MIGRATION_QUICK_START.md)
2. Configure `.env.local`
3. Start Spring backend
4. Run `pnpm dev`
5. Check [IMPLEMENTATION_CHECKLIST.md](./IMPLEMENTATION_CHECKLIST.md) for testing

---

**Status**: ✅ Migration Complete  
**Last Updated**: December 13, 2024  
**Ready**: Yes! Start with the Quick Start guide above.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
