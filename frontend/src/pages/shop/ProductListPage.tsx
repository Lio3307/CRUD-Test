import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Product, PaginatedResponse } from "@/types";
import { Link } from "react-router";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/Pagination";
import { Search, Package, ShoppingBag } from "lucide-react";

export default function ProductListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["products", { page, search }],
    queryFn: () =>
      api
        .get<PaginatedResponse<Product>>(
          `/api/products?page=${page}&limit=12${search ? `&search=${search}` : ""}`
        )
        .then((r) => r.data),
    placeholderData: (prev) => prev,
  });

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-gray-900">
            TokoKu
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/cart"
              className="relative text-gray-700 hover:text-gray-900 transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-square w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </Card>
            ))}
          </div>
        ) : data?.products.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No products found</h3>
            <p className="text-gray-500 mt-1">
              {search ? `No products matching "${search}"` : "No products available"}
            </p>
            {search && (
              <Button
                variant="link"
                onClick={() => handleSearch("")}
                className="mt-2 text-blue-600"
              >
                Clear search
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {data?.products.map((product) => (
                <Link key={product.id} to={`/products/${product.slug}`} className="group">
                  <Card className="overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
                    <div className="aspect-square bg-gray-100 relative overflow-hidden">
                      {product.images[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-12 h-12 text-gray-300" />
                        </div>
                      )}
                      {product.featured && (
                        <Badge
                          variant="secondary"
                          className="absolute top-2 right-2 bg-blue-600 text-white"
                        >
                          Featured
                        </Badge>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Rp {product.price.toLocaleString("id-ID")}
                      </p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {data && data.totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={page}
                  totalPages={data.totalPages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}