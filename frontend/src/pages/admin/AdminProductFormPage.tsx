import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";
import api from "@/lib/api";
import type { Product } from "@/types";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, Upload, ArrowLeft, ImageIcon } from "lucide-react";

interface VariantRow {
  name: string;
  value: string;
  priceMod: number;
  stock: number;
}

export default function AdminProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const { getToken } = useAuth();

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    categoryId: "",
    featured: false,
  });
  const [images, setImages] = useState<string[]>([]);
  const [variants, setVariants] = useState<VariantRow[]>([]);
  const [uploading, setUploading] = useState(false);

  const { data: existingProduct, isLoading: loadingProduct } = useQuery({
    queryKey: ["product-edit", id],
    queryFn: async () => {
      const token = await getToken();
      return api.get<Product>(`/api/products/${id}`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      }).then((r) => r.data);
    },
    enabled: isEditing,
  });

  useEffect(() => {
    if (existingProduct) {
      setForm({
        name: existingProduct.name,
        description: existingProduct.description,
        price: String(existingProduct.price),
        stock: String(existingProduct.stock),
        categoryId: existingProduct.categoryId ?? "",
        featured: existingProduct.featured,
      });
      setImages(existingProduct.images);
      setVariants(
        existingProduct.variants.map((v) => ({
          name: v.name,
          value: v.value,
          priceMod: v.priceMod,
          stock: v.stock,
        }))
      );
    }
  }, [existingProduct]);

  const saveMutation = useMutation({
    mutationFn: async (
      data: typeof form & { images: string[]; variants: VariantRow[] }
    ) => {
      const token = await getToken();
      const headers = { Authorization: token ? `Bearer ${token}` : "" };
      return isEditing
        ? api.put(`/api/products/${id}`, data, { headers })
        : api.post("/api/products", data, { headers });
    },
    onSuccess: () => {
      toast.success(isEditing ? "Product updated!" : "Product created!");
      navigate("/admin/products");
    },
    onError: () => toast.error("Failed to save product"),
  });

  const handleImageUpload = async (files: FileList) => {
    setUploading(true);
    try {
      const uploaded: string[] = [];
      const token = await getToken();
      const headers = { Authorization: token ? `Bearer ${token}` : "" };
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await api.post<{ url: string }>("/api/uploads/single", formData, {
          headers: { ...headers, "Content-Type": "multipart/form-data" },
        });
        uploaded.push(res.data.url);
      }
      setImages((prev) => [...prev, ...uploaded]);
    } catch {
      toast.error("Failed to upload images");
    }
    setUploading(false);
  };

  const addVariant = () =>
    setVariants((v) => [...v, { name: "", value: "", priceMod: 0, stock: 0 }]);
  const removeVariant = (i: number) =>
    setVariants((v) => v.filter((_, idx) => idx !== i));
  const updateVariant = (i: number, field: keyof VariantRow, value: string | number) =>
    setVariants((v) =>
      v.map((row, idx) => (idx === i ? { ...row, [field]: value } : row))
    );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) {
      toast.error("Name and price are required");
      return;
    }
    saveMutation.mutate({
      ...form,
      price: Number(form.price),
      stock: Number(form.stock) || 0,
      categoryId: form.categoryId || null,
      images,
      variants,
    });
  };

  if (isEditing && loadingProduct) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/admin/products">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? "Edit Product" : "Add Product"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {isEditing ? "Update product information" : "Create a new product"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Enter product name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  placeholder="0"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                  placeholder="0"
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Checkbox
                  id="featured"
                  checked={form.featured}
                  onCheckedChange={(checked) =>
                    setForm((f) => ({ ...f, featured: checked === true }))
                  }
                />
                <Label htmlFor="featured" className="text-sm font-normal">
                  Featured product
                </Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Enter product description"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Images Card */}
        <Card>
          <CardHeader>
            <CardTitle>Product Images</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {images.map((url, i) => (
                <div
                  key={i}
                  className="relative w-24 h-24 bg-gray-100 rounded-lg border overflow-hidden group"
                >
                  <img
                    src={url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setImages((prev) => prev.filter((_, idx) => idx !== i))
                    }
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors">
                {uploading ? (
                  <Skeleton className="w-8 h-8 rounded" />
                ) : (
                  <>
                    <Upload className="w-5 h-5 text-gray-400" />
                    <span className="text-xs text-gray-500 mt-1">Upload</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                  className="hidden"
                />
              </label>
            </div>
            {images.length === 0 && (
              <p className="text-sm text-gray-500 mt-2">
                <ImageIcon className="w-4 h-4 inline mr-1" />
                No images added yet. Upload images above.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Variants Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Product Variants</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addVariant}>
                <Plus className="w-4 h-4 mr-1" />
                Add Variant
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {variants.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No variants yet — add one to support size/color options</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Variant Header */}
                <div className="grid grid-cols-12 gap-3 text-xs font-medium text-gray-500 px-3">
                  <div className="col-span-3">Name</div>
                  <div className="col-span-3">Value</div>
                  <div className="col-span-2">Price +</div>
                  <div className="col-span-2">Stock</div>
                  <div className="col-span-2"></div>
                </div>
                {variants.map((v, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-12 gap-3 items-start bg-gray-50 rounded-lg p-3"
                  >
                    <Input
                      placeholder="e.g. Size"
                      value={v.name}
                      onChange={(e) => updateVariant(i, "name", e.target.value)}
                      className="col-span-3"
                    />
                    <Input
                      placeholder="e.g. XL"
                      value={v.value}
                      onChange={(e) => updateVariant(i, "value", e.target.value)}
                      className="col-span-3"
                    />
                    <Input
                      placeholder="+"
                      type="number"
                      value={v.priceMod}
                      onChange={(e) => updateVariant(i, "priceMod", Number(e.target.value))}
                      className="col-span-2"
                    />
                    <Input
                      placeholder="0"
                      type="number"
                      value={v.stock}
                      onChange={(e) => updateVariant(i, "stock", Number(e.target.value))}
                      className="col-span-2"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeVariant(i)}
                      className="col-span-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-3 pt-4 border-t bg-white p-4 rounded-lg">
          <Button type="submit" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? "Saving..." : "Save Product"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link to="/admin/products">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}