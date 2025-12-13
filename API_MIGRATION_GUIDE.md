# Spring to Next.js API Migration Guide

## Overview

This guide documents the migration of the Java Spring Boot backend API to Next.js API routes. The migration creates a lightweight API layer in Next.js that acts as a proxy/adapter to the existing Spring backend.

## Architecture

### Design Pattern: API Gateway/Adapter

The migration uses an **API Gateway Pattern** where:
- Next.js API routes act as thin adapters/proxies
- All business logic remains in the Spring backend
- Next.js handles authentication, request validation, and response formatting
- The frontend can call Next.js API routes instead of the Spring backend directly

### Benefits

1. **Unified Authentication**: Single OAuth2/JWT auth layer via Auth0
2. **Response Standardization**: Consistent response format across all endpoints
3. **Error Handling**: Centralized error handling and logging
4. **Gradual Migration**: Can gradually migrate business logic from Spring to Node.js
5. **Security**: Keep database connection strings and sensitive configs server-side only

## API Structure

```
app/api/
├── transactions/          # Transaction management
│   ├── [[...id]]/
│   ├── import/            # CSV/file import
│   └── bulk/              # Bulk creation
├── users/                 # User management
│   └── [[...id]]/
├── categories/            # Category management
│   └── [[...id]]/
├── budgets/               # Budget management
│   └── [[...id]]/
├── accounts/              # User accounts
│   └── [[...id]]/
├── groups/                # Group management
│   └── [[...id]]/
├── budget-items/          # Budget items
│   └── [[...id]]/
├── transaction-splits/    # Transaction splits
│   └── [[...id]]/
├── group-memberships/     # Group memberships
│   └── [[...id]]/
├── categorization-jobs/   # Categorization jobs
│   └── [[...id]]/
├── reports/               # Reporting
│   └── route.ts
└── exports/               # Data exports
    └── route.ts
```

## Endpoints Mapping

### Transactions
- `GET /api/transactions` - List transactions with pagination
- `GET /api/transactions/:id` - Get single transaction
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `PATCH /api/transactions/:id` - Partial update
- `DELETE /api/transactions/:id` - Delete transaction
- `POST /api/transactions/import` - Import from file
- `POST /api/transactions/bulk` - Bulk create

### Users
- `GET /api/users` - List users
- `GET /api/users/:id` - Get user
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `PATCH /api/users/:id` - Partial update
- `DELETE /api/users/:id` - Delete user

### Categories
- `GET /api/categories` - List categories (cached)
- `GET /api/categories/:id` - Get category
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `PATCH /api/categories/:id` - Partial update
- `DELETE /api/categories/:id` - Delete category

### Budgets
- `GET /api/budgets` - List budgets
- `GET /api/budgets/:id` - Get budget
- `POST /api/budgets` - Create budget
- `PUT /api/budgets/:id` - Update budget
- `PATCH /api/budgets/:id` - Partial update
- `DELETE /api/budgets/:id` - Delete budget

### Accounts (User Accounts)
- `GET /api/accounts` - List accounts
- `GET /api/accounts/:id` - Get account
- `POST /api/accounts` - Create account
- `PUT /api/accounts/:id` - Update account
- `PATCH /api/accounts/:id` - Partial update
- `DELETE /api/accounts/:id` - Delete account

### Groups
- `GET /api/groups` - List groups
- `GET /api/groups/:id` - Get group
- `POST /api/groups` - Create group
- `PUT /api/groups/:id` - Update group
- `PATCH /api/groups/:id` - Partial update
- `DELETE /api/groups/:id` - Delete group

### Budget Items
- `GET /api/budget-items` - List budget items
- `GET /api/budget-items/:id` - Get item
- `POST /api/budget-items` - Create item
- `PUT /api/budget-items/:id` - Update item
- `DELETE /api/budget-items/:id` - Delete item

### Transaction Splits
- `GET /api/transaction-splits` - List splits
- `GET /api/transaction-splits/:id` - Get split
- `POST /api/transaction-splits` - Create split
- `PUT /api/transaction-splits/:id` - Update split
- `DELETE /api/transaction-splits/:id` - Delete split

