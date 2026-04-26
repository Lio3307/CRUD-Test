import { Package, ShoppingCart, Inbox, FileX } from "lucide-react";
import { cn } from "@/lib/utils";

type EmptyStateVariant = "products" | "orders" | "cart" | "default";

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  title?: string;
  description?: string;
  className?: string;
}

const VARIANT_CONFIG: Record<EmptyStateVariant, { icon: React.ReactNode; title: string; description: string }> = {
  products: {
    icon: <Package className="w-12 h-12 text-gray-300" />,
    title: "No products found",
    description: "Products you add will appear here",
  },
  orders: {
    icon: <Inbox className="w-12 h-12 text-gray-300" />,
    title: "No orders yet",
    description: "Orders will appear here when customers make purchases",
  },
  cart: {
    icon: <ShoppingCart className="w-12 h-12 text-gray-300" />,
    title: "Your cart is empty",
    description: "Add some products to get started",
  },
  default: {
    icon: <FileX className="w-12 h-12 text-gray-300" />,
    title: "No data",
    description: "There's nothing here yet",
  },
};

export function EmptyState({ variant = "default", title, description, className }: EmptyStateProps) {
  const config = VARIANT_CONFIG[variant];

  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4 text-center", className)}>
      <div className="mb-4">{config.icon}</div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">{title ?? config.title}</h3>
      <p className="text-sm text-gray-500">{description ?? config.description}</p>
    </div>
  );
}