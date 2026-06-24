"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  Building, 
  Users, 
  Layers, 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  Shield, 
  Lock,
  Globe,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Coins
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface BusinessItem {
  id: string;
  name: string;
  slug: string;
  currency: string;
  createdAt: string;
  subscription?: {
    plan: string;
    status: string;
    endDate: string;
  } | null;
  users?: {
    name: string;
    email: string;
    phone: string | null;
  }[];
  _count?: {
    branches: number;
    users: number;
  };
}

const businessSchema = z.object({
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters").regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  currency: z.string().default("USD"),
  ownerName: z.string().min(2, "Owner name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional().nullable(),
  plan: z.enum(["FREE_TRIAL", "BASIC", "PREMIUM", "ENTERPRISE"]).default("FREE_TRIAL"),
  durationMonths: z.coerce.number().min(1, "Duration must be at least 1 month").max(60).default(12),
});

type BusinessFormInputs = z.infer<typeof businessSchema>;

export default function SuperAdminBusinessesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [businesses, setBusinesses] = useState<BusinessItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm<BusinessFormInputs>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      currency: "USD",
      plan: "FREE_TRIAL",
      durationMonths: 12,
    }
  });

  const businessNameValue = watch("businessName");

  // Auto-generate slug from business name
  useEffect(() => {
    if (businessNameValue) {
      const generatedSlug = businessNameValue
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "") // remove special characters
        .trim()
        .replace(/\s+/g, "-") // replace spaces with hyphens
        .replace(/-+/g, "-"); // merge multiple hyphens
      setValue("slug", generatedSlug, { shouldValidate: true });
    }
  }, [businessNameValue, setValue]);

  const fetchBusinesses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/super-admin/businesses");
      if (res.ok) {
        const data = await res.json();
        setBusinesses(data.businesses || []);
      }
    } catch (err) {
      console.error("Fetch businesses error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (session?.user && (session.user as any).role !== "SUPER_ADMIN") {
      router.push("/dashboard");
    } else if (status === "authenticated") {
      fetchBusinesses();
    }
  }, [status, session, router, fetchBusinesses]);

  const onSubmit = async (data: BusinessFormInputs) => {
    setSubmitError("");
    setSubmitSuccess("");
    try {
      const res = await fetch("/api/v1/super-admin/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Failed to provision business");
      }

      setSubmitSuccess(`Business "${data.businessName}" created successfully!`);
      setTimeout(() => {
        setIsModalOpen(false);
        setSubmitSuccess("");
        reset();
        fetchBusinesses();
      }, 2000);
    } catch (err: any) {
      setSubmitError(err.message);
    }
  };

  const filteredBusinesses = businesses.filter(b => 
    b.name.toLowerCase().includes(search.toLowerCase()) || 
    b.slug.toLowerCase().includes(search.toLowerCase()) ||
    (b.users?.[0]?.email || "").toLowerCase().includes(search.toLowerCase())
  );

  // Compute metrics
  const totalBusinesses = businesses.length;
  const activeSubscriptions = businesses.filter(b => b.subscription?.status === "ACTIVE").length;
  const totalBranches = businesses.reduce((sum, b) => sum + (b._count?.branches || 0), 0);
  const totalUsers = businesses.reduce((sum, b) => sum + (b._count?.users || 0), 0);

  if (status === "loading" || loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-xs text-muted-foreground">Loading platform directory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card border border-border p-6 rounded-2xl">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Shield className="h-5.5 w-5.5 text-primary" /> Platform Administration
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage multi-tenant SaaS business tenants, subscription status, and credentials.
          </p>
        </div>
        <button
          onClick={() => {
            reset();
            setSubmitError("");
            setSubmitSuccess("");
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white hover:bg-primary/90 rounded-xl text-xs font-bold transition-all shadow-md uppercase tracking-wider"
        >
          <Plus className="h-4 w-4" /> Provision Business
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border p-5 rounded-2xl flex items-center gap-4">
          <div className="h-10 w-10 bg-primary/10 text-primary flex items-center justify-center rounded-xl">
            <Building className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Total Businesses</p>
            <h3 className="text-xl font-black mt-0.5">{totalBusinesses}</h3>
          </div>
        </div>

        <div className="bg-card border border-border p-5 rounded-2xl flex items-center gap-4">
          <div className="h-10 w-10 bg-emerald-500/10 text-emerald-500 flex items-center justify-center rounded-xl">
            <Coins className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Active Subscriptions</p>
            <h3 className="text-xl font-black mt-0.5">{activeSubscriptions}</h3>
          </div>
        </div>

        <div className="bg-card border border-border p-5 rounded-2xl flex items-center gap-4">
          <div className="h-10 w-10 bg-blue-500/10 text-blue-500 flex items-center justify-center rounded-xl">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Total Branches</p>
            <h3 className="text-xl font-black mt-0.5">{totalBranches}</h3>
          </div>
        </div>

        <div className="bg-card border border-border p-5 rounded-2xl flex items-center gap-4">
          <div className="h-10 w-10 bg-purple-500/10 text-purple-500 flex items-center justify-center rounded-xl">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Total Users</p>
            <h3 className="text-xl font-black mt-0.5">{totalUsers}</h3>
          </div>
        </div>
      </div>

      {/* Registry Search */}
      <div className="bg-card border border-border p-5 rounded-2xl flex flex-col sm:flex-row justify-between gap-4 items-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, slug, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 w-full px-4 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Business Directory Table */}
      <div className="bg-card border border-border rounded-2xl p-5">
        {filteredBusinesses.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground">No tenant businesses found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-2">Business Details</th>
                  <th className="py-3 px-2">Owner Credentials</th>
                  <th className="py-3 px-2 text-center">Subscription</th>
                  <th className="py-3 px-2 text-center">Plan Limits</th>
                  <th className="py-3 px-2 text-right">Provisioned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredBusinesses.map((b) => {
                  const owner = b.users?.[0];
                  return (
                    <tr key={b.id} className="hover:bg-secondary/10">
                      <td className="py-4 px-2">
                        <div className="font-bold text-foreground text-sm">{b.name}</div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="flex items-center gap-1 text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-md">
                            <Globe className="w-3 h-3" /> slug: {b.slug}
                          </span>
                          <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-md uppercase font-bold">
                            {b.currency}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        {owner ? (
                          <>
                            <div className="font-bold text-foreground">{owner.name}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                <Mail className="w-3 h-3" /> {owner.email}
                              </span>
                              {owner.phone && (
                                <span className="flex items-center gap-1 text-[10px] text-muted-foreground border-l border-border pl-2">
                                  <Phone className="w-3 h-3" /> {owner.phone}
                                </span>
                              )}
                            </div>
                          </>
                        ) : (
                          <span className="text-destructive font-semibold italic">No Owner Registered</span>
                        )}
                      </td>
                      <td className="py-4 px-2 text-center">
                        {b.subscription ? (
                          <div className="inline-block">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${
                              b.subscription.status === "ACTIVE" 
                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                                : "bg-destructive/10 text-destructive border-destructive/20"
                            }`}>
                              {b.subscription.plan} ({b.subscription.status})
                            </span>
                            <div className="text-[9px] text-muted-foreground mt-1 font-medium">
                              Expires: {new Date(b.subscription.endDate).toLocaleDateString()}
                            </div>
                          </div>
                        ) : (
                          <span className="text-destructive font-semibold italic">No Active Subscription</span>
                        )}
                      </td>
                      <td className="py-4 px-2 text-center">
                        <div className="flex items-center justify-center gap-2 text-muted-foreground font-semibold text-[10px]">
                          <span>Branches: <strong>{b._count?.branches || 0}</strong></span>
                          <span className="border-l border-border pl-2">Users: <strong>{b._count?.users || 0}</strong></span>
                        </div>
                      </td>
                      <td className="py-4 px-2 text-right text-muted-foreground text-[10px] font-semibold">
                        <div className="flex items-center justify-end gap-1">
                          <Calendar className="h-3.5 w-3.5 opacity-60" />
                          {new Date(b.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Provision Business Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-card rounded-2xl w-full max-w-xl p-6 shadow-2xl border border-border my-8">
            <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" /> Provision New Business Tenant
            </h3>
            <p className="text-xs text-muted-foreground mb-6">
              Create a new tenant workspace and generate its system owner account credentials.
            </p>

            {submitError && (
              <div className="p-3 mb-4 text-xs bg-destructive/10 text-destructive rounded-lg font-bold border border-destructive/20 flex items-center gap-2">
                <AlertTriangle className="h-4.5 w-4.5 flex-shrink-0" /> {submitError}
              </div>
            )}

            {submitSuccess && (
              <div className="p-3 mb-4 text-xs bg-emerald-500/10 text-emerald-500 rounded-lg font-bold border border-emerald-500/20 flex items-center gap-2 animate-bounce">
                <CheckCircle className="h-4.5 w-4.5 flex-shrink-0" /> {submitSuccess}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Business Block */}
              <div className="bg-secondary/20 p-4 rounded-xl space-y-3 border border-border/50">
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider border-b border-border pb-1">1. Business Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Business Name</label>
                    <input
                      type="text"
                      {...register("businessName")}
                      placeholder="e.g. Acme Retail"
                      className={`w-full px-3 py-2 bg-background border rounded-lg text-xs focus:outline-none focus:ring-1 ${errors.businessName ? 'border-destructive focus:ring-destructive' : 'border-border focus:ring-primary'}`}
                    />
                    {errors.businessName && <span className="text-[9px] text-destructive">{errors.businessName.message}</span>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Subdomain Slug</label>
                    <input
                      type="text"
                      {...register("slug")}
                      placeholder="acme-retail"
                      className={`w-full px-3 py-2 bg-background border rounded-lg text-xs focus:outline-none focus:ring-1 ${errors.slug ? 'border-destructive focus:ring-destructive' : 'border-border focus:ring-primary'}`}
                    />
                    {errors.slug && <span className="text-[9px] text-destructive">{errors.slug.message}</span>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Currency</label>
                    <select
                      {...register("currency")}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="INR">INR (₹)</option>
                      <option value="NPR">NPR (Rs.)</option>
                      <option value="AUD">AUD ($)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Owner Account Block */}
              <div className="bg-secondary/20 p-4 rounded-xl space-y-3 border border-border/50">
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider border-b border-border pb-1">2. Owner Account Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Owner Name</label>
                    <input
                      type="text"
                      {...register("ownerName")}
                      placeholder="Alex Mercer"
                      className={`w-full px-3 py-2 bg-background border rounded-lg text-xs focus:outline-none focus:ring-1 ${errors.ownerName ? 'border-destructive focus:ring-destructive' : 'border-border focus:ring-primary'}`}
                    />
                    {errors.ownerName && <span className="text-[9px] text-destructive">{errors.ownerName.message}</span>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Email Address</label>
                    <input
                      type="email"
                      {...register("email")}
                      placeholder="owner@business.com"
                      className={`w-full px-3 py-2 bg-background border rounded-lg text-xs focus:outline-none focus:ring-1 ${errors.email ? 'border-destructive focus:ring-destructive' : 'border-border focus:ring-primary'}`}
                    />
                    {errors.email && <span className="text-[9px] text-destructive">{errors.email.message}</span>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                      <input
                        type="password"
                        {...register("password")}
                        placeholder="••••••••"
                        className={`w-full pl-8 pr-3 py-2 bg-background border rounded-lg text-xs focus:outline-none focus:ring-1 ${errors.password ? 'border-destructive focus:ring-destructive' : 'border-border focus:ring-primary'}`}
                      />
                    </div>
                    {errors.password && <span className="text-[9px] text-destructive">{errors.password.message}</span>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Phone (Optional)</label>
                    <input
                      type="text"
                      {...register("phone")}
                      placeholder="+1 (555) 012-3456"
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Subscription Setup Block */}
              <div className="bg-secondary/20 p-4 rounded-xl space-y-3 border border-border/50">
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider border-b border-border pb-1">3. Subscription Setup</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Subscription Plan</label>
                    <select
                      {...register("plan")}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="FREE_TRIAL">FREE TRIAL (5 Users, 1 Branch)</option>
                      <option value="BASIC">BASIC (10 Users, 2 Branches)</option>
                      <option value="PREMIUM">PREMIUM (25 Users, 5 Branches)</option>
                      <option value="ENTERPRISE">ENTERPRISE (100 Users, 20 Branches)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Duration (Months)</label>
                    <input
                      type="number"
                      {...register("durationMonths")}
                      className={`w-full px-3 py-2 bg-background border rounded-lg text-xs focus:outline-none focus:ring-1 ${errors.durationMonths ? 'border-destructive focus:ring-destructive' : 'border-border focus:ring-primary'}`}
                    />
                    {errors.durationMonths && <span className="text-[9px] text-destructive">{errors.durationMonths.message}</span>}
                  </div>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex gap-3 pt-4 border-t border-border/50">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-border rounded-lg text-xs font-semibold hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold shadow-md hover:bg-primary/95 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "Provisioning..." : "Provision Tenant Business"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
