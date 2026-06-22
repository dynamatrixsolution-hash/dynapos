"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "./theme-provider";
import { motion, AnimatePresence } from "framer-motion";
import { navigationConfig, NavItem, Role } from "@/lib/nav-config";
import {
  LogOut,
  Bell,
  Sun,
  Moon,
  Menu,
  X,
  ChevronDown,
  Calculator,
  ChevronRight,
  Store,
  AlertTriangle,
} from "lucide-react";

interface UserMeta {
  name: string;
  email: string;
  role: string;
  branchId: string | null;
}

interface BranchMeta {
  id: string;
  name: string;
  isMain: boolean;
}

interface NotificationMeta {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: Date;
}

export default function DashboardShellClient({
  children,
  user,
  branches,
  initialNotifications,
}: {
  children: React.ReactNode;
  user: UserMeta;
  branches: BranchMeta[];
  initialNotifications: any[];
}) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { update } = useSession();
  
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = React.useState(false);
  const [branchDropdownOpen, setBranchDropdownOpen] = React.useState(false);
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);

  const isPosRoute = pathname === "/dashboard/pos";
  const [posSidebarOpen, setPosSidebarOpen] = React.useState(false);
  const [posNavbarOpen, setPosNavbarOpen] = React.useState(true);

  React.useEffect(() => {
    if (!isPosRoute) return;
    const handleToggleSidebar = () => setPosSidebarOpen((prev) => !prev);
    const handleToggleNavbar = () => setPosNavbarOpen((prev) => !prev);

    window.addEventListener("toggle-pos-sidebar", handleToggleSidebar);
    window.addEventListener("toggle-pos-navbar", handleToggleNavbar);

    return () => {
      window.removeEventListener("toggle-pos-sidebar", handleToggleSidebar);
      window.removeEventListener("toggle-pos-navbar", handleToggleNavbar);
    };
  }, [isPosRoute]);
  
  // Track expanded state for nested menus based on titles
  const [expandedMenus, setExpandedMenus] = React.useState<Record<string, boolean>>({});

  const toggleMenu = (title: string) => {
    setExpandedMenus((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const [activeBranch, setActiveBranch] = React.useState<BranchMeta | null>(
    branches.find((b) => b.id === user.branchId) || branches[0] || null
  );
  
  const [notifications, setNotifications] = React.useState<NotificationMeta[]>(initialNotifications);

  // Filter navigation by user role
  const userRole = (user.role as Role) || "CASHIER";
  const allowedNavigation = navigationConfig.filter((item) => item.roles.includes(userRole));

  const handleBranchSwitch = async (branch: BranchMeta) => {
    setActiveBranch(branch);
    setBranchDropdownOpen(false);
    await update({ branchId: branch.id });
    window.location.reload(); 
  };

  const handleMarkAllNotificationsRead = () => setNotifications([]);

  const renderNavItem = (item: NavItem, isMobile = false) => {
    const isActive = item.href ? pathname === item.href : false;
    const hasActiveChild = item.children?.some(child => pathname === child.href);
    const Icon = item.icon;
    const isExpanded = expandedMenus[item.title] || hasActiveChild;

    if (item.children) {
      // Filter children by role
      const allowedChildren = item.children.filter((child) => child.roles.includes(userRole));
      if (allowedChildren.length === 0) return null;

      return (
        <div key={item.title} className="mb-1">
          <button
            onClick={() => toggleMenu(item.title)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group cursor-pointer ${
              hasActiveChild
                ? "bg-slate-100 dark:bg-slate-850 text-slate-800 dark:text-white font-bold" 
                : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon className={`h-5 w-5 ${hasActiveChild ? "text-[#5e50eb] dark:text-blue-500" : "text-slate-400 dark:text-slate-500 group-hover:text-[#5e50eb] dark:group-hover:text-blue-450"}`} />
              {item.title}
            </div>
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight className="h-4 w-4 text-slate-400 dark:text-slate-500" />
            </motion.div>
          </button>
          
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="pl-9 pr-3 py-1 space-y-1 border-l border-slate-150 dark:border-slate-800 ml-5 mt-1">
                  {allowedChildren.map((child) => {
                    const isChildActive = pathname === child.href;
                    const ChildIcon = child.icon;
                    return (
                      <Link
                        key={child.title}
                        href={child.href!}
                        onClick={() => isMobile && setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                          isChildActive
                            ? "bg-[#5e50eb]/10 text-[#5e50eb] font-bold"
                            : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                      >
                        <ChildIcon className="h-4 w-4" />
                        {child.title}
                      </Link>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    // Standard Link
    return (
      <Link
        key={item.title}
        href={item.href!}
        onClick={() => isMobile && setMobileMenuOpen(false)}
        className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group mb-1 ${
          isActive
            ? "bg-gradient-to-r from-[#5e50eb] to-indigo-650 text-white shadow-md shadow-[#5e50eb]/20"
            : "text-slate-550 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-855 hover:text-slate-800 dark:hover:text-white"
        }`}
      >
        <div className="flex items-center gap-3">
          <Icon className={`h-5 w-5 ${isActive ? "text-white" : "text-slate-400 dark:text-slate-550 group-hover:text-[#5e50eb] dark:group-hover:text-blue-450"}`} />
          {item.title}
        </div>
      </Link>
    );
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* 1. Sidebar desktop (Theme Adaptive) */}
      <aside className={`hidden md:flex md:flex-col flex-shrink-0 transition-all duration-300 bg-white dark:bg-[#050B1E] border-r border-slate-100 dark:border-slate-850/50 ${isPosRoute && !posSidebarOpen ? "w-0 overflow-hidden" : "w-64"}`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 dark:border-white/5 bg-white dark:bg-[#050B1E]">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#5e50eb] text-white shadow-md shadow-[#5e50eb]/25">
              <Calculator className="h-5 w-5" />
            </div>
            <span className="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight">
              DynaPOS
            </span>
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto px-4 py-6">
          {allowedNavigation.map((item) => renderNavItem(item))}
        </nav>
        <div className="p-4 border-t border-slate-105 dark:border-white/5 bg-white dark:bg-[#050B1E]">
          <button
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 font-bold transition-colors cursor-pointer"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* 2. Main content container */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className={`flex items-center justify-between px-4 md:px-6 flex-shrink-0 z-30 transition-all duration-300 bg-white dark:bg-[#050B1E] border-b border-slate-100 dark:border-slate-850 ${isPosRoute && !posNavbarOpen ? "h-0 opacity-0 overflow-hidden py-0 border-b-0" : "h-16"}`}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-md text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="md:hidden font-bold text-xl text-[#5e50eb]">DynaPOS</div>
            
            {activeBranch && (
              <div className="relative">
                {/* Only show switch option for owners; non-owners see read-only badge */}
                {["SUPER_ADMIN", "OWNER"].includes(userRole) ? (
                  <>
                    <button
                      onClick={() => setBranchDropdownOpen(!branchDropdownOpen)}
                      className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold cursor-pointer shadow-xs select-none hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
                    >
                      <div className="flex items-center justify-center p-1 bg-[#5e50eb]/10 dark:bg-[#5e50eb]/20 rounded-lg text-[#5e50eb] dark:text-purple-400 shrink-0">
                        <Store className="h-3.5 w-3.5" />
                      </div>
                      <span className="max-w-[120px] truncate text-slate-800 dark:text-slate-200 font-extrabold">{activeBranch.name}</span>
                      <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                    </button>
                    {branchDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setBranchDropdownOpen(false)} />
                        <div className="absolute left-0 mt-2 w-56 rounded-2xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg z-50 p-1.5">
                          <div className="px-3 py-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                            Switch Branch
                          </div>
                          {branches.map((branch) => (
                            <button
                              key={branch.id}
                              onClick={() => handleBranchSwitch(branch)}
                              className={`flex items-center justify-between w-full text-left px-3 py-2.5 text-xs rounded-xl transition-colors cursor-pointer ${
                                activeBranch.id === branch.id
                                  ? "bg-[#5e50eb]/10 text-[#5e50eb] font-bold"
                                  : "hover:bg-slate-50 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-300"
                              }`}
                            >
                              {branch.name}
                              {branch.isMain && <span className="text-[8px] bg-slate-100 dark:bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-md">Main</span>}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  /* Non-owners see only their assigned warehouse as read-only */
                  <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-900/50 text-xs font-semibold cursor-default select-none">
                    <div className="flex items-center justify-center p-1 bg-[#5e50eb]/10 dark:bg-[#5e50eb]/20 rounded-lg text-[#5e50eb] dark:text-purple-400 shrink-0">
                      <Store className="h-3.5 w-3.5" />
                    </div>
                    <span className="max-w-[120px] truncate text-slate-800 dark:text-slate-200 font-extrabold">{activeBranch.name}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors relative cursor-pointer"
              >
                <Bell className="h-5 w-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-white dark:border-[#050B1E]" />
                )}
              </button>
              {notificationsOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)} />
                  <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg z-50 p-1.5">
                    <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Alerts & Logs</span>
                      {notifications.length > 0 && (
                        <button onClick={handleMarkAllNotificationsRead} className="text-[10px] text-[#5e50eb] hover:underline font-semibold cursor-pointer">
                          Clear all
                        </button>
                      )}
                    </div>
                    <div className="max-h-60 overflow-y-auto py-1">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-6 text-center text-xs text-slate-450">No alerts right now</div>
                      ) : (
                        notifications.map((n) => (
                          <div key={n.id} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl flex items-start gap-2.5 border-b border-slate-100 dark:border-slate-800/50 last:border-b-0">
                            <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="text-xs font-semibold text-slate-850 dark:text-slate-200">{n.title}</div>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 leading-snug">{n.message}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-900/60 p-1 rounded-xl transition-colors cursor-pointer"
              >
                <div className="h-8 w-8 rounded-full bg-[#5e50eb]/10 text-[#5e50eb] dark:bg-[#5e50eb]/25 dark:text-purple-400 flex items-center justify-center font-extrabold text-xs select-none">
                  {user.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-extrabold text-slate-800 dark:text-slate-200">{user.name}</div>
                  <div className="text-[9px] text-slate-400 dark:text-slate-500 tracking-wider uppercase font-bold">
                    {user.role}
                  </div>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden lg:block" />
              </button>
              {profileDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg z-50 p-1.5">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 text-left">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{user.name}</div>
                      <div className="text-[10px] text-slate-450 dark:text-slate-500 truncate mt-0.5">{user.email}</div>
                    </div>
                    <button
                      onClick={() => signOut({ callbackUrl: "/auth/login" })}
                      className="flex items-center gap-2.5 w-full text-left px-3 py-2.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl mt-1.5 font-bold transition-colors cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6 z-10 relative">
          {children}
        </main>
      </div>

      {/* 3. Mobile sidebar drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 left-0 w-72 z-50 flex flex-col md:hidden"
              style={{ backgroundColor: "#050B1E" }}
            >
              <div className="h-16 flex items-center justify-between px-6 border-b border-white/5">
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  DynaPOS
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-md text-slate-400 hover:bg-white/10 hover:text-white"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto px-4 py-6">
                {allowedNavigation.map((item) => renderNavItem(item, true))}
              </nav>
              <div className="p-4 border-t border-white/5">
                <button
                  onClick={() => signOut({ callbackUrl: "/auth/login" })}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 font-medium transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
