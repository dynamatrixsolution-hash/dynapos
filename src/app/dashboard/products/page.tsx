"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Search, Plus, Trash2, Tag, Percent, Barcode, Boxes, Edit, Camera } from "lucide-react";
import { useSettings } from "@/components/settings-provider";
import dynamic from "next/dynamic";

const BarcodeScannerModal = dynamic(() => import("@/components/barcode-scanner-modal"), {
  ssr: false,
});

interface ProductItem {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  costPrice: number;
  sellingPrice: number;
  wholesalePrice: number;
  alertQuantity: number;
  categoryId: string | null;
  category?: { name: string } | null;
  description?: string | null;
  image?: string | null;
}

interface CategoryItem {
  id: string;
  name: string;
}

const productSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  costPrice: z.number().nonnegative(),
  sellingPrice: z.number().nonnegative(),
  wholesalePrice: z.number().nonnegative(),
  alertQuantity: z.number().int().nonnegative(),
  categoryId: z.string().uuid().optional().nullable().or(z.literal("")),
  initialStock: z.number().nonnegative(),
  mfgDate: z.string().optional().nullable().or(z.literal("")),
  expiryDate: z.string().optional().nullable().or(z.literal("")),
  image: z.string().optional().nullable().or(z.literal("")),
});

type ProductInputs = z.infer<typeof productSchema>;

