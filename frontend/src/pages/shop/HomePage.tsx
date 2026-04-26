import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Product } from "@/types";
import { Link } from "react-router";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Package, ShoppingBag } from "lucide-react";

export default function HomePage() {
  const { data: products, isLoading } = useQuery({
    queryKey: ["products", { limit: 8 }],
    queryFn: () => api.get<{ products: Product[] }>("/api/products?limit=8").then(r => r.data.products),
  });

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
              to="/products"
              className="text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              Products
            </Link>
            <Link
              to="/cart"
              className="relative text-gray-700 hover:text-gray-900 transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-12">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Welcome to TokoKu
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Discover our best products at great prices
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Featured Products</h2>
          <Link
            to="/products"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View all →
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-square w-full" />
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
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
                  <CardContent className="p-4">
                    <h3 className="font-medium text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Rp {product.price.toLocaleString("id-ID")}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No products yet</h3>
            <p className="text-gray-500 mt-1">Check back soon for new arrivals</p>
          </div>
        )}
      </main>
    </div>
  );
}