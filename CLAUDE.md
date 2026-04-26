# CLAUDE.md

Project guidance for Claude Code (claude.ai/code) when working with this codebase.

## Project Overview

A full-stack e-commerce monorepo with two independently run services:

| Service | Location | Port | Description |
|---------|----------|------|-------------|
| **Frontend** | `frontend/` | 5173 | React 19 + Vite + TypeScript SPA |
| **Backend** | `backend/` | 3001 | Express + TypeScript REST API |

---

## Tech Stack

### Frontend
- **Framework**: React 19 + Vite 8 + TypeScript
- **Styling**: Tailwind CSS v4 (via `@tailwindcss/vite` plugin, no `tailwind.config.js`)
- **UI Components**: shadcn/ui (Radix UI primitives, New York style, lucide icons)
- **State Management**: Zustand (cart with `persist` middleware), TanStack Query (server state)
- **Forms**: React Hook Form + Zod validation
- **Routing**: React Router v7 (file-based routing via `main.tsx`)
- **Auth**: Clerk (`@clerk/react-router` with `<ClerkProvider>`)

### Backend
- **Runtime**: Express + TypeScript on Node.js
- **Database**: PostgreSQL via Prisma ORM (Neon serverless)
- **Auth**: Clerk (`@clerk/backend` for webhooks, `@clerk/express` for middleware)
- **File Uploads**: Multer (served static at `/uploads/*`)
- **Validation**: Zod

---

## Folder Structure

```
CRUD-RE-Test/
├── backend/                    # Express API server
│   ├── prisma/
│   │   └── schema.prisma       # Database schema (User, Category, Product, ProductVariant, Order, OrderItem)
│   ├── src/
│   │   ├── index.ts           # Express app entry — CORS, routes, static file serving
│   │   ├── config/
│   │   │   └── database.ts     # Prisma client singleton
│   │   ├── routes/
│   │   │   ├── auth.ts        # Clerk webhook + user management
│   │   │   ├── products.ts    # Product CRUD
│   │   │   ├── orders.ts      # COD checkout + admin management
│   │   │   └── uploads.ts     # Single/multiple file upload
│   │   ├── middleware/
│   │   │   ├── session.ts     # Clerk session verification
│   │   │   ├── admin.ts       # Role-based (ADMIN) protection
│   │   │   └── upload.ts      # Multer config
│   │   └── scripts/
│   │       └── create-admin.ts # Dev script to promote user to admin
│   ├── uploads/                # Uploaded files (gitignored)
│   └── prisma.config.ts        # Prisma configuration
│
├── frontend/                   # React SPA
│   ├── src/
│   │   ├── main.tsx            # App bootstrap — ClerkProvider, QueryClient, Router, routes
│   │   ├── App.tsx             # Root layout with <Outlet />
│   │   ├── index.css           # Global styles (Tailwind import)
│   │   ├── components/
│   │   │   ├── ui/             # shadcn/ui components (button, card, input, badge, etc.)
│   │   │   ├── layouts/        # ProtectedLayout for admin routes
│   │   │   ├── DataTable.tsx   # TanStack Table wrapper
│   │   │   ├── EmptyState.tsx  # Empty state placeholder
│   │   │   ├── Pagination.tsx  # Pagination controls
│   │   │   └── StatusBadge.tsx # Order status badge
│   │   ├── pages/
│   │   │   ├── shop/           # HomePage, ProductListPage, ProductDetailPage, CartPage, CheckoutPage, LoginPage
│   │   │   └── admin/          # AdminDashboardPage, AdminProductsPage, AdminProductFormPage, AdminOrdersPage
│   │   ├── lib/
│   │   │   ├── api.ts          # Axios instance (VITE_API_URL base)
│   │   │   ├── request.ts      # Auth-aware request helper (useAuth().getToken())
│   │   │   ├── utils.ts        # Utility functions
│   │   │   └── cn.ts           # className merger (clsx + tailwind-merge)
│   │   ├── store/
│   │   │   └── cart.ts        # Zustand cart store (localStorage persist)
│   │   └── types/
│   │       └── index.ts       # TypeScript interfaces (Product, Order, CartItem, etc.)
│   └── public/                 # Static assets
```

