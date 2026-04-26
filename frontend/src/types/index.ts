export interface ProductVariant {
  id: string;
  name: string;
  value: string;
  priceMod: number;
  stock: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  featured: boolean;
  categoryId: string | null;
  category: Category | null;
  variants: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  variantName?: string;
  unitPrice: number;
}

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  variantName: string | null;
  product: Product;
}

export type OrderStatus = "PENDING" | "CONFIRMED" | "SHIPPED" | "COMPLETED" | "CANCELLED";

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  totalPrice: number;
  items: OrderItem[];
  address: string;
  phone: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  user?: { id: string; name: string | null; email: string };
}

export interface PaginatedResponse<T> {
  products: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}