import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useCartStore } from "@/store/cart";
import api from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  CreditCard,
  MapPin,
  Phone,
  ShoppingBag,
  AlertCircle,
} from "lucide-react";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCartStore();
  const [form, setForm] = useState({ address: "", phone: "", notes: "" });

  const orderMutation = useMutation({
    mutationFn: (data: {
      items: { productId: string; quantity: number; variantName?: string }[];
      address: string;
      phone: string;
      notes?: string;
    }) => api.post("/api/orders", data),
    onSuccess: () => {
      clearCart();
      toast.success("Order placed successfully!");
      navigate("/");
    },
    onError: () => toast.error("Failed to place order"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.address || !form.phone) {
      toast.error("Address and phone are required");
      return;
    }
    if (items.length === 0) {
      toast.error("Cart is empty");
      return;
    }
    orderMutation.mutate({
      items: items.map((i) => ({
        productId: i.product.id,
        quantity: i.quantity,
        variantName: i.variantName,
      })),
      address: form.address,
      phone: form.phone,
      notes: form.notes || undefined,
    });
  };

  const handleChange = (field: "address" | "phone" | "notes") => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8">
            <Link to="/cart">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <span className="text-xl font-bold text-gray-900">TokoKu</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <CreditCard className="w-6 h-6" />
          Checkout
        </h1>

        {/* Order Summary Card */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.map((item, i) => (
              <div key={`${item.product.id}-${item.variantName}`} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {item.product.name}
                  {item.variantName && <span className="text-gray-400"> ({item.variantName})</span>}
                  <span className="text-gray-400"> ×{item.quantity}</span>
                </span>
                <span className="font-medium">
                  Rp {(item.unitPrice * item.quantity).toLocaleString("id-ID")}
                </span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-xl font-bold text-gray-900">
                Rp {total().toLocaleString("id-ID")}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Checkout Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Shipping Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  Alamat Lengkap *
                </Label>
                <Textarea
                  id="address"
                  value={form.address}
                  onChange={handleChange("address")}
                  placeholder="Masukkan alamat lengkap termasuk kode pos"
                  rows={3}
                  required
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-1">
                  <Phone className="w-4 h-4 text-gray-400" />
                  Nomor Telepon *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange("phone")}
                  placeholder="08xxxxxxxxxx"
                  required
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Catatan (opsional)</Label>
                <Textarea
                  id="notes"
                  value={form.notes}
                  onChange={handleChange("notes")}
                  placeholder="Catatan tambahan untuk pesanan"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* COD Notice */}
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-800">Cash on Delivery (COD)</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    Pembayaran dilakukan saat barang diterima. Pastikan nomor telepon dapat dihubungi
                    untuk konfirmasi pesanan.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={orderMutation.isPending}
            size="lg"
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {orderMutation.isPending ? (
              <>
                <Skeleton className="w-4 h-4 rounded-full mr-2" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5 mr-2" />
                Place Order (COD)
              </>
            )}
          </Button>
        </form>
      </main>
    </div>
  );
}