---

## Commands

### Frontend
```bash
cd frontend
npm run dev        # Vite dev server with HMR (port 5173)
npm run build      # TypeScript compile + Vite build
npm run lint       # ESLint check (flat config style)
npm run preview    # Preview production build
```

### Backend
```bash
cd backend
npm run dev        # nodemon + tsx (watches src/, auto-restart)
npm run build      # TypeScript compile to dist/
npm run start      # Run compiled dist/index.js
npm run db:generate    # Regenerate Prisma client after schema change
npm run db:push        # Push schema to DB (no migration history)
npm run db:migrate     # Create and apply migrations
npm run db:studio      # Open Prisma Studio (DB viewer)
```

---

## Key Patterns

### API Routes (`backend/src/routes/`)
| File | Endpoints |
|------|-----------|
| `auth.ts` | POST `/api/auth/webhook`, GET `/api/auth/users`, PATCH `/api/auth/users/:userId/promote`, POST `/api/auth/sync-users` |
| `products.ts` | GET/POST `/api/products`, GET/PUT/DELETE `/api/products/:slug` |
| `orders.ts` | GET/POST `/api/orders`, PATCH `/api/orders/:id/status` |
| `uploads.ts` | POST `/api/uploads/single`, POST `/api/uploads/multiple` |

### Clerk Auth Pattern
```typescript
import { useAuth } from "@clerk/react-router";

function MyComponent() {
  const { getToken } = useAuth();

  const makeAuthRequest = async () => {
    const token = await getToken();
    const res = await api.get("/some-endpoint", {
      headers: { Authorization: token ? `Bearer ${token}` : "" },
    });
  };
}
```

### Cart Store (Zustand)
```typescript
// Usage in component
const addItem = useCartStore((s) => s.addItem);
const { items } = useCartStore();
```

### React Query Pattern
```typescript
const { data, isLoading } = useQuery({
  queryKey: ["resource", { param: value }],
  queryFn: () => api.get<Type>("/endpoint").then(r => r.data),
});
```

---

## Database Schema

**Models:** `User` (CUSTOMER | ADMIN), `Category`, `Product`, `ProductVariant`, `Order`, `OrderItem`

**ProductVariant** — flexible key/value variants (e.g., Size=XL, Color=Merah) with `priceMod` and `stock` per variant.

**OrderStatus** enum: `PENDING`, `CONFIRMED`, `SHIPPED`, `COMPLETED`, `CANCELLED`

---

## Environment Variables

### Backend (`.env`)
```env
PORT=3001
NODE_ENV=development
DATABASE_URL=<neon-postgresql-connection-string>
CLERK_SECRET_KEY=sk_test_...
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
UPLOAD_DIR=./uploads
```

### Frontend (`.env`)
```env
VITE_API_URL=http://localhost:3001
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

---

## Development Notes

- **No root-level `package.json`** — frontend and backend have separate `node_modules`
- **Backend dev**: no build step required, `nodemon --exec tsx` runs TypeScript directly
- **Frontend TypeScript**: `verbatimModuleSyntax: true` — use `import type` for type-only imports
- **File uploads**: saved to `backend/uploads/`, served at `http://localhost:3001/uploads/*`
- **Webhooks**: for local dev without webhooks, sync users via:
  ```bash
  curl -X POST http://localhost:3001/api/auth/sync-users
  ```

---

## First-Time Setup

1. Clone repo
2. `cd backend && npm install && npm run db:push`
3. `cd frontend && npm install`
4. Configure `.env` files (see Environment Variables above)
5. `npm run dev` in both directories