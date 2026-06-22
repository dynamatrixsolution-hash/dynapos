"use client";

import * as React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useSettings } from "@/components/settings-provider";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Search, Plus, Trash2, Calendar, FileText, Truck, ArrowDownCircle } from "lucide-react";
import { useSession } from "next-auth/react";

interface PurchaseItem {
  id: string;
  purchaseNumber: string;
  total: number;
  paidAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  supplier: { name: string };
  user: { name: string };
}

interface SupplierItem {
  id: string;
  name: string;
}

interface ProductItem {
  id: string;
  name: string;
  sku: string;
  costPrice: number;
}

const purchaseItemFormSchema = z.object({
  productId: z.string().uuid("Invalid product selected"),
  batchNumber: z.string().optional(),
  quantity: z.number().positive("Quantity must be positive"),
  price: z.number().nonnegative("Price cannot be negative"),
});

const purchaseFormSchema = z.object({
  supplierId: z.string().uuid("Invalid supplier selected"),
  items: z.array(purchaseItemFormSchema).min(1, "Specify at least one product"),
  discount: z.number().nonnegative(),
  tax: z.number().nonnegative(),
  paidAmount: z.number().nonnegative(),
  paymentMethod: z.enum(["CASH", "CARD", "QR", "BANK_TRANSFER", "CREDIT"]),
});

type PurchaseInputs = z.infer<typeof purchaseFormSchema>;

