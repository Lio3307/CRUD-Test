import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";
import { Link } from "react-router";
import api from "@/lib/api";
import type { Order, Product } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShoppingCart, Package, DollarSign, Clock } from "lucide-react";

export default function AdminDashboardPage() {
  const { getToken } = useAuth();

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const token = await getToken();
      return api.get<Order[]>("/api/orders", { headers: { Authorization: token ? `Bearer ${token}` : "" } }).then(r => r.data);
    },
  });

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => api.get<{ products: Product[] }>("/api/products?limit=1").then(r => r.data),
  });

  const totalRevenue = orders?.reduce((s, o) => s + o.totalPrice, 0) ?? 0;
  const pendingOrders = orders?.filter((o) => o.status === "PENDING").length ?? 0;

  const stats = [
    {
      label: "Total Orders",
      value: ordersLoading ? null : orders?.length ?? 0,
      icon: ShoppingCart,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Pending Orders",
      value: ordersLoading ? null : pendingOrders,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      label: "Total Products",
      value: productsLoading ? null : products?.total ?? 0,
      icon: Package,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back! Here's what's happening with your store.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  {stat.value === null ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Total Revenue Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Total Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          {ordersLoading ? (
            <Skeleton className="h-8 w-40" />
          ) : (
            <p className="text-3xl font-bold text-gray-900">
              Rp {totalRevenue.toLocaleString("id-ID")}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-lg font-semibold">Recent Orders</CardTitle>
          <Link to="/admin/orders" className="text-sm text-blue-600 hover:underline font-medium">
            View all →
          </Link>
        </CardHeader>
        <CardContent className="pt-0">
          {ordersLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : orders && orders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.slice(0, 5).map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}...</TableCell>
                    <TableCell>{order.user?.email ?? order.userId}</TableCell>
                    <TableCell className="font-medium">Rp {order.totalPrice.toLocaleString("id-ID")}</TableCell>
                    <TableCell>
                      <StatusBadge status={order.status} />
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString("id-ID")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center py-8 text-gray-500">No orders yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}