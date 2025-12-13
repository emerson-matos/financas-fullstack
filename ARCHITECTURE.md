# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          End User / Browser                              │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 │ HTTP/HTTPS
                                 │
┌─────────────────────────────────▼────────────────────────────────────────┐
│                       Next.js Frontend (React)                            │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ Pages & Components                                              │    │
│  │ - Transactions List                                             │    │
│  │ - Create/Edit Forms                                             │    │
│  │ - User Dashboard                                                │    │
│  │ - Budget Management                                             │    │
│  │ - Reports & Analytics                                           │    │
│  └──────────────────────────┬──────────────────────────────────────┘    │
│                             │                                            │
│  ┌──────────────────────────▼──────────────────────────────────────┐    │
│  │ React Query / TanStack Query                                    │    │
│  │ - Caching                                                       │    │
│  │ - Deduplication                                                 │    │
│  │ - Auto-refetch                                                  │    │
│  └──────────────────────────┬──────────────────────────────────────┘    │
│                             │                                            │
│  ┌──────────────────────────▼──────────────────────────────────────┐    │
│  │ Axios HTTP Client (lib/api.ts)                                  │    │
│  │ - Request Interceptors                                          │    │
│  │ - Response Interceptors                                         │    │
│  │ - Error Handling                                                │    │
│  │ - Retry Logic                                                   │    │
│  └──────────────────────────┬──────────────────────────────────────┘    │
│                             │                                            │
│  ┌──────────────────────────▼──────────────────────────────────────┐    │
│  │ Auth0 Session Management (middleware.ts)                        │    │
│  │ - OAuth2 Token                                                  │    │
│  │ - User Session                                                  │    │
│  │ - Token Refresh                                                 │    │
│  └──────────────────────────┬──────────────────────────────────────┘    │
│                             │                                            │
└─────────────────────────────┼────────────────────────────────────────────┘
                              │ Authenticated HTTP Requests
                              │ (with Bearer Token)
                              │
┌─────────────────────────────▼────────────────────────────────────────────┐
│                   Next.js API Routes (Edge/Serverless)                   │
│                                                                           │
│  Route Pattern: app/api/[resource]/[[...id]]/route.ts                   │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ Request Handling                                                │    │
│  │ - GET /api/transactions (list, paginated)                       │    │
│  │ - GET /api/transactions/:id (single item)                       │    │
│  │ - POST /api/transactions (create)                               │    │
│  │ - PUT /api/transactions/:id (update)                            │    │
│  │ - PATCH /api/transactions/:id (partial update)                  │    │
│  │ - DELETE /api/transactions/:id (delete)                         │    │
│  │ - Special: import, bulk, reports, exports                       │    │
│  └──────────────────────────┬──────────────────────────────────────┘    │
│                             │                                            │
│  ┌──────────────────────────▼──────────────────────────────────────┐    │
│  │ Authentication Middleware (lib/api/auth.ts)                     │    │
│  │ - requireAuth()                                                 │    │
│  │ - getSession()                                                  │    │
│  │ - getUserId()                                                   │    │
│  │ - Validates JWT token from Auth0                                │    │
│  │ - Throws UnauthorizedException if invalid                       │    │
│  └──────────────────────────┬──────────────────────────────────────┘    │
│                             │                                            │
│  ┌──────────────────────────▼──────────────────────────────────────┐    │
│  │ Request Validation & Formatting                                 │    │
│  │ - Parse request body (JSON)                                     │    │
│  │ - Extract URL parameters                                        │    │
│  │ - Build query parameters                                        │    │
│  │ - Validate pagination/sorting                                   │    │
│  └──────────────────────────┬──────────────────────────────────────┘    │
│                             │                                            │
│  ┌──────────────────────────▼──────────────────────────────────────┐    │
│  │ Backend Client (lib/api/backend-client.ts)                      │    │
│  │ - HTTP proxy to Spring backend                                  │    │
│  │ - Forwards authenticated requests                               │    │
│  │ - Handles response/error forwarding                             │    │
│  │ - Axios-based HTTP client                                       │    │
│  └──────────────────────────┬──────────────────────────────────────┘    │
│                             │                                            │
│  ┌──────────────────────────▼──────────────────────────────────────┐    │
│  │ Response Handling (lib/api/handlers.ts)                         │    │
│  │ - Standardize response format                                   │    │
│  │ - Handle pagination responses                                   │    │
│  │ - Error response formatting                                     │    │
│  │ - HTTP status code mapping                                      │    │
│  └──────────────────────────┬──────────────────────────────────────┘    │
│                             │                                            │
└─────────────────────────────┼────────────────────────────────────────────┘
                              │ HTTP Requests
                              │ (Spring Backend API)
                              │