export default function ProductsPage() {
  const [products, setProducts] = React.useState<ProductItem[]>([]);
  const [categories, setCategories] = React.useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  
  const { currencySymbol } = useSettings();
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [scannerOpen, setScannerOpen] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductInputs>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      costPrice: 0,
      sellingPrice: 0,
      wholesalePrice: 0,
      alertQuantity: 5,
      initialStock: 10,
      mfgDate: "",
      expiryDate: "",
      image: "",
      categoryId: "",
    },
  });

  const imageValue = watch("image");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setValue("image", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setValue("image", "");
  };

  const loadData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const [prodRes, catRes] = await Promise.all([
        fetch(`/api/v1/products?limit=100&search=${search}`),
        fetch("/api/v1/categories"),
      ]);
      
      if (prodRes.ok) {
        const data = await prodRes.json();
        setProducts(data.products || []);
      }
      if (catRes.ok) {
        const data = await catRes.json();
        setCategories(data || []);
      }
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleEdit = (product: ProductItem) => {
    setEditingId(product.id);
    setSubmitError(null);
    setValue("name", product.name);
    setValue("sku", product.sku || "");
    setValue("barcode", product.barcode || "");
    setValue("costPrice", product.costPrice);
    setValue("sellingPrice", product.sellingPrice);
    setValue("wholesalePrice", product.wholesalePrice || 0);
    setValue("alertQuantity", product.alertQuantity);
    setValue("categoryId", product.categoryId || "");
    setValue("initialStock", 0);
    setValue("mfgDate", "");
    setValue("expiryDate", "");
    setValue("image", product.image || "");
    setModalOpen(true);
  };

  const onSubmit = async (data: ProductInputs) => {
    setSubmitError(null);
    try {
      if (editingId) {
        const payload = {
          name: data.name,
          sku: data.sku || null,
          barcode: data.barcode || null,
          costPrice: data.costPrice,
          sellingPrice: data.sellingPrice,
          wholesalePrice: data.wholesalePrice,
          alertQuantity: data.alertQuantity,
          categoryId: data.categoryId || null,
          image: data.image || null,
        };

        const res = await fetch(`/api/v1/products/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const json = await res.json();
          setSubmitError(json.error || "Failed to update product");
          return;
        }
      } else {
        const payload = {
          ...data,
          categoryId: data.categoryId || null,
          manufacturingDate: data.mfgDate || null,
          expiryDate: data.expiryDate || null,
          image: data.image || null,
        };

        const res = await fetch("/api/v1/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const json = await res.json();
          setSubmitError(json.error || "Failed to create product");
          return;
        }
      }

      setModalOpen(false);
      setEditingId(null);
      reset();
      loadData();
    } catch (err) {
      setSubmitError("Failed to connect to API.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`/api/v1/products/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        loadData();
      } else {
        alert("Failed to delete product.");
      }
    } catch (err) {
      alert("Error connecting to API.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card border border-border p-5 rounded-2xl">
        <div>
          <h1 className="text-xl font-bold">Product Catalog</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your store items, barcodes, prices, and alerts.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setSubmitError(null);
            reset({
              name: "",
              sku: "",
              barcode: "",
              costPrice: 0,
              sellingPrice: 0,
              wholesalePrice: 0,
              alertQuantity: 5,
              initialStock: 10,
              mfgDate: "",
              expiryDate: "",
              image: "",
              categoryId: "",
            });
            setModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground hover:bg-primary/95 rounded-xl text-xs font-black shadow-lg shadow-primary/20 transition-all uppercase tracking-wider"
        >
          <Plus className="h-4.5 w-4.5" />
          Add Product
        </button>
      </div>

      {/* Main List Box */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products by SKU, name, or barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 w-full px-4 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            suppressHydrationWarning
          />
        </div>

        {/* Tabular list */}
        {isLoading ? (
          <div className="py-12 text-center text-xs text-muted-foreground">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground">No products found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-2">SKU / Barcode</th>
                  <th className="py-3 px-2">Name</th>
                  <th className="py-3 px-2">Category</th>
                  <th className="py-3 px-2 text-right">Cost Price</th>
                  <th className="py-3 px-2 text-right">Selling Price</th>
                  <th className="py-3 px-2 text-center">Alert Level</th>
                  <th className="py-3 px-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-secondary/10">
                    <td className="py-3 px-2">
                      <div className="font-semibold text-primary">{p.sku || "GENERIC"}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{p.barcode || "No Barcode"}</div>
                    </td>
                    <td className="py-3 px-2 font-bold text-foreground">{p.name}</td>
                    <td className="py-3 px-2">
                      <span className="bg-secondary px-2 py-0.5 rounded text-[10px]">
                        {p.category?.name || "Uncategorized"}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right font-medium">{currencySymbol}{p.costPrice.toFixed(2)}</td>
                    <td className="py-3 px-2 text-right font-bold text-primary">{currencySymbol}{p.sellingPrice.toFixed(2)}</td>
                    <td className="py-3 px-2 text-center">
                      <span className="bg-destructive/10 text-destructive border border-destructive/20 px-2 py-0.5 rounded font-semibold text-[10px]">
                        Min: {p.alertQuantity}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleEdit(p)}
                        className="text-muted-foreground hover:text-primary p-1 rounded transition-colors"
                        title="Edit Product"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Product Modal Overlay */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-lg space-y-4">
            <div>
              <h3 className="text-base font-bold">{editingId ? "Edit Product" : "Add New Product"}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {editingId ? "Modify product details." : "Register a new inventory item scoped to your business."}
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Product Image Upload with Base64 Preview */}
              <div className="space-y-1 bg-secondary/10 p-3 rounded-lg border border-border/60">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Product Image
                </label>
                <div className="flex items-center gap-4 mt-1.5">
                  {imageValue ? (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-border bg-muted flex items-center justify-center shrink-0">
                      <img src={imageValue} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={clearImage}
                        className="absolute inset-0 bg-black/60 text-white flex items-center justify-center text-[10px] font-bold opacity-0 hover:opacity-100 transition-opacity"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl border border-dashed border-border bg-muted/30 flex items-center justify-center shrink-0">
                      <Boxes className="h-6 w-6 text-muted-foreground/60" />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="product-image-upload"
                    />
                    <label
                      htmlFor="product-image-upload"
                      className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 border border-border hover:bg-secondary rounded-lg text-[11px] font-bold transition-colors bg-background text-foreground"
                    >
                      Choose Image File
                    </label>
                    <p className="text-[9px] text-muted-foreground mt-1">
                      PNG, JPG or WEBP. Image is serialized and saved to the database.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Product Name
                  </label>
                  <input
                    type="text"
                    placeholder="Premium Coffee Beans"
                    {...register("name")}
                    className={`w-full px-3 py-2 border rounded-lg text-xs bg-background focus:outline-none focus:ring-1 ${
                      errors.name ? "border-destructive focus:ring-destructive" : "border-border focus:ring-primary"
                    }`}
                  />
                  {errors.name && (
                    <span className="text-[10px] text-destructive font-semibold">{errors.name.message}</span>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Category
                  </label>
                  <select
                    {...register("categoryId")}
                    className="w-full px-3 py-2 border border-border rounded-lg text-xs bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    SKU Code
                  </label>
                  <input
                    type="text"
                    placeholder="BEA-COF-001"
                    {...register("sku")}
                    className="w-full px-3 py-2 border border-border rounded-lg text-xs bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Barcode UPC/EAN
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="880123456789"
                      {...register("barcode")}
                      className="flex-1 px-3 py-2 border border-border rounded-lg text-xs bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setScannerOpen(true)}
                      className="px-3 border border-border rounded-lg bg-secondary hover:bg-secondary/80 text-foreground flex items-center justify-center cursor-pointer transition-colors"
                      title="Scan Barcode with Camera"
                    >
                      <Camera className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Manufacturing & Expiry Dates */}
              {!editingId && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                      Manufacturing Date
                    </label>
                    <input
                      type="date"
                      {...register("mfgDate")}
                      className="w-full px-3 py-2 border border-border rounded-lg text-xs bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      {...register("expiryDate")}
                      className="w-full px-3 py-2 border border-border rounded-lg text-xs bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Cost Price ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register("costPrice", { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-xs bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Selling Price ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register("sellingPrice", { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-xs bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Alert Qty Limit
                  </label>
                  <input
                    type="number"
                    placeholder="5"
                    {...register("alertQuantity", { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-xs bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {!editingId && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Initial Stock Quantity (Branch)
                  </label>
                  <input
                    type="number"
                    placeholder="10"
                    {...register("initialStock", { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-xs bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              )}

              {submitError && (
                <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 p-2.5 rounded-lg font-semibold leading-tight">
                  {submitError}
                </div>
              )}

              <div className="flex justify-end gap-2 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-border text-xs rounded-lg hover:bg-secondary font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary text-primary-foreground text-xs font-black rounded-lg hover:bg-primary/90 shadow-lg shadow-primary/20"
                >
                  {editingId ? "Save Changes" : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <BarcodeScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={(code) => {
          setValue("barcode", code);
          setScannerOpen(false);
        }}
        title="Scan Product Barcode"
      />
    </div>
  );
}
