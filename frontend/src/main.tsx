import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClerkProvider } from "@clerk/react";
import "./index.css";
import App from "./App";
import { ProtectedLayout } from "@/components/layouts";
import { HomePage, ProductListPage, ProductDetailPage, CartPage, CheckoutPage, LoginPage } from "@/pages/shop";
import { AdminDashboardPage, AdminProductsPage, AdminProductFormPage, AdminOrdersPage } from "@/pages/admin";
import { Toaster } from "sonner";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "products", element: <ProductListPage /> },
      { path: "products/:slug", element: <ProductDetailPage /> },
      { path: "cart", element: <CartPage /> },
      { path: "checkout", element: <CheckoutPage /> },
      { path: "login", element: <LoginPage /> },
    ],
  },
  {
    path: "/admin",
    element: <ProtectedLayout role="ADMIN" />,
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: "products", element: <AdminProductsPage /> },
      { path: "products/new", element: <AdminProductFormPage /> },
      { path: "products/:id/edit", element: <AdminProductFormPage /> },
      { path: "orders", element: <AdminOrdersPage /> },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster position="top-right" richColors />
      </QueryClientProvider>
    </ClerkProvider>
  </StrictMode>,
);