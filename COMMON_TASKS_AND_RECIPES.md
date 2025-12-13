# Common Tasks & Recipes

## Getting Started

### 1. Initial Setup

```bash
# Copy environment template
cp .env.local.example .env.local

# Edit with your values
nano .env.local  # or your preferred editor

# Install dependencies (if needed)
pnpm install

# Start development server
pnpm dev
```

### 2. Verify Everything Works

```bash
# Test an endpoint
curl -X GET http://localhost:3000/api/transactions

# Note: You may get 401 if not logged in. That's expected!
# Log in via the UI first, then try again.
```

## Frontend Usage Recipes

### Fetch Data in a Component

**Using React Query (Recommended)**
```typescript
'use client';

import { useTransactions } from '@/lib/query-hooks';

export default function TransactionsList() {
  const { data, isLoading, error } = useTransactions({
    page: 0,
    size: 20,
    sort: 'transactedDate,desc'
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.content.map(tx => (
        <div key={tx.id}>
          {tx.amount} - {tx.category}
        </div>
      ))}
    </div>
  );
}
```

**Using API Utils**
```typescript
'use client';

import { useEffect, useState } from 'react';
import { fetchPaginatedResources, endpoints } from '@/lib/api-utils';

export default function TransactionsList() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPaginatedResources(endpoints.transactions, {
      page: 0,
      size: 20
    })
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.content.map(tx => (
        <div key={tx.id}>{tx.amount}</div>
      ))}
    </div>
  );
}
```

**Using Direct API Client**
```typescript
'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function TransactionsList() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/api/transactions?page=0&size=20').then(response => {
      setData(response.data.data);
    });
  }, []);

  return (
    <div>
      {data?.content.map(tx => (
        <div key={tx.id}>{tx.amount}</div>
      ))}
    </div>
  );
}
```

### Create Data

```typescript
'use client';

import { useCreateTransaction } from '@/lib/query-hooks';

export default function CreateTransaction() {
  const mutation = useCreateTransaction();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await mutation.mutateAsync({
        amount: 100,
        category: 'Food',
        date: new Date().toISOString(),
        description: 'Lunch'
      });
      alert('Transaction created!');
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Creating...' : 'Create'}
      </button>
    </form>
  );
}
```

### Update Data

```typescript
'use client';

import { useUpdateTransaction } from '@/lib/query-hooks';

export default function UpdateTransaction({ id }) {
  const mutation = useUpdateTransaction();

  const handleUpdate = async () => {
    try {
      await mutation.mutateAsync({
        id,
        data: {
          amount: 150,
          category: 'Dining'
        }
      });
      alert('Updated!');
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  return <button onClick={handleUpdate}>Update</button>;
}
```

### Delete Data

```typescript
'use client';

import { useDeleteTransaction } from '@/lib/query-hooks';

export default function DeleteTransaction({ id }) {
  const mutation = useDeleteTransaction();

  const handleDelete = async () => {
    if (confirm('Are you sure?')) {
      try {
        await mutation.mutateAsync(id);
        alert('Deleted!');
      } catch (error) {
        alert(`Error: ${error.message}`);
      }
    }
  };

  return <button onClick={handleDelete}>Delete</button>;
}
```

## Advanced Usage

### Pagination

```typescript
const [page, setPage] = useState(0);

const { data } = useTransactions({
  page,
  size: 20,
  sort: 'transactedDate,desc'
});

// Display pagination controls
{data?.hasNext && (
  <button onClick={() => setPage(p => p + 1)}>Next</button>
)}
{data?.hasPrevious && (
  <button onClick={() => setPage(p => p - 1)}>Previous</button>
)}
```

### Filtering

```typescript
const { data } = useTransactions({
  page: 0,
  size: 20,
  sort: 'transactedDate,desc',
  filters: {
    status: 'active',
    categoryId: '123',
    createdDateFrom: '2024-01-01'
  }
});
```

### Manual Refresh

```typescript
import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();

const handleRefresh = () => {
  queryClient.invalidateQueries({ queryKey: ['transactions'] });
};
```

### Debounced Search

```typescript
'use client';

import { useMemo, useState } from 'react';
import { useDeferredValue } from 'react';
import { useTransactions } from '@/lib/query-hooks';

export default function SearchTransactions() {
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);

  const { data } = useTransactions({
    page: 0,
    size: 20,
    filters: { name: deferredSearch }
  });

  return (
    <>
      <input
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div>
        {data?.content.map(item => (
          <div key={item.id}>{item.name}</div>
        ))}
      </div>
    </>
  );
}
```

### Handle Errors

