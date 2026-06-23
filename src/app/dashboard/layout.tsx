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
    >
      <SettingsProvider>
        {children}
      </SettingsProvider>
    </DashboardShellClient>
  );
}