### Group Memberships
- `GET /api/group-memberships` - List memberships
- `GET /api/group-memberships/:id` - Get membership
- `POST /api/group-memberships` - Create membership
- `PUT /api/group-memberships/:id` - Update membership
- `DELETE /api/group-memberships/:id` - Delete membership

### Categorization Jobs
- `GET /api/categorization-jobs` - List jobs
- `GET /api/categorization-jobs/:id` - Get job
- `POST /api/categorization-jobs` - Create job
- `PUT /api/categorization-jobs/:id` - Update job
- `DELETE /api/categorization-jobs/:id` - Delete job

### Reports
- `GET /api/reports` - Get reports
- `POST /api/reports` - Create report

### Exports
- `GET /api/exports` - Get exports
- `POST /api/exports` - Create export

## Authentication

All endpoints require authentication via OAuth2/JWT tokens from Auth0.

### How It Works

1. User logs in via Auth0 frontend SDK
2. Auth0 returns JWT token
3. Frontend includes token in requests
4. Next.js middleware validates token
5. Each API endpoint calls `requireAuth()` to verify session
6. Authenticated requests are forwarded to Spring backend with token

### Implementation Details

```typescript
// In each route handler:
import { requireAuth } from "@/lib/api/auth";

export async function GET(request: NextRequest) {
  const { userId, session } = await requireAuth(request);
  // Now user is authenticated
}
```

## Error Handling

All errors follow a standardized format:

```typescript
interface ApiError {
  error: string;
  statusCode: number;
  errorKey?: string; // For specific error handling on frontend
}
```

### Error Types

- `BadRequestAlertException` - 400 Bad Request
- `NotFoundException` - 404 Not Found
- `UnauthorizedException` - 401 Unauthorized
- `ForbiddenException` - 403 Forbidden
- `ApiError` - Generic error with custom status code

## Response Format

All responses follow a standard format:

```typescript
interface ApiResponse<T> {
  data?: T;
  error?: string;
  statusCode: number;
}

// For paginated responses:
interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
```

## Pagination

List endpoints support pagination via query parameters:

- `page` - Page number (0-indexed, default: 0)
- `size` - Items per page (default: 20)
- `sort` - Sort field and direction (e.g., "name,asc" or "createdDate,desc")

Example:
```
GET /api/transactions?page=0&size=20&sort=transactedDate,desc
```

## Filtering

Most list endpoints support filtering via query parameters. Filter parameters are passed directly to the Spring backend. Common filters:

- `name` - Filter by name
- `status` - Filter by status
- `createdDateFrom` - Filter by creation date start
- `createdDateTo` - Filter by creation date end

Example:
```
GET /api/transactions?page=0&size=20&status=active&createdDateFrom=2024-01-01
```

## Setup Instructions

### 1. Environment Variables

Create `.env.local` file:

```bash
# Auth0
AUTH0_SECRET=your_secret_here
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret

# Spring Backend
NEXT_PUBLIC_API_URL=http://localhost:8080
# or for production:
# NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### 2. Install Dependencies

The following dependencies are already included in `package.json`:
- `@auth0/nextjs-auth0` - Auth0 integration
- `axios` - HTTP client
- `zod` - Schema validation

### 3. Verify Spring Backend is Running

Make sure your Spring backend is running and accessible at the `NEXT_PUBLIC_API_URL`:

```bash
cd ../financas-spring
./gradlew bootRun
```

### 4. Start Next.js Development Server

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

Visit `http://localhost:3000` to test the application.

## Frontend API Client

The frontend can now call Next.js API routes instead of the Spring backend directly:

```typescript
// Before (calling Spring directly):
const response = await fetch('http://localhost:8080/api/transactions');

// After (calling Next.js):
const response = await fetch('/api/transactions');
```

Update your API client in `lib/api.ts`:

```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api', // Now points to Next.js routes instead of Spring
});

// The apiClient will automatically:
// 1. Use the Auth0 session from Next.js middleware
// 2. Get standardized error responses
// 3. Support pagination and filtering
```

## Migration Path Forward