┌─────────────────────────────▼────────────────────────────────────────────┐
│                    Spring Boot Backend (Java)                             │
│                    port: 8080 (default)                                   │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ REST Controllers (Resource Classes)                             │    │
│  │ - TransactionResource                                           │    │
│  │ - AppUserResource                                               │    │
│  │ - CategoryResource                                              │    │
│  │ - BudgetResource                                                │    │
│  │ - UserAccountResource                                           │    │
│  │ - AppGroupsResource                                             │    │
│  │ - ... and more                                                  │    │
│  └──────────────────────────┬──────────────────────────────────────┘    │
│                             │                                            │
│  ┌──────────────────────────▼──────────────────────────────────────┐    │
│  │ Service Layer                                                   │    │
│  │ - Business Logic                                                │    │
│  │ - Data Transformation                                           │    │
│  │ - Validation                                                    │    │
│  │ - Security Checks                                               │    │
│  └──────────────────────────┬──────────────────────────────────────┘    │
│                             │                                            │
│  ┌──────────────────────────▼──────────────────────────────────────┐    │
│  │ Repository Layer (JPA)                                          │    │
│  │ - Data Access                                                   │    │
│  │ - CRUD Operations                                               │    │
│  │ - Query Service                                                 │    │
│  │ - Criteria-based Filtering                                      │    │
│  └──────────────────────────┬──────────────────────────────────────┘    │
│                             │                                            │
│  ┌──────────────────────────▼──────────────────────────────────────┐    │
│  │ Caching Layer (Redis)                                           │    │
│  │ - Cache Configuration                                           │    │
│  │ - Categories Cache                                              │    │
│  │ - Budget Cache                                                  │    │
│  └──────────────────────────┬──────────────────────────────────────┘    │
│                             │                                            │
└─────────────────────────────┼────────────────────────────────────────────┘
                              │
┌─────────────────────────────▼────────────────────────────────────────────┐
│                          PostgreSQL Database                              │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ Tables                                                          │    │
│  │ - app_transaction (transactions)                                │    │
│  │ - app_user (users)                                              │    │
│  │ - category (categories)                                         │    │
│  │ - budget (budgets)                                              │    │
│  │ - user_account (accounts)                                       │    │
│  │ - app_group (groups)                                            │    │
│  │ - ... and more                                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ External Services                                               │    │
│  │ - Liquibase Migrations                                          │    │
│  │ - Monitoring (Prometheus, Grafana)                              │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Example: GET Transaction List

```
1. User clicks "Load Transactions"
   │
2. React Component calls: useTransactions()
   │
3. React Query (TanStack):
   - Checks cache
   - If not cached, triggers fetch
   │
4. Axios HTTP Client:
   - Checks auth token
   - Adds Authorization header
   - Sends GET /api/transactions?page=0&size=20
   │
5. Next.js API Route: GET /api/transactions/[[...id]]/route.ts
   │
   ├─ Calls: requireAuth(request)
   │  └─ Validates Auth0 session
   │  └─ Throws 401 if unauthorized
   │
   ├─ Extracts query parameters
   │  └─ page=0, size=20, sort=...
   │
   ├─ Creates BackendClient
   │  └─ Instantiates axios with baseURL=http://localhost:8080
   │
   ├─ Calls: backendClient.get('/api/transactions?page=0&size=20')
   │
   └─ Next.js forwards to Spring Backend:
       GET http://localhost:8080/api/transactions?page=0&size=20
       Headers: [Authorization: Bearer {token}]
   │
6. Spring Boot Backend:
   │
   ├─ TransactionResource.getAllTransactions()
   │
   ├─ TransactionQueryService.findByCriteria()
   │
   ├─ TransactionRepository.findAll(pageable)
   │
   └─ PostgreSQL Query:
       SELECT * FROM app_transaction
       WHERE user_id = ...
       ORDER BY transacted_date DESC
       LIMIT 20 OFFSET 0
   │
7. Spring returns PageResponse:
   {
     "content": [...],
     "totalElements": 150,
     "totalPages": 8,
     "currentPage": 0,
     "pageSize": 20,
     "hasNext": true,
     "hasPrevious": false
   }
   │
8. Next.js API Route formats response:
   {
     "data": {
       "content": [...],
       "totalElements": 150,
       ...
     },
     "statusCode": 200
   }
   │
9. Response sent back to browser
   │
10. React Query caches the response
    │
11. Axios interceptor logs successful response
    │
12. Component re-renders with data
    │
13. User sees transaction list
```

## Data Flow Example: Create Transaction

