import { useState } from "react";
import { Link } from "react-router";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Package,
  Tag,
  X,
  Truck,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";

function CartItemSkeleton() {
  return (
    <div className="flex gap-4 p-4 border border-gray-100 rounded-xl">
      <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-5 bg-gray-100 rounded w-3/4" />
        <div className="h-4 bg-gray-100 rounded w-1/2" />
        <div className="h-4 bg-gray-100 rounded w-1/3" />
      </div>
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 bg-gray-100 rounded" />
        <div className="h-8 w-12 bg-gray-100 rounded" />
        <div className="h-8 w-8 bg-gray-100 rounded" />
      </div>
    </div>
  );
}

function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center mb-6">
        <ShoppingBag className="w-16 h-16 text-blue-300" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h3>
      <p className="text-gray-500 text-center mb-6 max-w-sm">
        Looks like you haven't added any items yet. Let's find something you'll love!
      </p>
      <Button asChild className="bg-blue-600 hover:bg-blue-700 px-8">
        <Link to="/products">Browse Products</Link>
      </Button>
    </div>
  );
}

function CartItemCard({
  item,
  onUpdateQuantity,
  onRemove,
}: {
  item: ReturnType<typeof useCartStore>["items"][number];
  onUpdateQuantity: (productId: string, quantity: number, variantName?: string) => void;
  onRemove: (productId: string, variantName?: string) => void;
}) {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => onRemove(item.product.id, item.variantName), 200);
  };

  return (
    <div
      className={`group relative bg-white rounded-xl border border-gray-200 p-4 lg:p-5 transition-all duration-200 hover:shadow-md hover:border-blue-200 ${
        isRemoving ? "opacity-50 scale-95" : ""
      }`}
    >
      <div className="flex gap-4 lg:gap-5">
        {/* Product Image */}
        <Link
          to={`/products/${item.product.slug}`}
          className="relative w-24 h-24 lg:w-28 lg:h-28 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden flex-shrink-0 group-hover:ring-2 group-hover:ring-blue-100 transition-all"
        >
          {item.product.images[0] ? (
            <img
              src={item.product.images[0]}
              alt=""
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-10 h-10 text-gray-300" />
            </div>
          )}
        </Link>

        {/* Product Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div className="space-y-1">
            <Link
              to={`/products/${item.product.slug}`}
              className="font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-1 text-base lg:text-lg"
            >
              {item.product.name}
            </Link>
            {item.variantName && (
              <div className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-sm text-gray-500">{item.variantName}</span>
              </div>
            )}
            <p className="text-sm text-gray-500">
              <span className="font-medium text-gray-700">
                Rp {item.unitPrice.toLocaleString("id-ID")}
              </span>
              / unit
            </p>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 lg:hidden">
            <span className="text-xs text-gray-400">Subtotal:</span>
            <span className="font-semibold text-gray-900">
              Rp {(item.unitPrice * item.quantity).toLocaleString("id-ID")}
            </span>
          </div>
        </div>

        {/* Right Section: Quantity + Actions */}
        <div className="flex flex-col items-end justify-between lg:min-w-48">
          {/* Subtotal - Desktop */}
          <div className="hidden lg:block text-right">
            <p className="text-xs text-gray-500 mb-0.5">Subtotal</p>
            <p className="text-lg font-bold text-gray-900">
              Rp {(item.unitPrice * item.quantity).toLocaleString("id-ID")}
            </p>
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1), item.variantName)
              }
              className="h-9 w-9 lg:h-10 lg:w-10 hover:border-blue-300 hover:text-blue-600 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <Input
              type="number"
              min={1}
              value={item.quantity}
              onChange={(e) =>
                onUpdateQuantity(
                  item.product.id,
                  Math.max(1, Number(e.target.value)),
                  item.variantName
                )
              }
              className="w-12 h-9 lg:h-10 text-center font-semibold text-sm border-gray-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                onUpdateQuantity(item.product.id, item.quantity + 1, item.variantName)
              }
              className="h-9 w-9 lg:h-10 lg:w-10 hover:border-blue-300 hover:text-blue-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Remove - Mobile */}
          <button
            onClick={handleRemove}
            className="lg:hidden flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors mt-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Remove</span>
          </button>
        </div>

        {/* Remove Button - Desktop */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRemove}
          className="hidden lg:flex absolute -top-2 -right-2 h-8 w-8 bg-white border border-gray-200 rounded-full shadow-sm text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function OrderSummary({
  total,
  itemCount,
  onCheckout,
}: {
  total: number;
  itemCount: number;
  onCheckout: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="sticky top-24 border-gray-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-blue-600 to-blue-500 text-white"
      >
        <div className="flex items-center gap-3">
          <ShoppingBag className="w-5 h-5" />
          <span className="font-semibold">Order Summary</span>
          <Badge className="bg-white/20 text-white border-0 text-xs">
            {itemCount} item{itemCount !== 1 ? "s" : ""}
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold">
            Rp {total.toLocaleString("id-ID")}
          </span>
          <ChevronDown className={`w-5 h-5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
        </div>
      </button>

      <div className={`space-y-4 p-5 ${isExpanded ? "block" : "hidden lg:block"}`}>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subtotal ({itemCount} items)</span>
            <span className="font-medium">Rp {total.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Shipping</span>
            <span className="font-medium text-green-600 flex items-center gap-1">
              <Truck className="w-4 h-4" />
              Free
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Tax</span>
            <span className="font-medium text-gray-400">Included</span>
          </div>
        </div>

        <Separator />

        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-900">Total</span>
          <span className="text-2xl font-bold text-gray-900">
            Rp {total.toLocaleString("id-ID")}
          </span>
        </div>

        <Button
          onClick={onCheckout}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 rounded-xl shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all text-base"
        >
          Proceed to Checkout
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>

        <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          Secure checkout guaranteed
        </p>
      </div>
    </Card>
  );
}

function CartItemsList({
  items,
  onUpdateQuantity,
  onRemove,
}: {
  items: ReturnType<typeof useCartStore>["items"];
  onUpdateQuantity: (productId: string, quantity: number, variantName?: string) => void;
  onRemove: (productId: string, variantName?: string) => void;
}) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <CartItemCard
          key={`${item.product.id}-${item.variantName}`}
          item={item}
          onUpdateQuantity={onUpdateQuantity}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}

export default function CartPage() {
  const { items, updateQuantity, removeItem } = useCartStore();
  const total = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  const handleCheckout = () => {
    // Navigate to checkout
    window.location.href = "/checkout";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-gray-900 tracking-tight">
            TokoKu
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              to="/products"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Continue Shopping
            </Link>
            <Link
              to="/cart"
              className="relative text-gray-700 hover:text-gray-900 transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-blue-600" />
          </div>
          Shopping Cart
          {items.length > 0 && (
            <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
              {items.length} item{items.length !== 1 ? "s" : ""}
            </span>
          )}
        </h1>

        {items.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <CartItemsList
                items={items}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
              />
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <OrderSummary
                total={total}
                itemCount={items.length}
                onCheckout={handleCheckout}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}