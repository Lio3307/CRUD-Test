import { useState } from "react";
import { Link, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Product } from "@/types";
import { useCartStore } from "@/store/cart";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  ChevronLeft,
  ShoppingBag,
  Minus,
  Plus,
  Package,
  Star,
  ShieldCheck,
  Truck,
  RotateCw,
} from "lucide-react";

function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images.length) {
    return (
      <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center">
        <Package className="w-20 h-20 text-gray-300" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden relative group">
        <img
          src={images[activeIndex]}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                i === activeIndex
                  ? "border-blue-600 ring-2 ring-blue-100"
                  : "border-transparent hover:border-gray-300"
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function VariantSelector({
  name,
  values,
  selected,
  onSelect,
  variants,
}: {
  name: string;
  values: string[];
  selected: string | null;
  onSelect: (v: string) => void;
  variants: Product["variants"];
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{name}</span>
        {selected && (
          <span className="text-sm text-blue-600">{selected}</span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {values.map((value) => {
          const variant = variants.find((v) => v.name === name && v.value === value);
          const isSelected = selected === value;
          const isOutOfStock = variant && variant.stock <= 0;

          return (
            <button
              key={value}
              onClick={() => !isOutOfStock && onSelect(value)}
              disabled={isOutOfStock}
              className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isOutOfStock
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed line-through"
                  : isSelected
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white border border-gray-200 text-gray-700 hover:border-blue-400 hover:text-blue-600"
              }`}
            >
              {value}
              {variant && variant.priceMod > 0 && !isOutOfStock && (
                <span className={`ml-1 text-xs ${isSelected ? "text-blue-200" : "text-gray-500"}`}>
                  +{variant.priceMod.toLocaleString("id-ID")}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TrustBadges() {
  return (
    <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
      {[
        { icon: Truck, label: "Free Delivery" },
        { icon: RotateCw, label: "Easy Returns" },
        { icon: ShieldCheck, label: "Secure Payment" },
      ].map(({ icon: Icon, label }) => (
        <div key={label} className="flex flex-col items-center gap-1.5 p-3 bg-gray-50 rounded-lg">
          <Icon className="w-5 h-5 text-blue-600" />
          <span className="text-xs text-gray-600 text-center">{label}</span>
        </div>
      ))}
    </div>
  );
}

export default function ProductDetailPage() {
  const { slug } = useParams();
  const addItem = useCartStore((s) => s.addItem);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => api.get<Product>(`/api/products/${slug}`).then((r) => r.data),
  });

  const variantGroups: Record<string, string[]> = {};
  product?.variants.forEach((v) => {
    if (!variantGroups[v.name]) variantGroups[v.name] = [];
    if (!variantGroups[v.name].includes(v.value)) variantGroups[v.name].push(v.value);
  });

  const selectedVariantLabel = Object.entries(selectedVariants)
    .map(([k, v]) => `${k}: ${v}`)
    .join(", ") || undefined;

  const selectedVariantObjs = product?.variants.filter(
    (v) => Object.entries(selectedVariants).some(([k, val]) => k === v.name && val === v.value)
  );

  const totalPrice =
    (product?.price ?? 0) + (selectedVariantObjs?.reduce((sum, v) => sum + v.priceMod, 0) ?? 0);

  const totalStock = selectedVariantObjs?.reduce((sum, v) => sum + v.stock, 0)
    ?? product?.stock ?? 0;

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, quantity, selectedVariantLabel);
    toast.success(`${product.name} added to cart`, {
      description: selectedVariantLabel ? `Variant: ${selectedVariantLabel}` : undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b px-6 py-4">
          <div className="max-w-7xl mx-auto">
            <Skeleton className="h-6 w-20" />
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Skeleton className="aspect-square rounded-xl" />
            <div className="space-y-6">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-20 h-20 text-gray-200 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">Product not found</h2>
          <p className="text-gray-500 mt-1">This product may have been removed or is unavailable.</p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:underline"
          >
            <ChevronLeft className="w-4 h-4" />
            Browse products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-gray-900 tracking-tight">
            TokoKu
          </Link>
          <nav className="flex items-center gap-6">
            <Link to="/products" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Products
            </Link>
            <Link to="/cart" className="relative text-gray-700 hover:text-gray-900 transition-colors">
              <ShoppingBag className="w-5 h-5" />
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-gray-700 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-gray-700 transition-colors">Products</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Gallery */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <ProductGallery images={product.images} name={product.name} />
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            {/* Title & Price */}
            <div className="space-y-4">
              {product.featured && (
                <Badge className="bg-blue-600 text-white px-3 py-1">Featured</Badge>
              )}
              <div className="space-y-2">
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                  {product.name}
                </h1>
                {product.category && (
                  <p className="text-sm text-gray-500">{product.category.name}</p>
                )}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-blue-600">
                  Rp {totalPrice.toLocaleString("id-ID")}
                </span>
                {selectedVariantObjs && selectedVariantObjs.length > 0 && (
                  <span className="text-sm text-gray-400 line-through">
                    Rp {(product.price + selectedVariantObjs.reduce((s, v) => s + v.priceMod, 0)).toLocaleString("id-ID")}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-sm text-gray-500">5.0 (128 reviews)</span>
              </div>
            </div>

            <Separator />

            {/* Description */}
            {product.description && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                  Description
                </h3>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Variants */}
            {Object.keys(variantGroups).length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                  Options
                </h3>
                {Object.entries(variantGroups).map(([name, values]) => (
                  <VariantSelector
                    key={name}
                    name={name}
                    values={values}
                    selected={selectedVariants[name] || null}
                    onSelect={(v) =>
                      setSelectedVariants((prev) => ({ ...prev, [name]: v }))
                    }
                    variants={product.variants}
                  />
                ))}
              </div>
            )}

            {/* Stock & Quantity */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                  Quantity
                </span>
                <span className={`text-sm ${totalStock > 10 ? "text-green-600" : totalStock > 0 ? "text-orange-600" : "text-red-600"}`}>
                  {totalStock > 0 ? `${totalStock} units available` : "Out of stock"}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-200 rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-12 w-12 rounded-r-none"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <Input
                    type="number"
                    min={1}
                    max={totalStock}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(totalStock, Number(e.target.value))))}
                    className="h-12 w-16 text-center border-0 focus-visible:ring-0 font-semibold"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.min(totalStock, quantity + 1))}
                    disabled={quantity >= totalStock}
                    className="h-12 w-12 rounded-l-none"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <span className="text-sm text-gray-500">
                  Total: <span className="font-semibold text-gray-900">Rp {(totalPrice * quantity).toLocaleString("id-ID")}</span>
                </span>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="space-y-3">
              <Button
                onClick={handleAddToCart}
                size="lg"
                disabled={totalStock === 0}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 text-lg rounded-xl shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                {totalStock === 0 ? "Out of Stock" : "Add to Cart"}
              </Button>
            </div>

            {/* Trust Badges */}
            <TrustBadges />
          </div>
        </div>
      </main>
    </div>
  );
}