```typescript
'use client';

import { useTransactions } from '@/lib/query-hooks';
import { isAxiosError } from 'axios';

export default function SafeTransactions() {
  const { data, error, isLoading } = useTransactions({
    page: 0,
    size: 20
  });

  if (isLoading) return <div>Loading...</div>;

  if (error) {
    if (isAxiosError(error)) {
      const apiError = error.response?.data;
      return (
        <div className="error">
          <h3>Error {apiError?.statusCode}</h3>
          <p>{apiError?.error}</p>
        </div>
      );
    }
    return <div>An error occurred: {error.message}</div>;
  }

  return (
    <div>
      {data?.content.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}
```

## Troubleshooting Recipes

### Debug API Calls

```bash
# Enable debug logging
DEBUG=financas:* pnpm dev

# Check if backend is responding
curl -v http://localhost:8080/api/transactions

# Check Next.js API route
curl -v http://localhost:3000/api/transactions
```

### Check Authentication

```typescript
'use client';

import { useUser } from '@auth0/nextjs-auth0/client';

export default function CheckAuth() {
  const { user, error, isLoading } = useUser();

  if (isLoading) return <div>Checking...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!user) return <div>Not logged in</div>;

  return (
    <div>
      <p>Logged in as: {user.email}</p>
      <p>Sub: {user.sub}</p>
    </div>
  );
}
```

### Monitor Network Requests

```typescript
// In api.ts or a global init file
import { api } from '@/lib/api';

api.interceptors.request.use((config) => {
  console.log('API Request:', config.method?.toUpperCase(), config.url);
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.config?.url);
    return Promise.reject(error);
  }
);
```

### Test with Postman

1. Create a new request in Postman
2. Get your Auth0 token from browser dev tools (Application > Cookies > auth0.something)
3. Or use: `curl -s http://localhost:3000/api/transactions -v` to see auth headers
4. Add token to Postman: Headers > Authorization > Bearer {token}
5. Test endpoint: `GET http://localhost:3000/api/transactions`

## API Endpoint Reference

### Transaction Endpoints

```bash
# List
GET /api/transactions?page=0&size=20&sort=transactedDate,desc

# Get one
GET /api/transactions/{id}

# Create
POST /api/transactions
Body: { amount: 100, category: "Food", ... }

# Update
PUT /api/transactions/{id}
Body: { amount: 150, category: "Dining" }

# Partial update
PATCH /api/transactions/{id}
Body: { amount: 150 }

# Delete
DELETE /api/transactions/{id}

# Import
POST /api/transactions/import
Body: { file: "...", format: "csv" }

# Bulk create
POST /api/transactions/bulk
Body: { transactions: [...] }
```

### Same Pattern for Other Resources

Replace `transactions` with:
- `users`
- `categories`
- `budgets`
- `accounts`
- `groups`
- `budget-items`
- `transaction-splits`
- `group-memberships`
- `categorization-jobs`

## Performance Tips

### 1. Optimize Query Fetching

```typescript
// ❌ Bad: Fetches on every render
const data = await fetch('/api/transactions');

// ✅ Good: Uses React Query caching
const { data } = useTransactions();
```

### 2. Paginate Large Lists

```typescript
// ❌ Bad: Fetches all items
const { data } = useTransactions({ size: 1000 });

// ✅ Good: Paginate
const { data } = useTransactions({ 
  page: 0, 
  size: 20  // Only fetch 20 at a time
});
```

### 3. Use Filters

```typescript
// ❌ Bad: Fetch all, then filter in JS
const all = await fetch('/api/transactions');
const filtered = all.filter(t => t.status === 'active');

// ✅ Good: Filter on backend
const { data } = useTransactions({
  filters: { status: 'active' }
});
```

### 4. Defer Non-Critical Updates

```typescript
import { useDeferredValue } from 'react';

const deferredValue = useDeferredValue(searchValue);
// Won't block UI while fetching
```

## Common Patterns

### Form with Validation

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateTransaction } from '@/lib/query-hooks';

const schema = z.object({
  amount: z.number().positive('Amount must be positive'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional()
});

export default function CreateForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  });
  const createMutation = useCreateTransaction();

  return (
    <form onSubmit={handleSubmit(async (data) => {
      await createMutation.mutateAsync(data);
    })}>
      <input {...register('amount')} type="number" />
      {errors.amount && <span>{errors.amount.message}</span>}

      <input {...register('category')} />
      {errors.category && <span>{errors.category.message}</span>}

      <button type="submit">Create</button>
    </form>
  );
}
```

---

For more examples, check the documentation files or look at the route implementations in `app/api/`.
