import { useState } from "react";
import { useAuth } from "@clerk/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { SortingState } from "@tanstack/react-table";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import api from "@/lib/api";
import type { Order, OrderStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  ArrowUpDown,
  Package,
  MapPin,
  Phone,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";

const columnHelper = createColumnHelper<Order>();

const STATUS_OPTIONS: OrderStatus[] = ["PENDING", "CONFIRMED", "SHIPPED", "COMPLETED", "CANCELLED"];

export default function AdminOrdersPage() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const token = await getToken();
      return api.get<Order[]>("/api/orders", { headers: { Authorization: token ? `Bearer ${token}` : "" } }).then((r) => r.data);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const token = await getToken();
      return api.put(`/api/orders/${id}`, { status }, { headers: { Authorization: token ? `Bearer ${token}` : "" } });
    },
    onSuccess: () => {
      toast.success("Order status updated");
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
    onError: () => toast.error("Failed to update order"),
  });

  const columns = [
    columnHelper.accessor("id", {
      header: "Order ID",
      cell: (info) => (
        <span className="font-mono text-xs text-gray-500">{info.getValue().slice(0, 8)}...</span>
      ),
    }),
    columnHelper.accessor("user", {
      header: "Customer",
      cell: (info) => info.getValue()?.email ?? info.row.original.userId,
    }),
    columnHelper.accessor("items", {
      header: "Items",
      cell: (info) => (
        <div className="max-w-32">
          <ul className="text-xs text-gray-500 space-y-0.5">
            {info.getValue().slice(0, 2).map((item, i) => (
              <li key={i}>
                {item.product?.name ?? "—"} ×{item.quantity}
              </li>
            ))}
            {info.getValue().length > 2 && (
              <li className="text-gray-400">+{info.getValue().length - 2} more</li>
            )}
          </ul>
        </div>
      ),
    }),
    columnHelper.accessor("totalPrice", {
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-1 -ml-3"
        >
          Total
          <ArrowUpDown className="w-4 h-4" />
        </Button>
      ),
      cell: (info) => (
        <span className="font-medium">Rp {info.getValue().toLocaleString("id-ID")}</span>
      ),
    }),
    columnHelper.accessor("status", {
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-1 -ml-3"
        >
          Status
          <ArrowUpDown className="w-4 h-4" />
        </Button>
      ),
      cell: (info) => <StatusBadge status={info.getValue()} />,
    }),
    columnHelper.accessor("address", {
      header: "Address",
      cell: (info) => (
        <div className="flex items-center gap-1 text-xs text-gray-500 max-w-32 truncate">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          {info.getValue()}
        </div>
      ),
    }),
    columnHelper.accessor("phone", {
      header: () => (
        <div className="flex items-center gap-1">
          <Phone className="w-3 h-3" />
          Phone
        </div>
      ),
      cell: (info) => <span className="text-sm">{info.getValue()}</span>,
    }),
    columnHelper.accessor("createdAt", {
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-1 -ml-3"
        >
          Date
          <ArrowUpDown className="w-4 h-4" />
        </Button>
      ),
      cell: (info) => (
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Calendar className="w-3 h-3" />
          {new Date(info.getValue()).toLocaleDateString("id-ID")}
        </div>
      ),
    }),
    columnHelper.display({
      id: "actions",
      cell: (info) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <div className="px-2 py-1.5 text-xs font-medium text-gray-500">Update Status</div>
            {STATUS_OPTIONS.map((status) => (
              <DropdownMenuItem
                key={status}
                onClick={() => updateMutation.mutate({ id: info.row.original.id, status })}
                disabled={info.row.original.status === status || updateMutation.isPending}
                className={info.row.original.status === status ? "bg-gray-100" : ""}
              >
                <StatusBadge status={status} className="text-xs" />
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    }),
  ];

  const table = useReactTable({
    data: orders ?? [],
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-500 text-sm mt-1">
          {orders?.length ?? 0} order{orders?.length !== 1 ? "s" : ""}
        </p>
      </div>

      <Card>
        <div className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : orders?.length === 0 ? (
            <EmptyState variant="orders" className="py-12" />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id} className="border-b bg-gray-50 text-left">
                        {headerGroup.headers.map((header) => (
                          <th key={header.id} className="px-4 py-3 font-medium text-gray-500">
                            {header.isPlaceholder
                              ? null
                              : flexRender(header.column.columnDef.header, header.getContext())}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody>
                    {table.getRowModel().rows.map((row) => (
                      <tr key={row.id} className="border-b hover:bg-gray-50 transition-colors">
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="px-4 py-3">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {table.getPageCount() > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <p className="text-sm text-gray-500">
                    Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </Card>
    </div>
  );
}