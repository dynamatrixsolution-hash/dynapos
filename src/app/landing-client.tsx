"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import {
  ShoppingBag,
  TrendingUp,
  Boxes,
  Users,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  Shield,
  Layers,
  ChevronRight,
  Menu,
  X,
  Star,
  ChevronDown,
  Building,
  Check,
  Store,
  HeartPulse,
  Utensils,
  Coffee,
  Laptop,
  Coins,
  BookOpen,
  FileText,
  Lock,
  ArrowLeftRight,
  Settings,
  Plus,
  Play,
  UserCheck,
  DollarSign,
  PieChart,
  Warehouse,
  Flame,
  Fingerprint,
  Zap,
} from "lucide-react";

interface LandingClientProps {
  isLoggedIn: boolean;
}

export default function LandingClient({ isLoggedIn }: LandingClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeShowcaseTab, setActiveShowcaseTab] = useState("POS Billing");
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annually">("monthly");
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Statistics section state
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
        }
      },
      { threshold: 0.1 }
    );
    if (statsRef.current) {
      observer.observe(statsRef.current);
    }
    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current);
      }
    };
  }, []);

  const menuItems = [
    { name: "Features", href: "#features" },
    { name: "Solutions", href: "#showcase" },
    { name: "Industries", href: "#industries" },
    { name: "Pricing", href: "#pricing" },
    { name: "Testimonials", href: "#testimonials" },
    { name: "Contact", href: "#contact" },
  ];

  const industries = [
    { name: "Retail Stores", icon: Store, desc: "Fast multi-terminal checkout and real-time inventory count." },
    { name: "Pharmacies", icon: HeartPulse, desc: "Batch tracking, manufacturer expiry, and drug classifications." },
    { name: "Restaurants", icon: Utensils, desc: "Table layouts, kitchen orders, split bills, and tips tracking." },
    { name: "Cafes", icon: Coffee, desc: "Quick-serve barcode scanning and automated ingredient adjustments." },
    { name: "Supermarkets", icon: Warehouse, desc: "High-volume scale weight billing and multiple checkout lanes." },
    { name: "Hardware Stores", icon: Settings, desc: "Wholesale unit conversions, credit accounts, and supplier logs." },
    { name: "Electronics", icon: Laptop, desc: "Serial number logging, active product warranties, and technician tracking." },
    { name: "Wholesale & Distribution", icon: ArrowLeftRight, desc: "Multi-warehouse dispatching, custom discount structures." },
    { name: "Stationery Shops", icon: BookOpen, desc: "Broad SKU categorization, quick search index, and supplier reorders." },
    { name: "Garment Stores", icon: Layers, desc: "Variant matrices (size, color) and seasonal pricing adjustments." },
  ];

  const features = [
    {
      title: "Fast POS Billing",
      desc: "Process transactions in milliseconds. Designed to handle intense retail rush hours.",
      bullets: ["High-speed barcode scanning", "Multiple payment split logic", "Multi-tab billing hold system", "Instant print or email receipt templates"],
      icon: ShoppingBag,
      color: "bg-blue-500/10 text-blue-600 border-blue-100",
    },
    {
      title: "Inventory Management",
      desc: "Real-time stock level synchronization across all storefronts and warehouses.",
      bullets: ["Live stock count adjustments", "Batch tracking with expiry notices", "Warehouse-to-store stock transfers", "Automatic minimum stock triggers"],
      icon: Boxes,
      color: "bg-sky-500/10 text-sky-600 border-sky-100",
    },
    {
      title: "Purchase Management",
      desc: "Build strategic relations with suppliers and control procurement costs.",
      bullets: ["Supplier profile & credit ledgers", "Interactive purchase orders creation", "Wholesale credit payment logs", "Damaged goods return tracking"],
      icon: Layers,
      color: "bg-indigo-500/10 text-indigo-600 border-indigo-100",
    },
    {
      title: "Payments & Accounting",
      desc: "Double-entry compliance made effortless for daily store cashiers.",
      bullets: ["Real-time terminal register logs", "Multi-payment method setup", "Operating expense tracking", "Accurate tax liability calculations"],
      icon: Coins,
      color: "bg-emerald-500/10 text-emerald-600 border-emerald-100",
    },
    {
      title: "Reports & Analytics",
      desc: "Transform transaction numbers into tactical operations decisions.",
      bullets: ["Live daily sales summaries", "Top performing product categories", "Outstanding customer balance statements", "Gross margins & net profit audits"],
      icon: TrendingUp,
      color: "bg-purple-500/10 text-purple-600 border-purple-100",
    },
    {
      title: "Device Security",
      desc: "Keep local storefront terminals sealed from external manipulation.",
      bullets: ["Unique workstation IP binding", "Live cashier activity logging", "Hierarchical role-based access", "Automatic inactive screen locking"],
      icon: Shield,
      color: "bg-rose-500/10 text-rose-600 border-rose-100",
    },
  ];

  const showcaseTabs = [
    "POS Billing",
    "Inventory",
    "Reports",
    "Payments",
    "Customers",
    "Suppliers",
    "Settings",
  ];

  const testimonials = [
    {
      quote: "DynaOne transformed how we run our 4-branch pharmacy chain. The batch tracking and expiry alerts saved us thousands in lost inventory. POS checkout is lightning fast.",
      name: "Dr. Sarah Lin",
      role: "Founder & CEO",
      business: "MedCare Pharmacies",
      stars: 5,
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120&h=120",
    },
    {
      quote: "The multi-terminal binding and role permission configurations are best-in-class. Our supermarket register operations are fully secure, and our end-of-day reconciliation is done in under 5 minutes.",
      name: "Marcus Vance",
      role: "Operations Director",
      business: "FreshMart Supermarkets",
      stars: 5,
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=120&h=120",
    },
    {
      quote: "As a wholesale supplier, coordinating stock levels across 3 warehouses used to be a nightmare. DynaOne's real-time inventory management gives us absolute transparency instantly.",
      name: "Tariq Mahmood",
      role: "Owner",
      business: "Mahmood Hardware Distributors",
      stars: 5,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120&h=120",
    },
  ];

  const pricingPlans = [
    {
      name: "Starter",
      desc: "Perfect for single-terminal independent shops",
      monthlyPrice: 0,
      annualPrice: 0,
      features: [
        "1 POS Workstation Limit",
        "Up to 2,000 Products",
        "Standard Inventory Control",
        "Email Receipt Templates",
        "Daily Sales Summaries",
        "Email Support",
      ],
      cta: "Get Started Free",
      popular: false,
    },
    {
      name: "Professional",
      desc: "For growing multi-branch businesses & retail shops",
      monthlyPrice: 49,
      annualPrice: 39,
      features: [
        "Unlimited POS Workstations",
        "Up to 5 Store Branches",
        "50,000+ Products Support",
        "Advanced Batch & Expiry Tracking",
        "Supplier Purchase Orders Logs",
        "Double-entry Accounting Integration",
        "Consolidated Branch Reports",
        "24/7 Priority Live Chat Support",
      ],
      cta: "Start 14-Day Free Trial",
      popular: true,
    },
    {
      name: "Enterprise",
      desc: "Custom controls for large wholesale & franchise networks",
      monthlyPrice: 99,
      annualPrice: 79,
      features: [
        "Unlimited Store Branches",
        "Unlimited Products & Warehouses",
        "Custom Workstation IP Binding",
        "Dedicated Multi-warehouse Dispatch",
        "Full API Access & Webhook Integrations",
        "Dedicated Success Manager",
        "Custom SLA & Guaranteed Uptime",
        "Onsite Training & Deployment Assistance",
      ],
      cta: "Schedule Enterprise Demo",
      popular: false,
    },
  ];

  const faqs = [
    {
      q: "What businesses can use DynaOne?",
      a: "DynaOne is a highly configurable platform optimized for retail stores, pharmacies, restaurants, supermarkets, hardware stores, and wholesale businesses. It comes with specialized modules (like pharmacy batch/expiry tracking or restaurant tables) which can be enabled or disabled based on your business type.",
    },
    {
      q: "Does DynaOne support barcode scanners?",
      a: "Yes! DynaOne works natively with any USB or Bluetooth barcode scanner. It supports rapid sequential scans, product quantity increments on repeat scans, and scan-to-cart commands for cashier efficiency.",
    },
    {
      q: "Can I manage multiple branches and warehouses?",
      a: "Absolutely. DynaOne is built from the ground up for multi-branch business management. Managers can switch context to any store location, check real-time stock at nearby warehouses, transfer inventory between stores, and view consolidated chain-wide revenue analytics.",
    },
    {
      q: "Does it support pharmacy batch tracking?",
      a: "Yes. Our dedicated pharmacy extension enables tracking of manufacturer batches, production dates, expiry alerts, and specific storage rack assignments. Cashiers are automatically blocked from selling expired products.",
    },
    {
      q: "Can cashiers access sensitive profit reports?",
      a: "No. DynaOne features custom role-based access control (RBAC). You can define strict access rules for cashiers, inventory managers, accountants, and branch administrators, ensuring cashiers only see checkout tools.",
    },
    {
      q: "How secure is the system?",
      a: "Security is built into every layer. We offer IP-based terminal binding to prevent employees from logging in outside the store, detailed activity logging (audit trails) for every single transaction/action, and secure encrypted data transmission.",
    },
  ];

  // Helper for animated statistics values
  const AnimatedCounter = ({ value, label, trigger }: { value: string; label: string; trigger: boolean }) => {
    const [displayVal, setDisplayVal] = useState("0");

    useEffect(() => {
      if (!trigger) return;
      const numValue = parseFloat(value.replace(/[^0-9.]/g, ""));
      const isPercent = value.includes("%");
      const isPlus = value.includes("+");
      
      let start = 0;
      const duration = 1500; // ms
      const steps = 60;
      const increment = numValue / steps;
      const stepDuration = duration / steps;

      let timer = setInterval(() => {
        start += increment;
        if (start >= numValue) {
          setDisplayVal(value);
          clearInterval(timer);
        } else {
          const rounded = start.toFixed(value.includes(".") ? 1 : 0);
          setDisplayVal(`${rounded}${isPercent ? "%" : ""}${isPlus ? "+" : ""}`);
        }
      }, stepDuration);

      return () => clearInterval(timer);
    }, [value, trigger]);

    return (
      <div className="text-center p-6 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
        <h4 className="text-4xl md:text-5xl font-black text-blue-600 tracking-tight mb-2">{displayVal}</h4>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans antialiased overflow-x-hidden selection:bg-blue-600 selection:text-white">
      
      {/* BACKGROUND DECORATIONS */}
      <div className="absolute top-0 left-0 right-0 h-[1000px] bg-gradient-to-b from-blue-50/50 via-sky-50/20 to-transparent pointer-events-none -z-25" />
      
      {/* 1. STICKY GLASSMORPHIC NAVBAR */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/75 border-b border-[#E5E7EB] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="h-11 w-11 rounded-[12px] bg-gradient-to-br from-[#2563EB] to-[#38BDF8] flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
              <Zap className="h-6 w-6 text-white fill-white/10" />
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
              Dyna<span className="text-[#2563EB]">One</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8">
            {menuItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-sm font-semibold text-slate-600 hover:text-[#2563EB] transition-colors"
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/10 hover:shadow-lg transition-all"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="px-5 py-2.5 text-slate-600 hover:text-blue-600 text-sm font-bold transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/login"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/10 hover:shadow-lg transition-all"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
          >
            <Menu className="h-6 w-6 text-slate-700" />
          </button>
        </div>
      </header>

      {/* MOBILE NAV OVERLAY */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black z-50 lg:hidden"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-80 bg-white shadow-2xl z-50 p-6 flex flex-col justify-between lg:hidden border-l border-slate-100"
            >
              <div>
                <div className="flex justify-between items-center pb-6 border-b border-slate-100 mb-8">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-[10px] bg-gradient-to-br from-blue-600 to-sky-400 flex items-center justify-center text-white">
                      <Zap className="h-5 w-5" />
                    </div>
                    <span className="text-xl font-black tracking-tight text-slate-900">DynaOne</span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {menuItems.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-3 px-4 rounded-xl text-base font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-all"
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
              </div>

              <div className="space-y-3.5 border-t border-slate-150 pt-6">
                {isLoggedIn ? (
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex justify-center items-center w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md"
                  >
                    Dashboard &rarr;
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex justify-center items-center w-full py-3.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-bold transition-all"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex justify-center items-center w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md"
                    >
                      Get Started Free
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 2. HERO SECTION */}
      <section className="relative pt-12 pb-24 md:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        {/* Glow effect blur decoration */}
        <div className="absolute right-0 top-1/4 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />
        <div className="absolute left-1/4 top-1/2 w-[300px] h-[300px] bg-sky-400/10 rounded-full blur-[90px] pointer-events-none -z-10" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          {/* Left Panel */}
          <div className="lg:col-span-6 flex flex-col items-start text-left">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-bold text-blue-600 mb-8 shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              Empowering 2,500+ Active Merchants Globally
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 leading-[1.1] md:leading-[1.15]"
            >
              All-In-One POS & ERP Platform For <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-[#38BDF8] bg-clip-text text-transparent">
                Growing Businesses
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base md:text-lg text-slate-500 mt-6 max-w-xl leading-relaxed"
            >
              Manage sales, inventory, purchases, payments, accounting, and multi-branch operations from one powerful, unified cloud platform. Optimized for speed and absolute cash audit accuracy.
            </motion.p>

            {/* Supported businesses chips */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-2.5 mt-8 max-w-lg"
            >
              {["Retail Stores", "Pharmacies", "Restaurants", "Supermarkets", "Hardware Stores", "Wholesale Businesses"].map((b, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-[#2563EB]/5 hover:text-[#2563EB] transition-colors rounded-lg text-xs font-bold text-slate-600 border border-slate-200"
                >
                  {b}
                </span>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap gap-4 mt-10 w-full sm:w-auto"
            >
              <Link
                href="/auth/login"
                className="w-full sm:w-auto text-center px-8 py-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-2xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2.5"
              >
                Start Free Trial
                <ArrowRight className="h-4.5 w-4.5" />
              </Link>
              <a
                href="#showcase"
                className="w-full sm:w-auto text-center px-8 py-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-2xl text-sm font-bold hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
              >
                <Play className="h-4 w-4 fill-slate-500 text-slate-500" />
                Book Demo
              </a>
            </motion.div>
          </div>

          {/* Right Panel - Mockup Frame with Floating Badges */}
          <div className="lg:col-span-6 relative mt-12 lg:mt-0 flex justify-center">
            {/* Dashboard Mockup Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="w-full max-w-xl bg-white border border-slate-250 shadow-2xl rounded-3xl p-3 relative overflow-hidden"
            >
              <div className="h-6 w-full flex items-center gap-1.5 px-3 border-b border-slate-100 pb-3 mb-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                <span className="text-[10px] text-slate-400 font-bold ml-2">DynaOne Platform Console</span>
              </div>
              <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4.5 flex flex-col gap-4">
                {/* Header Info */}
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Store Dashboard</h3>
                    <p className="text-base font-extrabold text-slate-800">DynaOne Retail (Branch #1)</p>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-lg border border-emerald-100 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    Terminal Connected
                  </span>
                </div>

                {/* Grid Blocks */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="bg-white border border-slate-150 p-3.5 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-450 uppercase">Today's Net Sales</span>
                    <p className="text-lg font-black text-slate-900 mt-1">$4,850.50</p>
                    <span className="text-[9px] font-bold text-emerald-600 mt-0.5 block">+12.4% vs yesterday</span>
                  </div>
                  <div className="bg-white border border-slate-150 p-3.5 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-450 uppercase">Active Transactions</span>
                    <p className="text-lg font-black text-slate-900 mt-1">128 Bills</p>
                    <span className="text-[9px] font-bold text-blue-500 mt-0.5 block">0 Pending checkout</span>
                  </div>
                </div>

                {/* Progress Indicators */}
                <div className="bg-white border border-slate-150 p-4 rounded-xl space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-600">Stock Capacity Alert</span>
                    <span className="text-amber-500 font-extrabold">2 Low Stock SKUs</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full" style={{ width: "88%" }} />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
                    <span>Active Storage (88%)</span>
                    <span>12,450 / 15,000 Products</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* FLOATING CARDS */}
            {/* Sales Float Card */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -top-6 -left-6 bg-white border border-slate-150 rounded-2xl p-4 shadow-xl flex items-center gap-3.5"
            >
              <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-450 uppercase">Sales Volume</span>
                <p className="text-xs font-black text-slate-800">12,420 Completed</p>
              </div>
            </motion.div>

            {/* Inventory Float Card */}
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 0.5 }}
              className="absolute -bottom-6 -right-6 bg-white border border-slate-150 rounded-2xl p-4 shadow-xl flex items-center gap-3.5"
            >
              <div className="h-10 w-10 bg-sky-50 text-sky-500 rounded-xl flex items-center justify-center border border-sky-100">
                <Boxes className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-450 uppercase">Inventory Value</span>
                <p className="text-xs font-black text-slate-800">$189,450.00</p>
              </div>
            </motion.div>

            {/* Reports Float Card */}
            <motion.div
              animate={{ x: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="absolute bottom-12 -left-12 bg-white border border-slate-150 rounded-2xl p-3.5 shadow-xl flex items-center gap-3"
            >
              <div className="h-9 w-9 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center border border-purple-100">
                <TrendingUp className="h-4.5 w-4.5" />
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-450 uppercase">Gross Profit</span>
                <p className="text-xs font-black text-emerald-600">+$24,580.40</p>
              </div>
            </motion.div>

            {/* Device Security Check Float */}
            <motion.div
              animate={{ x: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 5.2, ease: "easeInOut", delay: 0.2 }}
              className="absolute top-16 -right-12 bg-white border border-slate-150 rounded-2xl p-3.5 shadow-xl flex items-center gap-3"
            >
              <div className="h-9 w-9 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center border border-rose-100">
                <Shield className="h-4.5 w-4.5" />
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-450 uppercase">Device Security</span>
                <p className="text-xs font-black text-slate-800">Terminal Bound</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. TRUSTED BY SECTION */}
      <section className="bg-white border-y border-slate-200/80 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-6">SUPPORTING MULTIPLE INDUSTRIES NATIVELY</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 items-center justify-center opacity-70">
            {[
              { label: "Retail Networks", icon: Store },
              { label: "Clinical Pharmacies", icon: HeartPulse },
              { label: "Food & Cafes", icon: Utensils },
              { label: "Supermarkets", icon: Warehouse },
              { label: "Hardware Outlets", icon: Settings },
              { label: "Wholesalers", icon: ArrowLeftRight },
            ].map((p, index) => (
              <div key={index} className="flex items-center justify-center gap-2 text-slate-700 hover:text-blue-600 transition-colors cursor-pointer group">
                <p.icon className="h-5 w-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                <span className="font-extrabold text-sm tracking-tight">{p.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FEATURES SECTION */}
      <section id="features" className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-xs uppercase font-extrabold text-blue-600 tracking-widest px-3.5 py-1.5 bg-blue-50 rounded-full">CORE CAPABILITIES</span>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mt-5 tracking-tight">Everything You Need To Grow & Manage Your Business Operations</h2>
          <p className="text-sm md:text-base text-slate-500 mt-4 max-w-xl mx-auto">
            DynaOne combines standard POS registers with high-performance ERP database backends, letting you coordinate inventory logs and audit-proof financials in one location.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3 }}
              className="bg-white border border-slate-200/90 rounded-3xl p-8 hover:shadow-xl hover:border-blue-200 transition-all flex flex-col justify-between"
            >
              <div>
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-6 border ${f.color}`}>
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">{f.title}</h3>
                <p className="text-xs text-slate-450 leading-relaxed mb-6">{f.desc}</p>
                
                <ul className="space-y-3.5 border-t border-slate-100 pt-6">
                  {f.bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs font-semibold text-slate-600">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 5. INDUSTRIES SECTION */}
      <section id="industries" className="bg-white border-y border-slate-200/60 py-24 md:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-xs uppercase font-extrabold text-blue-600 tracking-widest px-3.5 py-1.5 bg-blue-50 rounded-full">VERSATILITY BY DESIGN</span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mt-5 tracking-tight">Tailored Workflows For Every Industry Type</h2>
            <p className="text-sm md:text-base text-slate-500 mt-4 max-w-xl mx-auto">
              Different businesses require unique data fields. DynaOne responds with industry-specific schemas designed to support your products.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {industries.map((ind, idx) => (
              <div
                key={idx}
                className="group border border-slate-150 hover:border-blue-500 hover:bg-gradient-to-b hover:from-white hover:to-blue-50/10 p-6 rounded-3xl transition-all duration-300 shadow-sm hover:shadow-lg flex flex-col items-start"
              >
                <div className="h-10 w-10 bg-slate-50 text-slate-500 group-hover:bg-blue-50 group-hover:text-[#2563EB] rounded-2xl flex items-center justify-center mb-4 transition-colors">
                  <ind.icon className="h-5 w-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors mb-2">{ind.name}</h4>
                <p className="text-[11px] text-slate-450 leading-relaxed">{ind.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. DASHBOARD SHOWCASE (INTERACTIVE TABS) */}
      <section id="showcase" className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase font-extrabold text-blue-600 tracking-widest px-3.5 py-1.5 bg-blue-50 rounded-full">LIVE PREVIEW</span>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mt-5 tracking-tight">Explore The Sleek Platform Interface</h2>
          <p className="text-sm md:text-base text-slate-500 mt-4 max-w-xl mx-auto">
            Take a visual tour through our core platform components and tools.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-12">
          {showcaseTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveShowcaseTab(tab)}
              className={`relative px-5 py-3 rounded-2xl text-xs font-bold transition-all duration-300 ${
                activeShowcaseTab === tab
                  ? "text-white bg-blue-600 shadow-md shadow-blue-500/10"
                  : "text-slate-500 hover:text-slate-900 bg-white border border-slate-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Interactive Showcase Screen */}
        <div className="w-full max-w-5xl mx-auto bg-slate-900 border border-slate-850 shadow-2xl rounded-3xl p-3 relative overflow-hidden">
          {/* Top Frame Control Bar */}
          <div className="h-7 w-full flex items-center justify-between px-4 border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            </div>
            <div className="bg-slate-800 px-4 py-0.5 rounded-lg text-[9px] text-slate-400 font-semibold border border-slate-700/60 max-w-[200px] truncate">
              http://dynaone.io/terminal/retail_mode
            </div>
            <span className="text-[9px] text-slate-500 font-extrabold uppercase">Console View</span>
          </div>

          <div className="min-h-[420px] bg-slate-950 rounded-2xl p-4 text-slate-300 font-sans flex flex-col justify-between">
            <AnimatePresence mode="wait">
              {activeShowcaseTab === "POS Billing" && (
                <motion.div
                  key="pos"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 h-full flex-1"
                >
                  {/* Left Catalog Grid */}
                  <div className="md:col-span-8 flex flex-col gap-3">
                    <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                      <span className="text-[10px] font-extrabold text-blue-450 uppercase">Retail Catalog Quick-Pick</span>
                      <span className="text-[9px] px-2 py-0.5 bg-slate-900 text-slate-450 rounded-md font-bold">Category: All Beverages</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2.5">
                      {[
                        { name: "Fresh Milk 1L", code: "MILK1", price: 3.5, stock: 45 },
                        { name: "Coca Cola 500ml", code: "COKE5", price: 1.8, stock: 120 },
                        { name: "Orange Juice 1L", code: "ORNG1", price: 4.2, stock: 14 },
                        { name: "Paracetamol 500mg", code: "PARA5", price: 8.5, stock: 250 },
                        { name: "Mineral Water 1L", code: "WTR1L", price: 1.0, stock: 95 },
                        { name: "Rye Bread 500g", code: "BREAD", price: 2.9, stock: 5 },
                      ].map((item, i) => (
                        <div key={i} className="bg-slate-900 hover:bg-slate-850 border border-slate-800 p-2.5 rounded-xl flex flex-col justify-between cursor-pointer transition-colors">
                          <div className="flex justify-between items-start gap-1">
                            <span className="text-[10px] font-bold text-slate-100">{item.name}</span>
                            {item.stock <= 5 && <span className="bg-rose-500/10 text-rose-400 text-[8px] px-1 py-0.2 rounded font-black">Low</span>}
                          </div>
                          <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-950">
                            <span className="text-[10px] font-bold text-blue-400">${item.price.toFixed(2)}</span>
                            <span className="text-[8px] text-slate-500">Stock: {item.stock}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Cart Section */}
                  <div className="md:col-span-4 bg-slate-900/60 border border-slate-900 rounded-xl p-3 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center border-b border-slate-850 pb-2 mb-3">
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase">Bill Items (INV-1002)</span>
                        <span className="text-[9px] px-2 py-0.5 bg-blue-500/15 text-blue-400 font-bold rounded">Cashier A</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] bg-slate-950 p-2.5 rounded-lg border border-slate-900">
                          <div>
                            <p className="font-bold text-white">Fresh Milk 1L</p>
                            <span className="text-[9px] text-slate-500">2 &times; $3.50</span>
                          </div>
                          <span className="font-extrabold text-blue-400">$7.00</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] bg-slate-950 p-2.5 rounded-lg border border-slate-900">
                          <div>
                            <p className="font-bold text-white">Orange Juice 1L</p>
                            <span className="text-[9px] text-slate-500">1 &times; $4.20</span>
                          </div>
                          <span className="font-extrabold text-blue-400">$4.20</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3.5 border-t border-slate-800 space-y-2.5">
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>VAT (13%):</span>
                        <span>$1.46</span>
                      </div>
                      <div className="flex justify-between text-xs font-black text-white border-t border-slate-900 pt-2.5">
                        <span>Grand Total:</span>
                        <span className="text-emerald-400">$12.66</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2.5 pt-2">
                        <button className="py-2 bg-slate-850 hover:bg-slate-800 border border-slate-800 text-[10px] font-black rounded-lg text-slate-300">Hold Bill</button>
                        <button className="py-2 bg-blue-600 hover:bg-blue-500 text-[10px] font-black rounded-lg text-white">Checkout</button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeShowcaseTab === "Inventory" && (
                <motion.div
                  key="inventory"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4 flex-1"
                >
                  <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                    <span className="text-[10px] font-extrabold text-blue-450 uppercase">Stock Batch Control Center</span>
                    <span className="text-[9px] px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-md font-bold">Location: Main Warehouse</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-[10px]">
                      <thead>
                        <tr className="border-b border-slate-850 text-slate-500 uppercase font-black">
                          <th className="pb-2">Product Name</th>
                          <th className="pb-2">SKU Code</th>
                          <th className="pb-2">Batch ID</th>
                          <th className="pb-2">Expiry Date</th>
                          <th className="pb-2 text-right">Qty</th>
                          <th className="pb-2 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900/60">
                        {[
                          { name: "Paracetamol 500mg", sku: "MED-PR-50", batch: "BATCH-890", expiry: "2027-12-15", qty: "2,500 units", status: "Active", statusCol: "text-emerald-400 bg-emerald-500/10" },
                          { name: "Cravit Antibiotic 250mg", sku: "MED-CR-25", batch: "BATCH-451", expiry: "2026-08-10", qty: "140 units", status: "Expires Soon", statusCol: "text-amber-400 bg-amber-500/10" },
                          { name: "Whole Milk 1L", sku: "DY-MILK-1", batch: "BATCH-011", expiry: "2026-06-28", qty: "8 units", status: "Low Stock", statusCol: "text-orange-400 bg-orange-500/10" },
                          { name: "Cold Cough Syrup 100ml", sku: "MED-SYR-02", batch: "BATCH-901", expiry: "2025-12-01", qty: "450 units", status: "Expired", statusCol: "text-rose-400 bg-rose-500/10" },
                        ].map((row, i) => (
                          <tr key={i} className="hover:bg-slate-900/40">
                            <td className="py-2.5 font-bold text-white">{row.name}</td>
                            <td className="py-2.5 text-slate-400 font-mono">{row.sku}</td>
                            <td className="py-2.5 text-slate-450">{row.batch}</td>
                            <td className="py-2.5 text-slate-400">{row.expiry}</td>
                            <td className="py-2.5 text-right font-bold text-white">{row.qty}</td>
                            <td className="py-2.5 text-center">
                              <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${row.statusCol}`}>{row.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {activeShowcaseTab === "Reports" && (
                <motion.div
                  key="reports"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4 flex-1"
                >
                  <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                    <span className="text-[10px] font-extrabold text-blue-450 uppercase">Operational Audit Analytics</span>
                    <span className="text-[9px] px-2 py-0.5 bg-slate-900 text-slate-450 rounded-md font-bold">Month: June 2026</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                      <span className="text-[9px] font-bold text-slate-500 uppercase">Gross Revenue</span>
                      <p className="text-base font-black text-white mt-1">$45,840.00</p>
                      <span className="text-[8px] text-emerald-400 font-semibold block mt-0.5">+14% vs Last Month</span>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                      <span className="text-[9px] font-bold text-slate-500 uppercase">Cost of Goods (COGS)</span>
                      <p className="text-base font-black text-white mt-1">$22,450.00</p>
                      <span className="text-[8px] text-slate-500 font-semibold block mt-0.5">Margin: 51.02%</span>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                      <span className="text-[9px] font-bold text-slate-500 uppercase">Operating Expenses</span>
                      <p className="text-base font-black text-white mt-1">$4,850.00</p>
                      <span className="text-[8px] text-rose-400 font-semibold block mt-0.5">Rent, Utilities, Wages</span>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                      <span className="text-[9px] font-bold text-slate-500 uppercase">Net Profit</span>
                      <p className="text-base font-black text-emerald-400 mt-1">$18,540.00</p>
                      <span className="text-[8px] text-emerald-400 font-semibold block mt-0.5">40.4% Net Margin</span>
                    </div>
                  </div>

                  {/* SVG Bar Chart Visualization */}
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 mt-2">
                    <h5 className="text-[9px] font-black text-slate-400 uppercase mb-3">Weekly Net Profit Comparison</h5>
                    <div className="h-28 flex items-end justify-between gap-4 pt-4 px-6 border-b border-slate-800">
                      {[
                        { label: "W1", height: "45%", val: "$3.5k" },
                        { label: "W2", height: "65%", val: "$4.8k" },
                        { label: "W3", height: "85%", val: "$6.2k" },
                        { label: "W4", height: "55%", val: "$4.0k" },
                      ].map((bar, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                          <span className="text-[8px] text-slate-400 font-bold">{bar.val}</span>
                          <div className="w-8 bg-blue-600 rounded-t-lg transition-all duration-500" style={{ height: bar.height }} />
                          <span className="text-[8px] text-slate-500 font-bold mt-1">{bar.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeShowcaseTab === "Payments" && (
                <motion.div
                  key="payments"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4 flex-1"
                >
                  <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                    <span className="text-[10px] font-extrabold text-blue-450 uppercase">Payment Ledger & Registers</span>
                    <span className="text-[9px] px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-md font-bold">Terminal Register: Active</span>
                  </div>
                  <div className="space-y-2.5">
                    {[
                      { ref: "PAY-9081", method: "FonePay QR", name: "David Miller", time: "10:14 AM", amt: "$45.20", status: "Cleared", color: "text-emerald-400 bg-emerald-500/10" },
                      { ref: "PAY-9080", method: "Visa Swiped", name: "Helena Rostova", time: "09:55 AM", amt: "$120.00", status: "Cleared", color: "text-emerald-400 bg-emerald-500/10" },
                      { ref: "PAY-9079", method: "Cash Drawer", name: "Walk-in Customer", time: "09:42 AM", amt: "$12.80", status: "Cleared", color: "text-emerald-400 bg-emerald-500/10" },
                      { ref: "PAY-9078", method: "Store Credit Account", name: "Nirmal General Stores", time: "09:12 AM", amt: "$350.00", status: "Pending Audit", color: "text-amber-400 bg-amber-500/10" },
                    ].map((p, i) => (
                      <div key={i} className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex justify-between items-center text-[10px]">
                        <div className="flex gap-4">
                          <div>
                            <span className="text-white font-bold">{p.ref}</span>
                            <span className="text-slate-500 font-mono block text-[8px] mt-0.5">{p.time}</span>
                          </div>
                          <div>
                            <span className="text-slate-300 font-bold">{p.name}</span>
                            <span className="text-slate-500 block text-[8px] mt-0.5">Method: {p.method}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-black text-white">{p.amt}</span>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${p.color}`}>{p.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeShowcaseTab === "Customers" && (
                <motion.div
                  key="customers"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4 flex-1"
                >
                  <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                    <span className="text-[10px] font-extrabold text-blue-450 uppercase">Customer Relationship Profile logs</span>
                    <span className="text-[9px] px-2 py-0.5 bg-slate-900 text-slate-450 rounded-md font-bold">Total: 1,240 Profiles</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3.5">
                    {[
                      { name: "John Doe", email: "john@doe.com", phone: "+1 555-0192", credit: "$450.00 / $1,000", cap: 45 },
                      { name: "Alisha Karki", email: "alisha.k@gmail.com", phone: "+977 9851-02", credit: "$0.00 / $500", cap: 0 },
                      { name: "David Smith", email: "smithd@outlook.com", phone: "+44 20-7946", credit: "$850.00 / $1,200", cap: 70 },
                      { name: "Khadka Retailers", email: "khadkaretail@info.com", phone: "+977 9801-09", credit: "$2,800.00 / $3,000", cap: 93 },
                    ].map((c, i) => (
                      <div key={i} className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl text-[10px]">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-white">{c.name}</span>
                          <span className="text-slate-500 font-mono">{c.phone}</span>
                        </div>
                        <p className="text-slate-450 mb-3">{c.email}</p>
                        <div className="space-y-1.5 border-t border-slate-950 pt-2.5">
                          <div className="flex justify-between text-[8px] text-slate-500">
                            <span>Outstanding Store Credit Limit</span>
                            <span className={c.cap > 80 ? "text-rose-400 font-bold" : "text-slate-350"}>{c.credit}</span>
                          </div>
                          <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${c.cap > 80 ? "bg-rose-500" : "bg-blue-600"}`} style={{ width: `${c.cap}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeShowcaseTab === "Suppliers" && (
                <motion.div
                  key="suppliers"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4 flex-1"
                >
                  <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                    <span className="text-[10px] font-extrabold text-blue-450 uppercase">Supplier Logs & Purchase Reorders</span>
                    <span className="text-[9px] px-2 py-0.5 bg-slate-900 text-slate-450 rounded-md font-bold">Active Suppliers: 18</span>
                  </div>
                  <div className="space-y-2.5">
                    {[
                      { company: "Himalayan Wholesale Distributors", contact: "Sunil Sharma", balance: "$4,250.00", activePO: "3 Pending Delivery" },
                      { company: "Global Pharma Labs Ltd.", contact: "Dr. Rita Thapa", balance: "$1,890.00", activePO: "1 Shipped" },
                      { company: "Prime Packaging Supply Co.", contact: "James Mercer", balance: "$180.00", activePO: "0 PO Active" },
                    ].map((s, i) => (
                      <div key={i} className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex justify-between items-center text-[10px]">
                        <div>
                          <span className="text-white font-bold block">{s.company}</span>
                          <span className="text-slate-500 text-[8px] block mt-0.5">Contact Agent: {s.contact}</span>
                        </div>
                        <div className="text-right flex items-center gap-5">
                          <div>
                            <span className="text-slate-400 block text-[8px] uppercase">Balance Due</span>
                            <span className="text-white font-extrabold">{s.balance}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[8px] uppercase">PO Status</span>
                            <span className="text-blue-400 font-bold block">{s.activePO}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeShowcaseTab === "Settings" && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4 flex-1 text-[10px]"
                >
                  <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                    <span className="text-[10px] font-extrabold text-blue-450 uppercase">Terminal Configurations</span>
                    <span className="text-[9px] px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-md font-bold">Sys: Sealed</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-3">
                      <h5 className="font-extrabold text-white border-b border-slate-800 pb-1.5 uppercase text-[9px]">Terminal Features Toggle</h5>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Terminal Binding Lock</span>
                        <div className="h-4.5 w-8 bg-blue-600 rounded-full p-0.5 flex items-center justify-end cursor-pointer"><span className="h-3.5 w-3.5 bg-white rounded-full" /></div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Auto Cashier Register Backup</span>
                        <div className="h-4.5 w-8 bg-blue-600 rounded-full p-0.5 flex items-center justify-end cursor-pointer"><span className="h-3.5 w-3.5 bg-white rounded-full" /></div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Pharmacy Batch Validation</span>
                        <div className="h-4.5 w-8 bg-blue-600 rounded-full p-0.5 flex items-center justify-end cursor-pointer"><span className="h-3.5 w-3.5 bg-white rounded-full" /></div>
                      </div>
                    </div>
                    
                    <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-3">
                      <h5 className="font-extrabold text-white border-b border-slate-800 pb-1.5 uppercase text-[9px]">Cashier Permissions Schema</h5>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Manual Discount Entry</span>
                        <div className="h-4.5 w-8 bg-slate-800 border border-slate-700 rounded-full p-0.5 flex items-center justify-start cursor-pointer"><span className="h-3.5 w-3.5 bg-slate-500 rounded-full" /></div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Bill Deletion / Return Audits</span>
                        <div className="h-4.5 w-8 bg-slate-800 border border-slate-700 rounded-full p-0.5 flex items-center justify-start cursor-pointer"><span className="h-3.5 w-3.5 bg-slate-500 rounded-full" /></div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Register Close Consolidated Logs</span>
                        <div className="h-4.5 w-8 bg-blue-600 rounded-full p-0.5 flex items-center justify-end cursor-pointer"><span className="h-3.5 w-3.5 bg-white rounded-full" /></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Bottom Panel Status Bar */}
            <div className="flex justify-between items-center border-t border-slate-900 pt-3 text-[8px] text-slate-500 font-bold mt-4 font-mono">
              <span>Database Version: Prisma Client v6.19</span>
              <span>Host IP: 192.168.1.45 (Workstation-A)</span>
              <span>System Integrity: SSL Encrypted (256-bit)</span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. WHY DYNAONE? (STATISTICS SECTION) */}
      <section ref={statsRef} className="py-24 md:py-32 bg-[#F8FAFC] px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-xs uppercase font-extrabold text-blue-600 tracking-widest px-3.5 py-1.5 bg-blue-50 rounded-full">METRICS THAT MATTER</span>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mt-5 tracking-tight">Scale Without Performance Bottlenecks</h2>
          <p className="text-sm md:text-base text-slate-500 mt-4 max-w-xl mx-auto">
            Our cloud ERP clusters are engineered to guarantee uninterrupted cash registers even during heavy network latency.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-6 gap-6">
          <AnimatedCounter value="99.9%" label="System Uptime" trigger={statsVisible} />
          <AnimatedCounter value="100K+" label="Products Support" trigger={statsVisible} />
          <AnimatedCounter value="0ms" label="Real-time Sync" trigger={statsVisible} />
          <AnimatedCounter value="10+" label="Warehouses" trigger={statsVisible} />
          <AnimatedCounter value="100%" label="IP Terminal Lock" trigger={statsVisible} />
          <AnimatedCounter value="0.2s" label="Quick Search" trigger={statsVisible} />
        </div>
      </section>

      {/* 8. TESTIMONIALS SECTION */}
      <section id="testimonials" className="bg-white border-y border-slate-200/60 py-24 md:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-xs uppercase font-extrabold text-blue-600 tracking-widest px-3.5 py-1.5 bg-blue-50 rounded-full">MERCHANT SUCCESS</span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mt-5 tracking-tight">Loved By Small Outlets & Large Chains Alike</h2>
            <p className="text-sm md:text-base text-slate-500 mt-4 max-w-xl mx-auto">
              Read how business owners are reclaiming hours of audit time every week.
            </p>
          </div>

          {/* Testimonial slider view */}
          <div className="max-w-4xl mx-auto relative px-6 md:px-12">
            <div className="min-h-[220px] flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTestimonial}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.4 }}
                  className="text-center"
                >
                  <p className="text-lg md:text-xl font-bold text-slate-700 italic leading-relaxed">
                    &ldquo;{testimonials[activeTestimonial].quote}&rdquo;
                  </p>
                  
                  <div className="flex justify-center gap-1 mt-6 mb-4">
                    {Array.from({ length: testimonials[activeTestimonial].stars }).map((_, i) => (
                      <Star key={i} className="h-5.5 w-5.5 text-amber-500 fill-amber-500" />
                    ))}
                  </div>

                  <div className="flex items-center justify-center gap-4 mt-6">
                    <img
                      src={testimonials[activeTestimonial].avatar}
                      alt={testimonials[activeTestimonial].name}
                      className="h-12 w-12 rounded-full border border-slate-200 object-cover"
                    />
                    <div className="text-left">
                      <h4 className="text-sm font-black text-slate-900">{testimonials[activeTestimonial].name}</h4>
                      <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                        {testimonials[activeTestimonial].role} &bull; <span className="text-[#2563EB]">{testimonials[activeTestimonial].business}</span>
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Slider Dots */}
            <div className="flex justify-center gap-2.5 mt-10">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    activeTestimonial === index ? "w-6 bg-blue-600" : "w-2.5 bg-slate-200"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 9. PRICING SECTION */}
      <section id="pricing" className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs uppercase font-extrabold text-blue-600 tracking-widest px-3.5 py-1.5 bg-blue-50 rounded-full">TRANSPARENT LICENSING</span>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mt-5 tracking-tight">Flexible Plans For Businesses of Any Scale</h2>
          <p className="text-sm md:text-base text-slate-500 mt-4 max-w-xl mx-auto">
            Choose the package matching your store counts. Cancel or change plan contexts instantly.
          </p>
        </div>

        {/* Pricing Period Toggle */}
        <div className="flex justify-center items-center gap-4.5 mb-16">
          <span className={`text-sm font-bold ${billingPeriod === "monthly" ? "text-slate-900" : "text-slate-400"}`}>Billed Monthly</span>
          <button
            onClick={() => setBillingPeriod(billingPeriod === "monthly" ? "annually" : "monthly")}
            className="w-12 h-6 bg-slate-200 hover:bg-slate-300 rounded-full p-0.5 flex items-center transition-colors relative"
          >
            <div
              className={`h-5 w-5 bg-[#2563EB] rounded-full shadow transition-all ${
                billingPeriod === "annually" ? "translate-x-6" : ""
              }`}
            />
          </button>
          <span className={`text-sm font-bold ${billingPeriod === "annually" ? "text-slate-900" : "text-slate-400"} flex items-center gap-1.5`}>
            Billed Annually
            <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
              Save 20%
            </span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
          {pricingPlans.map((plan, idx) => (
            <div
              key={idx}
              className={`bg-white border rounded-3xl p-8 flex flex-col justify-between relative transition-all duration-300 hover:shadow-xl ${
                plan.popular
                  ? "border-[#2563EB] border-2 shadow-md shadow-blue-500/5 md:-translate-y-2"
                  : "border-slate-200/90"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#2563EB] text-white font-extrabold text-[9px] uppercase tracking-widest px-4 py-1.5 rounded-full shadow">
                  Recommended Plan
                </span>
              )}
              <div>
                <h3 className="text-lg font-black text-slate-800 mb-2">{plan.name}</h3>
                <p className="text-xs text-slate-500 mb-6">{plan.desc}</p>
                
                <div className="flex items-baseline gap-1.5 mb-8">
                  <span className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                    ${billingPeriod === "monthly" ? plan.monthlyPrice : plan.annualPrice}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">/month</span>
                </div>

                <ul className="space-y-4 border-t border-slate-100 pt-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs font-semibold text-slate-600">
                      <Check className="h-4.5 w-4.5 text-[#2563EB] shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100">
                <Link
                  href="/auth/login"
                  className={`w-full block py-3.5 rounded-xl text-xs font-black text-center transition-all ${
                    plan.popular
                      ? "bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-md"
                      : "bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 10. FAQ SECTION (ACCORDION) */}
      <section id="faqs" className="bg-white border-y border-slate-200/60 py-24 md:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-xs uppercase font-extrabold text-blue-600 tracking-widest px-3.5 py-1.5 bg-blue-50 rounded-full">HAVE QUESTIONS?</span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mt-5 tracking-tight">Frequently Asked Questions</h2>
            <p className="text-sm md:text-base text-slate-500 mt-4 max-w-xl mx-auto">
              Everything you need to know about setting up DynaOne terminals at your branch locations.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-slate-50 border border-slate-150 rounded-2xl overflow-hidden transition-colors duration-300"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full text-left p-6 flex justify-between items-center gap-4 focus:outline-none"
                  >
                    <span className="font-bold text-sm text-slate-800">{faq.q}</span>
                    <span className={`p-1.5 rounded-lg bg-white border border-slate-100 text-slate-500 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
                      <ChevronDown className="h-4 w-4" />
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 text-xs text-slate-500 leading-relaxed border-t border-slate-100/60 pt-4 bg-white/40">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 11. CTA SECTION */}
      <section id="contact" className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-700 rounded-[32px] p-8 md:p-16 text-center text-white relative overflow-hidden shadow-2xl">
          {/* Background shapes */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-[80px] pointer-events-none -z-10" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#38BDF8]/10 rounded-full blur-[80px] pointer-events-none -z-10" />

          <div className="max-w-2xl mx-auto">
            <span className="text-[10px] font-black uppercase tracking-widest bg-white/10 px-3.5 py-1.5 rounded-full border border-white/10">READY TO SCALE?</span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mt-6 mb-4">Ready To Grow Your Business With DynaOne?</h2>
            <p className="text-sm md:text-base text-slate-200 mt-2 mb-8 leading-relaxed max-w-lg mx-auto">
              Deploy your cloud registers today. Join thousand of retail networks, pharmacies, and wholesale businesses utilizing DynaOne.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/auth/login"
                className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-blue-600 text-sm font-black rounded-2xl shadow-lg transition-transform hover:-translate-y-0.5"
              >
                Start Free Trial
              </Link>
              <Link
                href="/auth/login"
                className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/15 text-white text-sm font-black rounded-2xl border border-white/20 transition-transform hover:-translate-y-0.5"
              >
                Schedule Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 12. FOOTER SECTION */}
      <footer className="border-t border-slate-200/80 bg-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand Info */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Zap className="h-5 w-5 text-white fill-white/10" />
              </div>
              <span className="text-lg font-black tracking-tight text-slate-800">DynaOne</span>
            </div>
            <p className="text-xs text-slate-450 leading-relaxed max-w-sm">
              Next-generation multi-branch Point of Sale and ERP system designed for high-performance retail, pharmacy, and restaurant operations. Secure, audit-proof, and lightning fast.
            </p>
          </div>

          {/* Links Column 1 */}
          <div>
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4">Company</h4>
            <ul className="space-y-2.5 text-xs text-slate-450 font-semibold">
              <li><a href="#" className="hover:text-blue-600 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Press Kit</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Security Audit</a></li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4">Features</h4>
            <ul className="space-y-2.5 text-xs text-slate-450 font-semibold">
              <li><a href="#features" className="hover:text-blue-600 transition-colors">POS Terminal</a></li>
              <li><a href="#features" className="hover:text-blue-600 transition-colors">Batch Tracking</a></li>
              <li><a href="#features" className="hover:text-blue-600 transition-colors">Supplier Orders</a></li>
              <li><a href="#features" className="hover:text-blue-600 transition-colors">Audit Ledger</a></li>
            </ul>
          </div>

          {/* Links Column 3 */}
          <div>
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4">Support</h4>
            <ul className="space-y-2.5 text-xs text-slate-450 font-semibold">
              <li><a href="#" className="hover:text-blue-600 transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">System Status</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Contact Sales</a></li>
              <li><a href="mailto:support@dynaone.io" className="hover:text-blue-600 transition-colors">Email Support</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-slate-400">
            &copy; 2026 DynaOne Systems Inc. All rights reserved. DynaOne, the DynaOne logo, and Prisma integration are trademarks or registered trademarks.
          </p>
          <div className="flex gap-4 text-xs font-semibold text-slate-400">
            <a href="#" className="hover:text-slate-650 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-650 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-650 transition-colors">Cookie Controls</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
