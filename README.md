# TokoKu - E-Commerce Platform

> **Purpose**: This project was created as a learning exercise to understand how frontend and backend JavaScript frameworks work together in a real-world application. It demonstrates the full communication flow between a React frontend and Express backend, including authentication, data handling, and API integration.</p>

A full-stack e-commerce monorepo built with React and Express.

## Tech Stack

### Frontend
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css)
![shadcn/ui](https://img.shields.io/badge/shadcn/ui-v1-000000?logo=shadcnui)
![TanStack Query](https://img.shields.io/badge/TanStack_Query-5-FF4154?logo=tanstack)
![Zustand](https://img.shields.io/badge/Zustand-5-CB3837?logo=zustand)
![Clerk](https://img.shields.io/badge/Clerk-Auth-6B5BF7?logo=clerk)

### Backend
![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=node.js)
![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-7-5A67D8?logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?logo=postgresql)

---

## Features

### Customer Features
- Product browsing with search and pagination
- Product detail with variant selection (size, color, etc.)
- Shopping cart with quantity management
- Cash on Delivery (COD) checkout
- User authentication (email/username sign-up)

### Admin Features
- Dashboard with order statistics
- Product management (create, edit, delete)
- Order management (view, update status)
- User management (view, promote to admin)

---

## Project Structure

```
CRUD-RE-Test/
├── backend/                    # Express API Server (Port 3001)
│   ├── prisma/
│   │   └── schema.prisma      # Database schema definitions
│   ├── src/
│   │   ├── index.ts           # App entry point, CORS, routes, middleware
│   │   ├── config/
│   │   │   └── database.ts    # Prisma client singleton
│   │   ├── routes/
│   │   │   ├── auth.ts        # Authentication & user management
│   │   │   ├── products.ts    # Product CRUD operations
│   │   │   ├── orders.ts      # Order processing & management
│   │   │   └── uploads.ts     # File upload handling
│   │   ├── middleware/
│   │   │   ├── session.ts     # Clerk session verification
│   │   │   ├── admin.ts       # Admin role protection
│   │   │   └── upload.ts      # Multer configuration
│   │   └── scripts/
│   │       └── create-admin.ts # Admin promotion utility
│   ├── uploads/               # Uploaded files storage
│   ├── prisma.config.ts       # Prisma CLI configuration
│   └── package.json
│
├── frontend/                   # React SPA (Port 5173)
│   ├── src/
│   │   ├── main.tsx           # App bootstrap, router, providers
│   │   ├── App.tsx            # Root layout component
│   │   ├── index.css          # Global styles
│   │   ├── components/
│   │   │   ├── ui/            # shadcn/ui component library
│   │   │   ├── layouts/       # ProtectedLayout for admin routes
│   │   │   ├── DataTable.tsx  # TanStack Table wrapper
│   │   │   ├── EmptyState.tsx # Empty state display
│   │   │   ├── Pagination.tsx # Pagination controls
│   │   │   └── StatusBadge.tsx # Status indicator
│   │   ├── pages/
│   │   │   ├── shop/          # Customer-facing pages
│   │   │   │   ├── HomePage.tsx
│   │   │   │   ├── ProductListPage.tsx
│   │   │   │   ├── ProductDetailPage.tsx
│   │   │   │   ├── CartPage.tsx
│   │   │   │   ├── CheckoutPage.tsx
│   │   │   │   └── LoginPage.tsx
│   │   │   └── admin/         # Admin dashboard pages
│   │   │       ├── AdminDashboardPage.tsx
│   │   │       ├── AdminProductsPage.tsx
│   │   │       ├── AdminProductFormPage.tsx
│   │   │       └── AdminOrdersPage.tsx
│   │   ├── lib/
│   │   │   ├── api.ts         # Axios instance
│   │   │   ├── request.ts     # Auth-aware request helper
│   │   │   ├── utils.ts       # Utility functions
│   │   │   └── cn.ts          # Class name merger
│   │   ├── store/
│   │   │   └── cart.ts        # Zustand cart store
│   │   └── types/
│   │       └── index.ts       # TypeScript interfaces
│   ├── public/                # Static assets
│   ├── components.json        # shadcn/ui configuration
│   └── package.json
│
├── CLAUDE.md                  # Claude Code project guidance
└── README.md                  # This file
```

---

## Backend Folder Details

| Folder/File | Purpose |
|------------|---------|
| `src/index.ts` | Express app setup — CORS, JSON parsing, static file serving, route registration |
| `src/config/database.ts` | Prisma client singleton initialized with `datasourceUrl` from env |
| `src/routes/auth.ts` | Clerk webhook handler, user sync, user listing, admin promotion |
| `src/routes/products.ts` | Product CRUD, search, pagination, slug-based retrieval |
| `src/routes/orders.ts` | COD checkout, order creation, order status updates, admin listing |
| `src/routes/uploads.ts` | Single and multiple file upload via Multer |
| `src/middleware/session.ts` | Verifies Clerk session tokens |
| `src/middleware/admin.ts` | Protects routes requiring ADMIN role |
| `src/middleware/upload.ts` | Multer disk storage configuration |
| `src/scripts/create-admin.ts` | CLI script to manually promote a user to admin |
| `prisma/schema.prisma` | Database schema with User, Category, Product, ProductVariant, Order, OrderItem models |
| `uploads/` | Local storage for uploaded product images |

---

## Frontend Folder Details

| Folder/File | Purpose |
|------------|---------|
| `src/main.tsx` | App entry — ClerkProvider, QueryClient, React Router routes |
| `src/App.tsx` | Root component with `Outlet` for nested routes |
| `src/index.css` | Tailwind v4 import and global CSS |
| `src/components/ui/` | shadcn/ui components (button, card, input, badge, table, skeleton, etc.) |
| `src/components/layouts/index.tsx` | ProtectedLayout with admin sidebar navigation |
| `src/components/DataTable.tsx` | Wrapper around TanStack Table with sorting, filtering |
| `src/components/EmptyState.tsx` | Reusable empty state placeholder |
| `src/components/Pagination.tsx` | Page navigation controls |
| `src/components/StatusBadge.tsx` | Color-coded order status badge |
| `src/pages/shop/` | Public pages: Home, Products (list + detail), Cart, Checkout, Login |
| `src/pages/admin/` | Protected admin pages: Dashboard, Products (list + form), Orders |
| `src/lib/api.ts` | Axios instance with `VITE_API_URL` base |
| `src/lib/request.ts` | Auth-aware fetch wrapper using `useAuth().getToken()` |
| `src/lib/utils.ts` | General utilities (className merging via `cn()`) |
| `src/lib/cn.ts` | `clsx` + `tailwind-merge` helper |
| `src/store/cart.ts` | Zustand store with localStorage persistence |
| `src/types/index.ts` | TypeScript interfaces for Product, Order, CartItem, etc. |

---

## API Endpoints

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/webhook` | Clerk signature | Receives Clerk webhooks |
| GET | `/api/auth/users` | Admin | List all users |
| PATCH | `/api/auth/users/:userId/promote` | Admin | Promote user to admin |
| POST | `/api/auth/sync-users` | None | Sync users from Clerk (dev only) |

### Products
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/products` | None | List products (pagination, search) |
| POST | `/api/products` | Admin | Create product |
| GET | `/api/products/:slug` | None | Get product by slug |
| PUT | `/api/products/:slug` | Admin | Update product |
| DELETE | `/api/products/:slug` | Admin | Delete product |

### Orders
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/orders` | User | List user's orders |
| POST | `/api/orders` | User | Create COD order |
| GET | `/api/orders/:id` | User | Get order details |
| PATCH | `/api/orders/:id/status` | Admin | Update order status |

### Uploads
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/uploads/single` | Admin | Upload single file |
| POST | `/api/uploads/multiple` | Admin | Upload multiple files |

---

## Database Schema

### Models

```
User          # id, clerkId, name, email, role (CUSTOMER | ADMIN)
Category      # id, name, slug
Product       # id, name, slug, description, price, stock, images[], featured, categoryId
ProductVariant # id, productId, name, value, priceMod, stock
Order         # id, userId, status, totalPrice, address, phone, notes, createdAt
OrderItem     # id, orderId, productId, quantity, unitPrice, variantName
```

---

## Environment Variables

### Backend (`.env`)
```env
PORT=3001
NODE_ENV=development
DATABASE_URL=<neon-postgresql-connection-string>
CLERK_SECRET_KEY=<clerk-secret-key>
CLERK_PUBLISHABLE_KEY=<clerk-publishable-key>
CLERK_WEBHOOK_SECRET=<clerk-webhook-secret>
UPLOAD_DIR=./uploads
```

### Frontend (`.env`)
```env
VITE_API_URL=http://localhost:3001
VITE_CLERK_PUBLISHABLE_KEY=<clerk-publishable-key>
```

---

## Communication Flow

### Architecture Overview

```
┌─────────────────┐                    ┌─────────────────┐
│                 │      HTTP/REST     │                 │
│  React Frontend  │◄──────────────────►│  Express API    │
│  (Vite :5173)   │    JSON + CORS     │  (Port :3001)   │
│                 │                    │                 │
│  - TanStack     │                    │  - Prisma       │
│    Query        │                    │  - Clerk Auth   │
│  - Zustand      │                    │  - Multer       │
│  - Axios        │                    │                 │
└─────────────────┘                    └─────────────────┘
        │                                     │
        │      ┌──────────────┐               │
        └─────►│ Clerk Cloud  │◄──────────────┘
               │  Auth Service│    Webhooks
               └──────────────┘
```

### How It Works

**1. HTTP Client Setup**
```typescript
// frontend/src/lib/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // http://localhost:3001
  headers: { "Content-Type": "application/json" },
});
```

**2. Request Flow**

```
User Action (e.g., click "Add to Cart")
       │
       ▼
React Component
       │
       ▼
TanStack Query Mutation ───► Axios POST /api/orders
       │                              │
       │                              ▼
       │                    Express Routes (routes/orders.ts)
       │                              │
       ▼                              ▼
Invalidate Query              Validate + Save to PostgreSQL
Cache & UI Update                    │
       ▲                             ▼
       │                    Return JSON Response
       │                    { "id": "123", "status": "PENDING" }
       │
       ▼
UI Updates Automatically
```

**3. Authentication Flow**

```
User Signs In via Clerk
        │
        ▼
Clerk Returns Session Token
        │
        ▼
Frontend stores in memory (Clerk handles this)
        │
        ▼
API Request with Bearer Token:
┌─────────────────────────────────────┐
│ GET /api/products                    │
│ Authorization: Bearer eyJhbGci...   │
└─────────────────────────────────────┘
        │
        ▼
Backend middleware/session.ts validates token
        │
        ▼
Clerk Backend SDK verifies with Clerk Cloud
        │
        ▼
Return decoded user info to route handler
```

**4. CORS Configuration**

```typescript
// backend/src/index.ts
app.use(cors({
  origin: "http://localhost:5173",  // Vite dev server
  credentials: true,                  // Allow cookies/tokens
}));
```

### Key Communication Patterns

| Pattern | Frontend | Backend |
|---------|----------|---------|
| **HTTP Client** | Axios | Express |
| **Base URL** | `VITE_API_URL` env | `PORT` env |
| **Auth Token** | `getToken()` from Clerk | `@clerk/backend` verify |
| **Data Format** | JSON | JSON |
| **File Uploads** | FormData + Axios | Multer → `backend/uploads/` |
| **Real-time** | TanStack Query (polling/refetch) | REST endpoints |

### Example API Calls

**GET Products (Public)**
```typescript
// Frontend
const { data } = await api.get("/api/products?page=1&limit=12");
// Returns: { products: [...], total: 42, page: 1, limit: 12, totalPages: 4 }
```

**Create Order (Authenticated)**
```typescript
// Frontend - with Clerk auth token
const token = await getToken();
const response = await api.post("/api/orders", {
  address: "Jl. Merdeka No. 1",
  phone: "081234567890",
  notes: "Please ring the bell",
}, {
  headers: { Authorization: `Bearer ${token}` },
});
```

**Upload Image (Admin)**
```typescript
// Frontend
const formData = new FormData();
formData.append("file", imageFile);
await api.post("/api/uploads/single", formData, {
  headers: { "Content-Type": "multipart/form-data" },
});
// Returns: { url: "/uploads/abc123.jpg" }
```

### Environment Configuration

| Variable | Frontend | Backend | Purpose |
|----------|----------|---------|---------|
| `VITE_API_URL` | `http://localhost:3001` | - | Frontend knows where to send requests |
| `CLERK_PUBLISHABLE_KEY` | ✓ | - | Frontend initializes Clerk |
| `CLERK_SECRET_KEY` | - | ✓ | Backend verifies Clerk tokens |
| `DATABASE_URL` | - | ✓ | Backend connects to PostgreSQL |

### Response Format Convention

```typescript
// Success Response
{ "data": { ... } }           // Single resource
{ "products": [...], ... }   // Paginated response

// Error Response
{ "error": "Product not found", "code": 404 }
```

---

## Getting Started

### Prerequisites
- Node.js 20+
- npm or pnpm
- Neon PostgreSQL database (or local PostgreSQL)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd CRUD-RE-Test

# Setup Backend
cd backend
npm install
cp .env.example .env  # Configure your environment variables
npm run db:generate

# Setup Frontend
cd ../frontend
npm install
cp .env.example .env  # Configure your environment variables
```

### Development

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Frontend runs at http://localhost:5173
Backend API runs at http://localhost:3001

### Database Commands

```bash
cd backend
npm run db:generate   # Regenerate Prisma client
npm run db:push       # Push schema (no migration)
npm run db:migrate    # Create & apply migrations
npm run db:studio     # Open Prisma Studio
```

---

## Clerk Authentication

### Sign-up Flow
- Users can sign up with email OR username + password
- Username sign-ups store email as `{username}@clerk.local`
- First user to sign up automatically becomes ADMIN
- Subsequent users become CUSTOMER

### Development Mode
Webhook requires public URL. For local dev without webhooks:
```bash
curl -X POST http://localhost:3001/api/auth/sync-users
```

### Production Webhook Setup
1. Clerk Dashboard → Webhooks → Add Endpoint
2. URL: `https://your-domain.com/api/auth/webhook`
3. Subscribe to: `user.created`, `user.updated`, `user.deleted`

---

## File Uploads

- Uploaded files are stored in `backend/uploads/`
- Served publicly at `http://localhost:3001/uploads/{filename}`
- The `uploads/` folder is gitignored (not committed)

---

## Available Scripts

### Frontend
| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | TypeScript compile + Vite build |
| `npm run lint` | ESLint check |
| `npm run preview` | Preview production build |

### Backend
| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (nodemon + tsx) |
| `npm run build` | TypeScript compile |
| `npm run start` | Run production server |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run migrations |
| `npm run db:studio` | Open Prisma Studio |