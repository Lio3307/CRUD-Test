import type { OrderStatus } from "@/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<OrderStatus, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  CONFIRMED: { label: "Confirmed", className: "bg-blue-100 text-blue-800 border-blue-200" },
  SHIPPED: { label: "Shipped", className: "bg-purple-100 text-purple-800 border-purple-200" },
  COMPLETED: { label: "Completed", className: "bg-green-100 text-green-800 border-green-200" },
  CANCELLED: { label: "Cancelled", className: "bg-red-100 text-red-800 border-red-200" },
};

interface StatusBadgeProps {
  status: OrderStatus | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status as OrderStatus] ?? { label: status, className: "bg-gray-100 text-gray-800 border-gray-200" };

  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}