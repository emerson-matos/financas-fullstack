# Project Overview

This is a Next.js project that serves as the frontend and server-side API for the Financas application. It uses Supabase for authentication and data storage (Postgres) and is deployed to Vercel. The API routes in Next.js interact directly with Supabase, and the project provides a TypeScript-first client surface with React Query hooks for the UI.

## Building and Running

**Prerequisites:**

- Node.js 22+ (LTS recommended)
- pnpm (or npm/yarn)
- Supabase CLI (for local development)

**Environment Variables:**

Create a `./.env.local` file by copying `./.env.local.example`. The following variables are required:

- `SUPABASE_URL`: Your Supabase project URL.
- `SUPABASE_PUBLISHABLE_KEY`: Your Supabase anon/public key.
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL for the client-side.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: Your Supabase public key for the client-side.

**Running the Application:**

1.  **Install dependencies:**
    ```bash
    pnpm install
    ```
2.  **Start the development server:**
    ```bash
    pnpm dev
    ```
3.  **Run tests:**
    ```bash
    pnpm test
    ```
4.  **Build for production:**
    ```bash
    pnpm build
    ```
5.  **Start the production server:**
    ```bash
    pnpm start
    ```

## Development Conventions

- **API Usage:**
  - **React Query hooks:** The recommended way to interact with the backend is through React Query hooks, which can be found in the `hooks/` directory.
  - **API utilities:** Helper functions in `lib/api-utils.ts` provide a convenient way to interact with the API.
  - **Direct API client:** A simple `fetch`-based client is available in `lib/api.ts`.
- **Authentication:**
  - Authentication is handled by Supabase Auth.
  - Server-side authentication is handled by `@supabase/ssr` and helpers in `lib/supabase/`.
- **Testing:**
  - Tests are written with Vitest and React Testing Library.
  - Test files are located next to the files they test and have a `.test.ts` or `.test.tsx` extension.
