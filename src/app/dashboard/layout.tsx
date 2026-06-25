import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import DashboardShellClient from "@/components/dashboard-shell-client";
import { SettingsProvider } from "@/components/settings-provider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/auth/login");
  }

  const businessId = (session.user as any).businessId;
  const userRole = (session.user as any).role;
  const userBranchId = (session.user as any).branchId;
  const OWNER_ROLES = ["SUPER_ADMIN", "OWNER"];
  const isOwner = OWNER_ROLES.includes(userRole);

  // Fetch branches - owners see all, non-owners see only their assigned branch
  const branchWhere: any = {
    businessId,
    deletedAt: null,
  };
  
  if (!isOwner && userBranchId) {
    branchWhere.id = userBranchId;
  }

  const branches = await db.branch.findMany({
    where: branchWhere,
    select: {
      id: true,
      name: true,
      isMain: true,
    },
    orderBy: { name: "asc" },
  });

  // Calculate active branch ID for low stock lookup
  const activeBranchId = userBranchId || branches.find((b) => b.isMain)?.id || branches[0]?.id || null;

  // Retrieve products and filter by low stock threshold for the active branch
  const products = await db.product.findMany({
    where: {
      businessId,
      deletedAt: null,
    },
    include: {
      productStocks: activeBranchId ? {
        where: { branchId: activeBranchId },
      } : undefined,
      unit: { select: { name: true } },
    },
  });

  const lowStockAlerts = products
    .map((prod) => {
      const currentStock = prod.productStocks.reduce((sum, s) => sum + s.quantity, 0);
      return {
        id: prod.id,
        name: prod.name,
        currentStock,
        alertQuantity: prod.alertQuantity,
        unit: prod.unit?.name || "Pcs",
      };
    })
    .filter((prod) => prod.currentStock <= prod.alertQuantity);

  const lowStockNotifications = lowStockAlerts.map((alert) => ({
    id: `low-stock-${alert.id}`,
    title: "Low Stock Alert",
    message: `${alert.name} is down to ${alert.currentStock} ${alert.unit} (Min: ${alert.alertQuantity})`,
    type: "STOCK",
    isRead: false,
    createdAt: new Date(),
  }));

  // Fetch database unread notifications
  const dbNotifications = await db.notification.findMany({
    where: {
      businessId,
      isRead: false,
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const initialNotifications = [...lowStockNotifications, ...dbNotifications];

  // Fetch subscription details
  const subscription = await db.subscription.findUnique({
    where: { businessId },
    select: {
      plan: true,
      endDate: true,
      status: true,
    },
  });

  // Fetch current business settings (for custom overrides)
  const business = await db.business.findUnique({
    where: { id: businessId },
    select: { settings: true },
  });

  // Fetch platform settings (for global default plan configurations)
  const platform = await db.business.findUnique({
    where: { slug: "platform-admin" },
    select: { settings: true },
  });

  const settings = (business?.settings as any) || {};
  const platformSettings = (platform?.settings as any) || {};

  const currentPlanName = subscription?.plan || "FREE_TRIAL";

  // Normalizes plan IDs/names to resolve legacy aliases cleanly
  const normalizePlan = (name: string) => {
    const val = name.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (val.includes("trial") || val.includes("free") || val === "basic" || val === "starter") return "starter";
    if (val.includes("pro") || val.includes("professional")) return "professional";
    if (val.includes("enterprise") || val.includes("scaling")) return "enterprise";
    if (val.includes("business")) return "business";
    return val;
  };

  // Staged baseline features if the superadmin settings plans lack configured features
  const getDefaultFeatures = (planName: string) => {
    const p = normalizePlan(planName);
    
    if (p === "starter") {
      return {
        "POS Billing": true,
        "Products": true,
        "Customers": true,
        "Reports": true,
        "Inventory": false,
        "Purchases": false,
        "Suppliers": false,
        "Expenses": false,
        "Payments": false,
        "Multi Branch": false,
        "Warehouses": false,
        "Device Control": false,
        "Activity Logs": false,
        "Barcode": false,
        "Batch Tracking": false,
        "Expiry Tracking": false,
        "API Access": false,
        "Backup System": false,
      };
    }
    
    if (p === "business") {
      return {
        "POS Billing": true,
        "Products": true,
        "Inventory": true,
        "Purchases": true,
        "Customers": true,
        "Suppliers": true,
        "Reports": true,
        "Expenses": true,
        "Payments": true,
        "Multi Branch": false,
        "Warehouses": false,
        "Device Control": false,
        "Activity Logs": true,
        "Barcode": true,
        "Batch Tracking": false,
        "Expiry Tracking": false,
        "API Access": false,
        "Backup System": false,
      };
    }

    if (p === "professional") {
      return {
        "POS Billing": true,
        "Products": true,
        "Inventory": true,
        "Purchases": true,
        "Customers": true,
        "Suppliers": true,
        "Reports": true,
        "Expenses": true,
        "Payments": true,
        "Multi Branch": true,
        "Warehouses": true,
        "Device Control": true,
        "Activity Logs": true,
        "Barcode": true,
        "Batch Tracking": true,
        "Expiry Tracking": true,
        "API Access": false,
        "Backup System": true,
      };
    }

    // Enterprise / default fallback
    return {
      "POS Billing": true,
      "Products": true,
      "Inventory": true,
      "Purchases": true,
      "Customers": true,
      "Suppliers": true,
      "Reports": true,
      "Expenses": true,
      "Payments": true,
      "Multi Branch": true,
      "Warehouses": true,
      "Device Control": true,
      "Activity Logs": true,
      "Barcode": true,
      "Batch Tracking": true,
      "Expiry Tracking": true,
      "API Access": true,
      "Backup System": true,
    };
  };

  // 1. Get baseline features of this business's plan
  const plans = platformSettings.plans || [];
  const matchingPlan = plans.find((p: any) => {
    const pId = normalizePlan(p.id || "");
    const pName = normalizePlan(p.name || "");
    const sPlan = normalizePlan(currentPlanName);
    return pId === sPlan || pName === sPlan;
  });

  const baseFeatures = (matchingPlan?.features && Object.keys(matchingPlan.features).length > 0)
    ? matchingPlan.features
    : getDefaultFeatures(currentPlanName);

  // 2. Merge with custom overrides
  const customFeatures = settings.customFeatures || {};
  const mergedFeatures = {
    ...baseFeatures,
    ...customFeatures,
  };

  return (
    <DashboardShellClient
      user={{
        name: session.user.name || "User",
        email: session.user.email || "",
        role: (session.user as any).role,
        branchId: (session.user as any).branchId,
      }}
      branches={branches}
      initialNotifications={initialNotifications}
      subscription={subscription}
      features={mergedFeatures}
    >
      <SettingsProvider>
        {children}
      </SettingsProvider>
    </DashboardShellClient>
  );
}
