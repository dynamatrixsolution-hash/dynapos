"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { useSettings } from "@/components/settings-provider";
import {
  TrendingUp,
  DollarSign,
  Boxes,
  Coins,
  FileText,
  Download,
  Calendar,
  Store,
  Printer,
  ChevronDown,
  ArrowRight,
  TrendingDown,
  PieChart,
} from "lucide-react";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
} from "recharts";

interface ReportData {
  startDate: string;
  endDate: string;
  sales: {
    total: number;
    count: number;
    tax: number;
    discount: number;
    byPaymentMethod: Array<{ method: string; amount: number }>;
  };
  purchases: {
    total: number;
    count: number;
  };
  expenses: {
    total: number;
    count: number;
    byCategory: Array<{ categoryId: string; categoryName: string; amount: number }>;
  };
  margins: {
    costOfGoodsSold: number;
    grossProfit: number;
    netProfit: number;
  };
  topProducts: Array<{
    id: string;
    name: string;
    sku: string;
    quantitySold: number;
    revenue: number;
  }>;
}

interface Branch {
  id: string;
  name: string;
}

export default function ReportsPage() {
  const { data: session } = useSession();
  const { currencySymbol, taxName, vatPercentage } = useSettings();
  
  const [reportData, setReportData] = React.useState<ReportData | null>(null);
  const [branches, setBranches] = React.useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = React.useState<string>("");
  const [datePreset, setDatePreset] = React.useState<string>("this_month");
  
  const [startDate, setStartDate] = React.useState<string>("");
  const [endDate, setEndDate] = React.useState<string>("");
  
  const [isLoading, setIsLoading] = React.useState(true);
  const [isExporting, setIsExporting] = React.useState(false);

  // Set date ranges based on preset
  React.useEffect(() => {
    const today = new Date();
    let start = new Date();
    let end = new Date();

    if (datePreset === "today") {
      start = today;
      end = today;
    } else if (datePreset === "yesterday") {
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
      start = yesterday;
      end = yesterday;
    } else if (datePreset === "this_week") {
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
      start = new Date(today.setDate(diff));
      end = new Date();
    } else if (datePreset === "last_30") {
      start = new Date();
      start.setDate(today.getDate() - 30);
      end = new Date();
    } else if (datePreset === "this_month") {
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      end = new Date();
    } else if (datePreset === "last_month") {
      start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      end = new Date(today.getFullYear(), today.getMonth(), 0);
    }

    const formatDate = (d: Date) => {
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${d.getFullYear()}-${month}-${day}`;
    };

    if (datePreset !== "custom") {
      setStartDate(formatDate(start));
      setEndDate(formatDate(end));
    }
  }, [datePreset]);

  // Load branches
  React.useEffect(() => {
    async function loadBranches() {
      try {
        const res = await fetch("/api/v1/branches");
        if (res.ok) {
          const data = await res.json();
          setBranches(data);
        }
      } catch (err) {
        console.error("Failed to load branches:", err);
      }
    }
    loadBranches();
  }, []);

  // Fetch report metrics
  const fetchReport = React.useCallback(async () => {
    setIsLoading(true);
    try {
      let url = `/api/v1/reports?startDate=${startDate}&endDate=${endDate}`;
      if (selectedBranch) {
        url += `&branchId=${selectedBranch}`;
      }
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setReportData(data);
      }
    } catch (err) {
      console.error("Failed to generate report:", err);
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate, selectedBranch]);

  React.useEffect(() => {
    if (startDate && endDate) {
      fetchReport();
    }
  }, [startDate, endDate, selectedBranch, fetchReport]);

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDatePreset(e.target.value);
  };

  const exportCSV = () => {
    if (!reportData) return;
    setIsExporting(true);

    const rows = [
      ["DynaPOS Business Intelligence Report"],
      [`Generated: ${new Date().toLocaleString()}`],
      [`Period: ${startDate} to ${endDate}`],
      [`Branch Context: ${selectedBranch ? branches.find((b) => b.id === selectedBranch)?.name : "All Branches"}`],
      [],
      ["FINANCIAL SUMMARY METRICS"],
      ["Metric", "Value"],
      ["Total Sales Revenue", reportData.sales.total],
      ["Sales Count", reportData.sales.count],
      ["Total Tax Collected", reportData.sales.tax],
      ["Total Discounts Given", reportData.sales.discount],
      ["Total Purchase Restocks", reportData.purchases.total],
      ["Purchase Count", reportData.purchases.count],
      ["Total Expenses Logged", reportData.expenses.total],
      ["Expense Count", reportData.expenses.count],
      ["Cost of Goods Sold (COGS)", reportData.margins.costOfGoodsSold],
      ["Gross Profit", reportData.margins.grossProfit],
      ["Net Profit", reportData.margins.netProfit],
      [],
      ["EXPENSE BREAKDOWN BY CATEGORY"],
      ["Category Name", `Amount (${currencySymbol})`],
      ...reportData.expenses.byCategory.map((c) => [c.categoryName, c.amount]),
      [],
      ["SALES BY PAYMENT METHOD"],
      ["Payment Method", `Amount (${currencySymbol})`],
      ...reportData.sales.byPaymentMethod.map((pm) => [pm.method, pm.amount]),
      [],
      ["TOP SELLING PRODUCTS"],
      ["Product Name", "SKU", "Units Sold", `Revenue (${currencySymbol})`],
      ...reportData.topProducts.map((p) => [p.name, p.sku, p.quantitySold, p.revenue]),
    ];

    const csvContent = "data:text/csv;charset=utf-8," 
      + rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `dynapos_financial_report_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setIsExporting(false);
  };

  const triggerPrint = () => {
    window.print();
  };

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6"];

  return (
    <div className="space-y-6">
      {/* 1. Header Control Panel */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-card border border-border p-5 rounded-2xl print:hidden">
        <div>
          <h1 className="text-2xl font-black">Financial Reports</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Audit store performance, margins, category expenses, and sales breakdowns.
          </p>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          {/* Branch Switcher */}
          <div className="flex items-center gap-2 bg-background border border-border px-3 py-1.5 rounded-xl text-xs w-full sm:w-auto">
            <Store className="h-4 w-4 text-primary" />
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="bg-transparent border-none outline-none font-bold text-foreground cursor-pointer w-full"
            >
              <option value="">All Branches</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Presets */}
          <div className="flex items-center gap-2 bg-background border border-border px-3 py-1.5 rounded-xl text-xs w-full sm:w-auto">
            <Calendar className="h-4 w-4 text-primary" />
            <select
              value={datePreset}
              onChange={handlePresetChange}
              className="bg-transparent border-none outline-none font-bold text-foreground cursor-pointer w-full"
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="this_week">This Week</option>
              <option value="last_30">Last 30 Days</option>
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* Custom Date Inputs */}
          {datePreset === "custom" && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-background border border-border px-3 py-1.5 rounded-xl text-xs text-foreground font-semibold"
              />
              <span className="text-xs text-muted-foreground">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-background border border-border px-3 py-1.5 rounded-xl text-xs text-foreground font-semibold"
              />
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={exportCSV}
              disabled={isExporting || !reportData}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-secondary border border-border hover:bg-secondary/80 rounded-xl text-xs font-bold transition-all w-full sm:w-auto"
              title="Export to CSV"
            >
              <Download className="h-4 w-4" />
              <span>CSV</span>
            </button>
            <button
              onClick={triggerPrint}
              disabled={!reportData}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-xs font-bold transition-all w-full sm:w-auto"
              title="Print Document"
            >
              <Printer className="h-4 w-4" />
              <span>Print</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Print Header (Visible during printing only) */}
      <div className="hidden print:block border-b-2 border-primary pb-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-primary">DynaPOS</h1>
            <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Business Intelligence Report</p>
          </div>
          <div className="text-right text-xs">
            <p><strong>Generated At:</strong> {new Date().toLocaleString()}</p>
            <p><strong>Reporting Period:</strong> {startDate} to {endDate}</p>
            <p><strong>Branch Scope:</strong> {selectedBranch ? branches.find((b) => b.id === selectedBranch)?.name : "All Branches"}</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="h-96 flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
            <p className="text-xs text-muted-foreground">Compiling ledger balances and sales logs...</p>
          </div>
        </div>
      ) : reportData ? (
        <div className="space-y-6">
          {/* 3. Margin Metrics and Financial summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card border border-border p-5 rounded-2xl flex items-center gap-4 shadow-sm">
              <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Gross Sales</p>
                <h3 className="text-xl font-black mt-0.5">{currencySymbol}{reportData.sales.total.toFixed(2)}</h3>
                <p className="text-[9px] text-muted-foreground mt-0.5">{reportData.sales.count} invoices billed</p>
              </div>
            </div>

            <div className="bg-card border border-border p-5 rounded-2xl flex items-center gap-4 shadow-sm">
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0">
                <Boxes className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Cost of Goods (COGS)</p>
                <h3 className="text-xl font-black mt-0.5">{currencySymbol}{reportData.margins.costOfGoodsSold.toFixed(2)}</h3>
                <p className="text-[9px] text-muted-foreground mt-0.5">Purchases: {currencySymbol}{reportData.purchases.total.toFixed(2)}</p>
              </div>
            </div>

            <div className="bg-card border border-border p-5 rounded-2xl flex items-center gap-4 shadow-sm">
              <div className="h-12 w-12 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center flex-shrink-0">
                <Coins className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Total Expenses</p>
                <h3 className="text-xl font-black mt-0.5">{currencySymbol}{reportData.expenses.total.toFixed(2)}</h3>
                <p className="text-[9px] text-muted-foreground mt-0.5">{reportData.expenses.count} vouchers processed</p>
              </div>
            </div>

            <div className="bg-card border border-border p-5 rounded-2xl flex items-center gap-4 shadow-sm">
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                reportData.margins.netProfit >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive"
              }`}>
                <DollarSign className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Net Profit</p>
                <h3 className={`text-xl font-black mt-0.5 ${reportData.margins.netProfit >= 0 ? "text-primary" : "text-destructive"}`}>
                  {currencySymbol}{reportData.margins.netProfit.toFixed(2)}
                </h3>
                <p className="text-[9px] text-muted-foreground mt-0.5">
                  Margin: {reportData.sales.total > 0 ? ((reportData.margins.netProfit / reportData.sales.total) * 100).toFixed(1) : 0}%
                </p>
              </div>
            </div>
          </div>

          {/* Tax / discount details bar */}
          <div className="bg-secondary/40 border border-border rounded-xl p-4 flex flex-wrap gap-6 justify-between text-xs">
            <div>
              <span className="text-muted-foreground font-medium">Tax Collected:</span>
              <span className="font-bold text-foreground ml-2">{currencySymbol}{reportData.sales.tax.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-muted-foreground font-medium">Discounts Awarded:</span>
              <span className="font-bold text-destructive ml-2">{currencySymbol}{reportData.sales.discount.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-muted-foreground font-medium">Average Order Value:</span>
              <span className="font-bold text-primary ml-2">
                {currencySymbol}{reportData.sales.count > 0 ? (reportData.sales.total / reportData.sales.count).toFixed(2) : "0.00"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground font-medium">Net Profit Margin:</span>
              <span className={`font-bold ml-2 ${reportData.margins.netProfit >= 0 ? "text-primary" : "text-destructive"}`}>
                {reportData.sales.total > 0 ? ((reportData.margins.netProfit / reportData.sales.total) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>

          {/* 4. Graphical analysis section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:hidden">
            {/* Sales by Payment Method */}
            <div className="bg-card border border-border rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <h2 className="text-sm font-bold">Sales by Payment Mode</h2>
                <p className="text-[10px] text-muted-foreground mt-0.5">Distribution of revenue channels.</p>
              </div>
              
              <div className="h-64 w-full mt-4 flex items-center justify-center">
                {reportData.sales.byPaymentMethod.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={reportData.sales.byPaymentMethod}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="amount"
                        nameKey="method"
                      >
                        {reportData.sales.byPaymentMethod.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          borderColor: "hsl(var(--border))",
                          borderRadius: "var(--radius)",
                        }}
                        formatter={(value: any) => [`${currencySymbol}${parseFloat(value).toFixed(2)}`, "Revenue"]}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-xs text-muted-foreground">No payments recorded in this period</div>
                )}
              </div>

              {/* Legends */}
              <div className="flex flex-wrap gap-4 justify-center mt-2">
                {reportData.sales.byPaymentMethod.map((entry, index) => (
                  <div key={entry.method} className="flex items-center gap-1.5 text-[10px]">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="font-semibold">{entry.method}:</span>
                    <span className="text-muted-foreground">{currencySymbol}{entry.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Expenses breakdown */}
            <div className="bg-card border border-border rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <h2 className="text-sm font-bold">Expenses by Category</h2>
                <p className="text-[10px] text-muted-foreground mt-0.5">Top expense categories during this duration.</p>
              </div>

              <div className="h-64 w-full mt-4">
                {reportData.expenses.byCategory.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportData.expenses.byCategory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(var(--border), 0.1)" />
                      <XAxis dataKey="categoryName" stroke="currentColor" style={{ opacity: 0.6, fontSize: "10px" }} />
                      <YAxis stroke="currentColor" style={{ opacity: 0.6, fontSize: "10px" }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          borderColor: "hsl(var(--border))",
                          borderRadius: "var(--radius)",
                        }}
                        formatter={(value: any) => [`${currencySymbol}${parseFloat(value).toFixed(2)}`, "Expense"]}
                      />
                      <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                        {reportData.expenses.byCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                    No outward expense logs during this period
                  </div>
                )}
              </div>

              {/* Category details list */}
              <div className="max-h-20 overflow-y-auto mt-2 space-y-1">
                {reportData.expenses.byCategory.map((entry, index) => (
                  <div key={entry.categoryId} className="flex items-center justify-between text-[10px] px-2 py-0.5 hover:bg-secondary/40 rounded">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[(index + 3) % COLORS.length] }} />
                      <span className="font-medium">{entry.categoryName}</span>
                    </span>
                    <span className="font-bold">{currencySymbol}{entry.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 5. Top Products Grid & Print views */}
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-card border border-border rounded-2xl p-5">
              <h2 className="text-sm font-bold mb-4">Top Performing Products (Sorted by Units Sold)</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground font-semibold">
                      <th className="py-2.5">Product Name</th>
                      <th className="py-2.5">SKU</th>
                      <th className="py-2.5 text-center">Units Sold</th>
                      <th className="py-2.5 text-right">Revenue</th>
                      <th className="py-2.5 text-right">Estimated Margin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {reportData.topProducts.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-muted-foreground">
                          No product sales metrics gathered during this timeframe.
                        </td>
                      </tr>
                    ) : (
                      reportData.topProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-secondary/20">
                          <td className="py-2.5 font-bold">{p.name}</td>
                          <td className="py-2.5 font-mono text-muted-foreground uppercase">{p.sku || "N/A"}</td>
                          <td className="py-2.5 text-center font-bold text-foreground">{p.quantitySold}</td>
                          <td className="py-2.5 text-right font-black text-primary">{currencySymbol}{p.revenue.toFixed(2)}</td>
                          <td className="py-2.5 text-right text-muted-foreground">
                            {currencySymbol}{(p.revenue * 0.25).toFixed(2)} (25% est.)
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-card border border-border p-8 rounded-2xl text-center text-muted-foreground text-xs">
          Select a date range and click update to render the store report metrics.
        </div>
      )}
    </div>
  );
}