export default function PurchasesPage() {
  const { data: session } = useSession();
  const { currencySymbol } = useSettings();
  const branchId = session?.user ? (session.user as any).branchId : null;

  const [purchases, setPurchases] = React.useState<PurchaseItem[]>([]);
  const [suppliers, setSuppliers] = React.useState<SupplierItem[]>([]);
  const [products, setProducts] = React.useState<ProductItem[]>([]);
  
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [modalOpen, setModalOpen] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PurchaseInputs>({
    resolver: zodResolver(purchaseFormSchema),
    defaultValues: {
      discount: 0,
      tax: 0,
      paidAmount: 0,
      items: [{ productId: "", quantity: 1, price: 0, batchNumber: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const items = watch("items");
  const discount = watch("discount") || 0;
  const tax = watch("tax") || 0;

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.quantity || 0) * (item.price || 0), 0);
  const total = Math.max(0, subtotal + tax - discount);

  const loadData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const [purRes, supRes, prodRes] = await Promise.all([
        fetch(`/api/v1/purchases?limit=50&search=${search}`),
        fetch("/api/v1/suppliers"),
        fetch("/api/v1/products?limit=100"),
      ]);
      
      if (purRes.ok) {
        const data = await purRes.json();
        setPurchases(data.purchases || []);
      }
      if (supRes.ok) {
        const data = await supRes.json();
        setSuppliers(data.suppliers || []);
      }
      if (prodRes.ok) {
        const data = await prodRes.json();
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error("Failed to fetch purchases data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const onProductChange = (index: number, productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (prod) {
      setValue(`items.${index}.price`, prod.costPrice);
    }
  };

  const onSubmit = async (data: PurchaseInputs) => {
    if (!branchId) {
      setSubmitError("No branch context selected.");
      return;
    }

    setSubmitError(null);
    const payload = {
      ...data,
      branchId,
      subtotal,
      total,
      paymentStatus: data.paymentMethod === "CREDIT" ? "UNPAID" : data.paidAmount >= total ? "PAID" : "PARTIAL",
    };

    try {
      const res = await fetch("/api/v1/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const json = await res.json();
        setSubmitError(json.error || "Failed to save purchase");
        return;
      }

      setModalOpen(false);
      reset();
      loadData();
    } catch (err) {
      setSubmitError("Connection failure.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between bg-card border border-border p-5 rounded-2xl">
        <div>
          <h1 className="text-xl font-bold">Inbound Purchase Orders</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Log restocks, record supplier invoices, and update cost prices.
          </p>
        </div>
        <button
          onClick={() => {
            setModalOpen(true);
            setSubmitError(null);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground hover:bg-primary/95 rounded-xl text-xs font-black shadow-lg shadow-primary/20 transition-all uppercase tracking-wider"
        >
          <Plus className="h-4.5 w-4.5" />
          Record Purchase
        </button>
      </div>

      {/* Main List */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search purchases by reference PO number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 w-full px-4 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-xs text-muted-foreground">Loading purchases list...</div>
        ) : purchases.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground">No purchases recorded.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-2">Purchase Order #</th>
                  <th className="py-3 px-2">Date / Time</th>
                  <th className="py-3 px-2">Supplier</th>
                  <th className="py-3 px-2 text-right">Total Amount</th>
                  <th className="py-3 px-2 text-right">Paid Amount</th>
                  <th className="py-3 px-2 text-center">Payment Status</th>
                  <th className="py-3 px-2">Recorded By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {purchases.map((p) => (
                  <tr key={p.id} className="hover:bg-secondary/10">
                    <td className="py-3 px-2 font-bold text-amber-500">{p.purchaseNumber}</td>
                    <td className="py-3 px-2 text-muted-foreground">
                      {new Date(p.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-2 font-semibold text-foreground">{p.supplier.name}</td>
                    <td className="py-3 px-2 text-right font-bold text-foreground">
                      {currencySymbol}{p.total.toFixed(2)}
                    </td>
                    <td className="py-3 px-2 text-right font-medium text-primary">
                      {currencySymbol}{p.paidAmount.toFixed(2)}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className={`px-2 py-0.5 rounded font-semibold text-[9px] border ${
                        p.paymentStatus === "PAID"
                          ? "bg-primary/10 text-primary border-primary/20"
                          : p.paymentStatus === "PARTIAL"
                          ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                          : "bg-destructive/10 text-destructive border-destructive/20"
                      }`}>
                        {p.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-muted-foreground">{p.user.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Purchase Modal Overlay */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-2xl space-y-4 my-8">
            <div>
              <h3 className="text-base font-bold">Record Inbound Purchase Bill</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Register supplier acquisitions to increment branch stocks and adjust ledger balances.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Supplier / Vendor
                  </label>
                  <select
                    {...register("supplierId")}
                    className="w-full px-3 py-2 border border-border rounded-lg text-xs bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Select Vendor</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  {errors.supplierId && (
                    <span className="text-[10px] text-destructive font-semibold">{errors.supplierId.message}</span>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Payment Method
                  </label>
                  <select
                    {...register("paymentMethod")}
                    className="w-full px-3 py-2 border border-border rounded-lg text-xs bg-background focus:outline-none"
                  >
                    <option value="CASH">CASH</option>
                    <option value="CARD">CARD</option>
                    <option value="QR">QR CODE</option>
                    <option value="BANK_TRANSFER">BANK TRANSFER</option>
                    <option value="CREDIT">ON CREDIT (VEND BALANCE)</option>
                  </select>
                </div>
              </div>

              {/* Items Table fields */}
              <div className="space-y-2 border-t border-border pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-foreground">Purchase Items Basket</span>
                  <button
                    type="button"
                    onClick={() => append({ productId: "", quantity: 1, price: 0, batchNumber: "" })}
                    className="flex items-center gap-1 text-[11px] text-primary hover:underline font-bold"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Row
                  </button>
                </div>

                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-2 items-start bg-secondary/30 p-2.5 rounded-lg border border-border/50">
                      <div className="flex-1 space-y-1">
                        <select
                          {...register(`items.${index}.productId` as const)}
                          onChange={(e) => onProductChange(index, e.target.value)}
                          className="w-full px-2 py-1.5 border border-border rounded bg-background text-[11px] focus:outline-none"
                        >
                          <option value="">Select Product</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.sku})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="w-20">
                        <input
                          type="number"
                          placeholder="Qty"
                          {...register(`items.${index}.quantity` as const, { valueAsNumber: true })}
                          className="w-full px-2 py-1.5 border border-border rounded text-[11px] bg-background text-center"
                        />
                      </div>

                      <div className="w-24">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Cost"
                          {...register(`items.${index}.price` as const, { valueAsNumber: true })}
                          className="w-full px-2 py-1.5 border border-border rounded text-[11px] bg-background text-right"
                        />
                      </div>

                      <div className="w-28">
                        <input
                          type="text"
                          placeholder="Batch (optional)"
                          {...register(`items.${index}.batchNumber` as const)}
                          className="w-full px-2 py-1.5 border border-border rounded text-[11px] bg-background text-center"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-muted-foreground hover:text-destructive p-1 rounded mt-0.5"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total calculations */}
              <div className="border-t border-border pt-4 flex flex-col items-end gap-2.5 text-xs">
                <div className="flex justify-between w-64">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-semibold">{currencySymbol}{subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between w-64 items-center">
                  <span className="text-muted-foreground">Bill Discount ({currencySymbol}):</span>
                  <input
                    type="number"
                    {...register("discount", { valueAsNumber: true })}
                    className="w-24 px-2 py-1 border border-border rounded text-right bg-background text-xs"
                  />
                </div>

                <div className="flex justify-between w-64 items-center">
                  <span className="text-muted-foreground">Tax / VAT ({currencySymbol}):</span>
                  <input
                    type="number"
                    {...register("tax", { valueAsNumber: true })}
                    className="w-24 px-2 py-1 border border-border rounded text-right bg-background text-xs"
                  />
                </div>

                <div className="flex justify-between w-64 font-extrabold text-sm border-t border-border/50 pt-2 mt-1">
                  <span>Grand Total:</span>
                  <span className="text-primary">{currencySymbol}{total.toFixed(2)}</span>
                </div>

                <div className="flex justify-between w-64 items-center mt-2 bg-secondary/20 p-2 rounded border border-border/40">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Amount Paid ({currencySymbol}):</span>
                  <input
                    type="number"
                    step="0.01"
                    {...register("paidAmount", { valueAsNumber: true })}
                    className="w-24 px-2 py-1 border border-border rounded text-right bg-background text-xs font-bold text-primary"
                  />
                </div>
              </div>

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
                  Save Inbound PO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
