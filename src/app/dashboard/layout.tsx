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

  // Fetch unread notifications count
  const unreadNotifications = await db.notification.findMany({
    where: {
      businessId,
      isRead: false,
    },
    orderBy: { createdAt: "desc" },
    take: 5,
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
      initialNotifications={unreadNotifications}
    >
      <SettingsProvider>
        {children}
      </SettingsProvider>
    </DashboardShellClient>
  );
}