```
1. User submits form
   │
2. React Component:
   - Validates with React Hook Form
   - Calls: useCreateTransaction().mutateAsync(data)
   │
3. React Query Mutation:
   - Shows loading state
   - Sends POST /api/transactions
   │
4. Axios:
   - Attaches Authorization header
   - Serializes payload to JSON
   │
5. Next.js API Route: POST /api/transactions/[[...id]]/route.ts
   │
   ├─ Calls: requireAuth(request)
   │
   ├─ Parses request body (JSON)
   │  └─ { amount: 100, category: "Food", ... }
   │
   ├─ Validates data
   │
   ├─ Creates BackendClient
   │
   ├─ Calls: backendClient.post('/api/transactions', data)
   │
   └─ Forwards to Spring:
       POST http://localhost:8080/api/transactions
       Body: { amount: 100, category: "Food", ... }
   │
6. Spring Boot:
   │
   ├─ Validates @Valid @RequestBody TransactionDTO
   │
   ├─ TransactionService.save(transactionDTO)
   │
   ├─ Persists to PostgreSQL
   │
   └─ Returns created TransactionDTO with generated ID
   │
7. Next.js formats response with 201 Created
   │
8. React Query:
   - Updates cache with new item
   - Invalidates transaction list query
   │
9. Component shows success message
   │
10. Transaction list automatically refreshes
```

## Technology Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **HTTP Client**: Axios
- **State Management**: React Query (TanStack)
- **Form Handling**: React Hook Form
- **UI Components**: shadcn/ui (Radix UI)
- **Styling**: Tailwind CSS
- **Auth**: Auth0 SDK for Next.js

### API Layer (What We Built)
- **Framework**: Next.js API Routes
- **Language**: TypeScript
- **HTTP Client**: Axios
- **Error Handling**: Custom error classes
- **Response Format**: Standardized JSON
- **Authentication**: Auth0 session validation

### Backend (Existing)
- **Framework**: Spring Boot 3.5.6
- **Language**: Java 25
- **Database**: PostgreSQL
- **ORM**: JPA/Hibernate
- **Security**: OAuth2 Resource Server
- **Caching**: Redis
- **Data Migration**: Liquibase
- **Monitoring**: Prometheus + Grafana

### Database
- **Primary**: PostgreSQL
- **Caching**: Redis
- **Driver**: JDBC PostgreSQL

## Security Layers

```
User Browser
    │
    ▼
Auth0 OAuth2 Flow (Frontend SDK)
    │ Get JWT Token
    ▼
Next.js Middleware
    │ Validate Session
    ▼
API Route Authentication
    │ requireAuth() call
    ▼
Backend Client with Token
    │ Forward JWT to Spring
    ▼
Spring OAuth2 Resource Server
    │ Validate JWT
    ▼
Database Access Control
    │ Row-level security (spring.security)
    ▼
PostgreSQL
```

## Deployment Architecture

```
┌─────────────────────────────────────────┐
│        CDN (Vercel Edge Network)        │
│  - Static assets (JS, CSS, images)      │
│  - Next.js static generation            │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│    Vercel (Next.js Deployment)          │
│  - App Router                           │
│  - API Routes (Serverless Functions)    │
│  - Middleware                           │
│  - Image optimization                   │
│  - Analytics                            │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│   Spring Boot Backend (Docker/K8s)      │
│  - Can be self-hosted or cloud          │
│  - Load balanced if scaled               │
│  - Connected to PostgreSQL              │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│     PostgreSQL (Cloud Database)         │
│  - AWS RDS / Azure Database / GCP       │
│  - Automated backups                    │
│  - Replication for HA                   │
└─────────────────────────────────────────┘
```

## Performance Characteristics

```
Request Flow:
Browser → Vercel Edge → API Route → Spring Backend → PostgreSQL

Latency Budget:
- Browser to Vercel Edge: ~50-200ms (location dependent)
- API Route Processing: ~1-5ms
- Spring Backend: ~50-200ms (depends on query)
- Database: ~10-100ms (depends on query)
- Return trip: ~50-200ms

Total: 161-705ms (typical)

Typical scenarios:
- Simple GET by ID: ~200-400ms
- Paginated list: ~300-500ms
- Complex filtering: ~400-600ms
- Create/Update: ~300-500ms
- Delete: ~200-400ms
```

## Monitoring Points

```
1. Frontend
   └─ React Query caching/refetching
   └─ Axios interceptor logs
   └─ Browser DevTools Network tab

2. Next.js API
   └─ Function execution time
   └─ Memory usage
   └─ Cold start detection

3. Backend (Spring)
   └─ Request/Response logging
   └─ Performance metrics
   └─ Error tracking

4. Database
   └─ Slow queries
   └─ Connection pool
   └─ Lock detection

5. Infrastructure
   └─ Uptime monitoring
   └─ Error rates
   └─ Latency percentiles
```

---

This architecture provides:
- **Scalability**: Stateless API routes can scale horizontally
- **Reliability**: Database backups and monitoring
- **Performance**: CDN for static assets, caching at multiple levels
- **Security**: OAuth2, token validation, row-level security
- **Flexibility**: Can gradually migrate from Spring to Node.js
