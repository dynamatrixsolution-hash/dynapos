import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Layers,
  Store,
  Users,
  Truck,
  CreditCard,
  BarChart3,
  Receipt,
  Settings,
  Shield,
  Laptop,
  Activity,
  GitBranch,
  RefreshCcw,
  ClipboardList,
  AlertTriangle,
  History,
  TrendingUp,
  Boxes,
  PieChart,
} from "lucide-react";

export type Role = "SUPER_ADMIN" | "OWNER" | "MANAGER" | "CASHIER";

export interface NavItem {
  title: string;
  href?: string;
  icon: React.ElementType;
  roles: Role[];
  children?: NavItem[];
}

/**
 * Navigation Configuration with Role-Based Access
 * 
 * CASHIER: POS Billing, Products, Sales History, Inventory, Customers
 * MANAGER: All services (limited to assigned warehouse)
 * OWNER: All services + Branch management + User management
 * SUPER_ADMIN: Dashboard, Branches view, Users/Employees view, Reports view only
 */
export const navigationConfig: NavItem[] = [
  // Dashboard - Available to Manager, Owner, Super Admin
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["SUPER_ADMIN", "OWNER", "MANAGER"],
  },

  // POS Billing - Available to Cashier, Manager, Owner
  {
    title: "POS Billing",
    href: "/dashboard/pos",
    icon: ShoppingCart,
    roles: ["OWNER", "MANAGER", "CASHIER"],
  },

  // Products - Cashier, Manager, Owner (Cashier has view-only access)
  {
    title: "Products",
    href: "/dashboard/products",
    icon: Package,
    roles: ["OWNER", "MANAGER", "CASHIER"],
  },

  // Category & Unit - Manager and above
  {
    title: "Category & Unit",
    href: "/dashboard/categories",
    icon: Layers,
    roles: ["OWNER", "MANAGER"],
  },

  // Purchase - Manager and above
  {
    title: "Purchase",
    href: "/dashboard/purchases",
    icon: ShoppingCart,
    roles: ["OWNER", "MANAGER"],
  },

  // Inventory - Cashier, Manager, Owner
  {
    title: "Inventory",
    icon: Store,
    roles: ["OWNER", "MANAGER", "CASHIER"],
    children: [
      {
        title: "Overview",
        href: "/dashboard/inventory",
        icon: LayoutDashboard,
        roles: ["OWNER", "MANAGER", "CASHIER"],
      },
      {
        title: "Current Stock",
        href: "/dashboard/inventory/current-stock",
        icon: Boxes,
        roles: ["OWNER", "MANAGER", "CASHIER"],
      },
      {
        title: "Stock In / Out",
        href: "/dashboard/inventory/stock-movements",
        icon: RefreshCcw,
        roles: ["OWNER", "MANAGER", "CASHIER"],
      },
      {
        title: "Stock Adjustments",
        href: "/dashboard/inventory/stock-adjustments",
        icon: ClipboardList,
        roles: ["OWNER", "MANAGER", "CASHIER"],
      },
      {
        title: "Batch-wise Stock",
        href: "/dashboard/inventory/batch-stock",
        icon: Layers,
        roles: ["OWNER", "MANAGER", "CASHIER"],
      },
      {
        title: "Damage & Expiry",
        href: "/dashboard/inventory/damage-expiry",
        icon: AlertTriangle,
        roles: ["OWNER", "MANAGER", "CASHIER"],
      },
      {
        title: "Stock Value Report",
        href: "/dashboard/inventory/stock-value",
        icon: PieChart,
        roles: ["OWNER", "MANAGER", "CASHIER"],
      },
      {
        title: "Movement History",
        href: "/dashboard/inventory/movement-history",
        icon: History,
        roles: ["OWNER", "MANAGER", "CASHIER"],
      },
      {
        title: "Opening Stock",
        href: "/dashboard/inventory/opening",
        icon: TrendingUp,
        roles: ["OWNER", "MANAGER", "CASHIER"],
      },
      {
        title: "Stock Transfers",
        href: "/dashboard/inventory/transfers",
        icon: Truck,
        roles: ["OWNER", "MANAGER", "CASHIER"],
      },
    ],
  },

  // Customers - Cashier, Manager, Owner
  {
    title: "Customers",
    href: "/dashboard/customers",
    icon: Users,
    roles: ["OWNER", "MANAGER", "CASHIER"],
  },

  // Suppliers - Manager and above
  {
    title: "Suppliers",
    href: "/dashboard/suppliers",
    icon: Truck,
    roles: ["OWNER", "MANAGER"],
  },

  // Payments - Manager, Owner
  {
    title: "Payments",
    icon: CreditCard,
    roles: ["OWNER", "MANAGER"],
    children: [
      {
        title: "Payment Received",
        href: "/dashboard/payments/received",
        icon: CreditCard,
        roles: ["OWNER", "MANAGER"],
      },
      {
        title: "Payment Sent",
        href: "/dashboard/payments/sent",
        icon: CreditCard,
        roles: ["OWNER", "MANAGER"],
      },
    ],
  },

  // Reports - Manager, Owner, Super Admin
  {
    title: "Reports",
    icon: BarChart3,
    roles: ["SUPER_ADMIN", "OWNER", "MANAGER"],
    children: [
      {
        title: "Daily Reports",
        href: "/dashboard/reports/daily",
        icon: TrendingUp,
        roles: ["SUPER_ADMIN", "OWNER", "MANAGER"],
      },
      {
        title: "Transaction Reports",
        href: "/dashboard/reports/transactions",
        icon: ClipboardList,
        roles: ["SUPER_ADMIN", "OWNER", "MANAGER"],
      },
      {
        title: "Outstanding Reports",
        href: "/dashboard/reports/outstanding",
        icon: AlertTriangle,
        roles: ["SUPER_ADMIN", "OWNER", "MANAGER"],
      },
      {
        title: "Accounting Reports",
        href: "/dashboard/reports/accounting",
        icon: Receipt,
        roles: ["SUPER_ADMIN", "OWNER", "MANAGER"],
      },
      {
        title: "Inventory Reports",
        href: "/dashboard/reports/inventory",
        icon: Boxes,
        roles: ["SUPER_ADMIN", "OWNER", "MANAGER"],
      },
      {
        title: "Other Reports",
        href: "/dashboard/reports/other",
        icon: PieChart,
        roles: ["SUPER_ADMIN", "OWNER", "MANAGER"],
      },
    ],
  },

  // Expenses - Manager and above
  {
    title: "Expenses",
    href: "/dashboard/expenses",
    icon: Receipt,
    roles: ["OWNER", "MANAGER"],
  },

  // Sales History - Cashier view
  {
    title: "Sales History",
    href: "/dashboard/sales",
    icon: History,
    roles: ["CASHIER"],
  },

  // Branches Management - Owner only
  {
    title: "Branches",
    href: "/dashboard/branches",
    icon: GitBranch,
    roles: ["OWNER"],
  },

  // Users & Roles - Owner and Super Admin
  {
    title: "Users & Roles",
    icon: Shield,
    roles: ["SUPER_ADMIN", "OWNER"],
    children: [
      {
        title: "User List",
        href: "/dashboard/users",
        icon: Users,
        roles: ["SUPER_ADMIN", "OWNER"],
      },
      {
        title: "Roles & Permissions",
        href: "/dashboard/users/roles",
        icon: Shield,
        roles: ["OWNER"],
      },
      {
        title: "Branch Access",
        href: "/dashboard/users/branches",
        icon: GitBranch,
        roles: ["OWNER"],
      },
      {
        title: "Device Control",
        href: "/dashboard/users/devices",
        icon: Laptop,
        roles: ["OWNER"],
      },
      {
        title: "Activity Log",
        href: "/dashboard/users/activity",
        icon: Activity,
        roles: ["OWNER"],
      },
    ],
  },
  {
    title: "Cashier Management",
    href: "/dashboard/users",
    icon: Users,
    roles: ["MANAGER"],
  },
  {
    title: "Platform Admin",
    icon: Shield,
    roles: ["SUPER_ADMIN"],
    children: [
      {
        title: "Businesses",
        href: "/dashboard/super-admin/businesses",
        icon: Store,
        roles: ["SUPER_ADMIN"],
      },
    ],
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    roles: ["SUPER_ADMIN", "OWNER", "MANAGER"],
  },
];
