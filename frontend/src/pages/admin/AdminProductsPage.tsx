import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router";
import type { SortingState } from "@tanstack/react-table";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import api from "@/lib/api";
import type { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/DataTable";
import { EmptyState } from "@/components/EmptyState";
import { Search, Plus, MoreHorizontal, Edit, Trash2, ArrowUpDown, ImageIcon } from "lucide-react";
import { toast } from "sonner";

const columnHelper = createColumnHelper<Product>();

export default function AdminProductsPage() {
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-products-list", search],
    queryFn: () =>
      api
        .get<{ products: Product[] }>(`/api/products?limit=100${search ? `&search=${search}` : ""}`)
        .then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/products/${id}`),
    onSuccess: () => {
      toast.success("Product deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-products-list"] });
    },
    onError: () => toast.error("Failed to delete product"),
  });

  const columns = [
    columnHelper.accessor("images", {
      header: "Image",
      cell: (info) =>
        info.getValue()[0] ? (
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
            <img src={info.getValue()[0]} alt="" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
            <ImageIcon className="w-5 h-5 text-gray-400" />
          </div>
        ),
    }),
    columnHelper.accessor("name", {
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-1 -ml-3"
        >
          Name
          <ArrowUpDown className="w-4 h-4" />
        </Button>
      ),
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    }),
    columnHelper.accessor("price", {
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-1 -ml-3"
        >
          Price
          <ArrowUpDown className="w-4 h-4" />
        </Button>
      ),
      cell: (info) => <span>Rp {info.getValue().toLocaleString("id-ID")}</span>,
    }),
    columnHelper.accessor("stock", {
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-1 -ml-3"
        >
          Stock
          <ArrowUpDown className="w-4 h-4" />
        </Button>
      ),
    }),
    columnHelper.accessor("variants", {
      header: "Variants",
      cell: (info) => <span className="text-gray-500">{info.getValue().length}</span>,
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
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to={`/admin/products/${info.row.original.id}/edit`} className="flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                if (confirm("Delete this product?")) {
                  deleteMutation.mutate(info.row.original.id);
                }
              }}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    }),
  ];

  const table = useReactTable({
    data: data?.products ?? [],
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 text-sm mt-1">
            {data?.products.length ?? 0} product{data?.products.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/products/new" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Product
          </Link>
        </Button>
      </div>

      <Card>
        <div className="p-4 border-b">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : data?.products.length === 0 && !search ? (
            <EmptyState variant="products" className="py-12" />
          ) : data?.products.length === 0 && search ? (
            <EmptyState
              title="No search results"
              description={`No products matching "${search}"`}
              className="py-12"
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id} className="border-b bg-gray-50 text-left">
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            className="px-4 py-3 font-medium text-gray-500"
                          >
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