### Phase 1: Proxy All Endpoints (CURRENT)
- ✅ All endpoints are proxied to Spring backend
- ✅ Authentication layer in Next.js
- ✅ Standardized request/response format

### Phase 2: Migrate Business Logic (FUTURE)
```
1. Set up database connection in Next.js (Prisma/Drizzle ORM)
2. Gradually migrate services from Spring to Node.js
3. Update API routes to use local services instead of proxies
4. Run both backends in parallel during transition
5. Switch routes to Node.js services one by one
```

### Phase 3: Database Migration (FUTURE)
```
1. Run migrations from Spring Liquibase to Node.js equivalent
2. Set up PostgreSQL connection pooling
3. Migrate entity models to ORM schemas
4. Update repositories to use ORM
```

### Phase 4: Full Migration (FUTURE)
```
1. Sunset Spring backend
2. Deploy Next.js with full API implementation
3. Monitor performance and error rates
```

## Troubleshooting

### 401 Unauthorized
- Check Auth0 configuration
- Verify JWT token is valid
- Ensure environment variables are set correctly

### Spring Backend Connection Failed
- Verify Spring backend is running
- Check `NEXT_PUBLIC_API_URL` is correct
- Check for CORS issues (Spring backend should allow Next.js origin)

### Type Errors
- Run `npm run build` to check TypeScript errors
- Verify all imports use correct paths
- Check `tsconfig.json` path aliases

### Token Issues
- Clear browser cookies
- Check Auth0 token expiration
- Verify token is being sent in Authorization header

## Adding New Endpoints

To add a new endpoint:

1. Create directory: `app/api/resource-name/[[...id]]/`
2. Create `route.ts` with GET, POST, PUT, DELETE handlers
3. Use `requireAuth()` for authentication
4. Use `createSuccessResponse()` and `createErrorResponse()` for responses
5. Use `createBackendClient()` to call Spring backend

Example:

```typescript
// app/api/new-resource/[[...id]]/route.ts
import { NextRequest } from "next/server";
import { createBackendClient } from "@/lib/api/backend-client";
import { createErrorResponse, createSuccessResponse } from "@/lib/api/handlers";
import { requireAuth } from "@/lib/api/auth";

export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);
    const backendClient = createBackendClient();
    const data = await backendClient.get("/api/new-resource");
    return createSuccessResponse(data);
  } catch (error) {
    return createErrorResponse(error);
  }
}
```

## Testing

For testing, you can:

1. Use Postman or curl with Auth0 tokens
2. Run the Next.js dev server and test via browser
3. Mock the backend client for unit tests
4. Use integration tests with both backends running

## Performance Considerations

- The proxy approach adds minimal overhead (~1-5ms latency per request)
- Consider adding caching for frequently accessed endpoints (categories, budgets)
- Use Next.js ISR (Incremental Static Regeneration) for read-heavy endpoints
- Monitor database connection pooling in Spring backend

## Security Considerations

1. All API routes require authentication
2. Never expose Spring backend URL to frontend
3. Validate all request data in Next.js
4. Sanitize error messages before returning to frontend
5. Use rate limiting middleware for production
6. Keep API keys and secrets in environment variables only

## Files Modified/Created

- `/lib/api/errors.ts` - Custom error classes
- `/lib/api/handlers.ts` - Response formatting helpers
- `/lib/api/auth.ts` - Authentication utilities
- `/lib/api/backend-client.ts` - Spring backend HTTP client
- `/app/api/transactions/[[...id]]/route.ts` - Transaction endpoints
- `/app/api/users/[[...id]]/route.ts` - User endpoints
- `/app/api/categories/[[...id]]/route.ts` - Category endpoints
- `/app/api/budgets/[[...id]]/route.ts` - Budget endpoints
- `/app/api/accounts/[[...id]]/route.ts` - Account endpoints
- `/app/api/groups/[[...id]]/route.ts` - Group endpoints
- And more for budget-items, transaction-splits, etc.

## References

- [Next.js API Routes Documentation](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Auth0 Next.js SDK](https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow)
- [Spring Boot REST API Documentation](https://spring.io/projects/spring-framework)
