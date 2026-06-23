"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Search, Plus, Trash2, Tag, Percent, Barcode, Boxes, Edit, Camera } from "lucide-react";
import { useSettings } from "@/components/settings-provider";
import dynamic from "next/dynamic";
import { createPortal } from "react-dom";

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
  const [selectedCategory, setSelectedCategory] = React.useState<string>("");
  const [onlyLowStock, setOnlyLowStock] = React.useState<boolean>(false);
  
  const { currencySymbol } = useSettings();
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [scannerOpen, setScannerOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

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
      let url = `/api/v1/products?limit=100&search=${search}`;
      if (selectedCategory && selectedCategory !== "all") {
        url += `&categoryId=${selectedCategory}`;
      }
      if (onlyLowStock) {
        url += `&lowStock=true`;
      }

      const [prodRes, catRes] = await Promise.all([
        fetch(url),
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
  }, [search, selectedCategory, onlyLowStock]);

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
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground hover:bg-primary/95 rounded-xl text-xs font-black shadow-lg shadow-primary/20 transition-all uppercase tracking-wider cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5" />
          Add Product
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Main List Box */}
        <div className={`bg-card border border-border rounded-2xl p-5 space-y-4 w-full order-2 lg:order-1 transition-all duration-300 ${
          modalOpen ? "lg:w-2/3" : "lg:w-full"
        }`}>
        {/* Search & Filter Controls */}
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
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

          {/* Category Filter */}
          <div className="w-full md:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg text-xs bg-background focus:outline-none focus:ring-1 focus:ring-primary h-[38px] font-semibold cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Low Stock Toggle */}
          <button
            onClick={() => setOnlyLowStock(!onlyLowStock)}
            className={`px-4 py-2 border rounded-lg text-xs font-bold transition-all h-[38px] flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
              onlyLowStock 
                ? "bg-destructive/10 text-destructive border-destructive/30" 
                : "border-border hover:bg-secondary text-muted-foreground"
            }`}
          >
            <Boxes className="h-4 w-4" />
            <span>Low Stock Alert</span>
          </button>
        </div>

        {/* Tabular list */}
        {isLoading ? (
          <div className="py-12 text-center text-xs text-muted-foreground">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground">No products found.</div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
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
                          className="text-muted-foreground hover:text-primary p-1 rounded transition-colors cursor-pointer"
                          title="Edit Product"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors cursor-pointer"
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

            {/* Mobile Cards View */}
            <div className="block md:hidden space-y-3">
              {products.map((p) => (
                <div key={p.id} className="bg-card border border-border/80 rounded-xl p-4 space-y-3 shadow-xs">
                  <div className="flex justify-between items-start">
                    <div className="min-w-0 flex-1 pr-2">
                      <h4 className="font-bold text-sm text-foreground truncate">{p.name}</h4>
                      <span className="bg-secondary px-2 py-0.5 rounded text-[10px] inline-block mt-1">
                        {p.category?.name || "Uncategorized"}
                      </span>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-semibold text-primary">{p.sku || "GENERIC"}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{p.barcode || "No Barcode"}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 border-y border-border/50 py-2 text-[11px]">
                    <div>
                      <span className="text-muted-foreground block text-[9px] uppercase font-semibold">Cost Price</span>
                      <span className="font-bold">{currencySymbol}{p.costPrice.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[9px] uppercase font-semibold">Selling Price</span>
                      <span className="font-black text-primary">{currencySymbol}{p.sellingPrice.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[9px] uppercase font-semibold">Alert Level</span>
                      <span className="bg-destructive/10 text-destructive border border-destructive/20 px-1.5 py-0.5 rounded font-bold text-[9px] inline-block">
                        Min: {p.alertQuantity}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={() => handleEdit(p)}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-border hover:bg-secondary rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-destructive/20 hover:bg-destructive/10 text-destructive rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        </div>

        {/* Inline Form Panel for Add/Edit Product */}
        {modalOpen && (
          <div className="w-full lg:w-1/3 bg-card border border-border rounded-2xl p-6 space-y-6 shadow-sm flex-shrink-0 order-1 lg:order-2 animate-in fade-in slide-in-from-top lg:slide-in-from-right-5 duration-200">
            <div className="flex justify-between items-start pb-3 border-b border-border/60">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  {editingId ? "Edit Product" : "Add New Product"}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {editingId ? "Modify product details." : "Register a new inventory item scoped to your business."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1.5 hover:bg-secondary rounded-lg cursor-pointer"
              >
                <Plus className="h-5 w-5 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 flex-1 mt-2">
              {/* SECTION 1: Basic Info */}
              <div className="space-y-4 bg-secondary/5 border border-border/40 p-4 rounded-2xl">
                <span className="text-[10px] font-black text-[#2563EB] uppercase tracking-wider block">
                  Primary Details
                </span>

                {/* Product Image Upload with Base64 Preview */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block mb-1">
                    Product Image
                  </label>
                  <div className="flex items-center gap-4 mt-1">
                    {imageValue ? (
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-border bg-muted flex items-center justify-center shrink-0 shadow-xs">
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
                      <div className="w-16 h-16 rounded-xl border border-dashed border-border/80 bg-muted/20 flex items-center justify-center shrink-0">
                        <Boxes className="h-6 w-6 text-muted-foreground/40" />
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
                        className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 border border-border hover:bg-secondary rounded-xl text-[11px] font-bold transition-colors bg-background text-foreground"
                      >
                        Choose Image File
                      </label>
                      <p className="text-[9px] text-muted-foreground mt-1 leading-normal">
                        PNG, JPG or WEBP. Image will be saved to the database.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block mb-1">
                    Product Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Premium Coffee Beans"
                    {...register("name")}
                    className={`w-full h-10 px-3.5 border rounded-xl text-xs bg-background focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all ${
                      errors.name ? "border-destructive focus:ring-destructive" : "border-border/80 focus:border-primary"
                    }`}
                  />
                  {errors.name && (
                    <span className="text-[10px] text-destructive font-semibold">{errors.name.message}</span>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block mb-1">
                    Category
                  </label>
                  <select
                    {...register("categoryId")}
                    className="w-full h-10 px-3.5 border border-border/80 rounded-xl text-xs bg-background focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer"
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

              {/* SECTION 2: Inventory Codes & Tracking */}
              <div className="space-y-4 bg-secondary/5 border border-border/40 p-4 rounded-2xl">
                <span className="text-[10px] font-black text-[#2563EB] uppercase tracking-wider block">
                  Codes & Tracking
                </span>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block mb-1">
                    SKU Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BEA-COF-001"
                    {...register("sku")}
                    className="w-full h-10 px-3.5 border border-border/80 rounded-xl text-xs bg-background focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block mb-1">
                    Barcode UPC/EAN
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. 880123456789"
                      {...register("barcode")}
                      className="flex-1 h-10 px-3.5 border border-border/80 rounded-xl text-xs bg-background focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setScannerOpen(true)}
                      className="px-3.5 h-10 border border-border/80 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground flex items-center justify-center cursor-pointer transition-all shadow-xs"
                      title="Scan Barcode with Camera"
                    >
                      <Camera className="h-4.5 w-4.5 text-muted-foreground hover:text-foreground" />
                    </button>
                  </div>
                </div>

                {/* Manufacturing & Expiry Dates */}
                {!editingId && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block mb-1">
                        Mfg Date
                      </label>
                      <input
                        type="date"
                        {...register("mfgDate")}
                        className="w-full h-10 px-3 border border-border/80 rounded-xl text-xs bg-background focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="date"
                        {...register("expiryDate")}
                        className="w-full h-10 px-3 border border-border/80 rounded-xl text-xs bg-background focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 3: Pricing & Stock Levels */}
              <div className="space-y-4 bg-secondary/5 border border-border/40 p-4 rounded-2xl">
                <span className="text-[10px] font-black text-[#2563EB] uppercase tracking-wider block">
                  Pricing & Stock
                </span>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block mb-1">
                      Cost ({currencySymbol})
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...register("costPrice", { valueAsNumber: true })}
                      className="w-full h-10 px-2.5 border border-border/80 rounded-xl text-xs bg-background focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block mb-1">
                      Selling ({currencySymbol})
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...register("sellingPrice", { valueAsNumber: true })}
                      className="w-full h-10 px-2.5 border border-border/80 rounded-xl text-xs bg-background focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block mb-1">
                      Alert Qty
                    </label>
                    <input
                      type="number"
                      placeholder="5"
                      {...register("alertQuantity", { valueAsNumber: true })}
                      className="w-full h-10 px-2.5 border border-border/80 rounded-xl text-xs bg-background focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                    />
                  </div>
                </div>

                {!editingId && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block mb-1">
                      Initial Stock (Branch)
                    </label>
                    <input
                      type="number"
                      placeholder="10"
                      {...register("initialStock", { valueAsNumber: true })}
                      className="w-full h-10 px-3.5 border border-border/80 rounded-xl text-xs bg-background focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                    />
                  </div>
                )}
              </div>

              {submitError && (
                <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 p-3 rounded-xl font-semibold leading-tight animate-in fade-in duration-200">
                  {submitError}
                </div>
              )}

              <div className="flex justify-end gap-2 border-t border-border/60 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="h-10 px-5 border border-border text-xs font-semibold rounded-xl hover:bg-secondary transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-6 bg-primary text-primary-foreground text-xs font-black rounded-xl hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all cursor-pointer"
                >
                  {editingId ? "Save Changes" : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
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
