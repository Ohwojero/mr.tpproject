// app/dashboard/page.tsx
"use client";

import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { type RootState, logout } from "@/lib/store";
import { useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LogOut,
  Package,
  ShoppingCart,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import { getDashboardData } from "./actions";
import type { Product, Sale, Expense } from "@/lib/types";

interface Stats {
  totalProducts: number;
  totalRevenue: number;
  totalExpenses: number;
  profit: number;
  lowStock: number;
}

export default function DashboardPage() {
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const dispatch = useDispatch();
  const router = useRouter();

  // ---------- 1. Load data from SQLite ----------
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => { setHydrated(true); }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (user?.role === "salesgirl") {
      router.push("/sales");
      return;
    }

    (async () => {
      const data = await getDashboardData();
      setProducts(data.products);
      setSales(data.sales);
      setExpenses(data.expenses);
      setStats(data.stats);
      setLoading(false);
    })();
  }, [hydrated, isAuthenticated, user, router]);

  // ---------- 2. Logout ----------
  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  if (!isAuthenticated || !user || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading…</div>
      </div>
    );
  }

  // ---------- 3. Derived values ----------
  const lowStockProducts = products.filter(
    (p) => p.quantity <= p.reorderLevel
  );
  const totalRevenue = sales.reduce((s, v) => s + v.total, 0);
  const totalExpenses = expenses.reduce((s, v) => s + v.amount, 0);

  // ---------- 4. UI ----------
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Welcome back,{" "}
              <span className="font-medium text-slate-900 dark:text-white">
                {user.name}
              </span>
              <span className="ml-2 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-medium text-slate-700 dark:text-slate-300 capitalize">
                {user.role}
              </span>
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Total Products */}
          <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden" style={{background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)"}}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-blue-200 uppercase tracking-widest">
                Total Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-4xl font-bold text-white">
                  {stats?.totalProducts ?? 0}
                </div>
                <div className="p-3 bg-white/10 rounded-full backdrop-blur-sm">
                  <Package className="w-6 h-6 text-blue-300" />
                </div>
              </div>
              <p className="text-sm text-blue-300 mt-3 font-medium">Active inventory items</p>
            </CardContent>
          </Card>

          {/* Low Stock */}
          <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden" style={{background: "linear-gradient(135deg, #7b0000 0%, #b71c1c 50%, #e53935 100%)"}}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-red-200 uppercase tracking-widest">
                Low Stock Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-4xl font-bold text-white">
                  {stats?.lowStock ?? 0}
                </div>
                <div className="p-3 bg-white/10 rounded-full backdrop-blur-sm">
                  <TrendingUp className="w-6 h-6 text-red-200" />
                </div>
              </div>
              <p className="text-sm text-red-200 mt-3 font-medium">Items needing restock</p>
            </CardContent>
          </Card>

          {/* Total Sales */}
          <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden" style={{background: "linear-gradient(135deg, #003d1f 0%, #1b5e20 50%, #2e7d32 100%)"}}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-green-200 uppercase tracking-widest">
                Total Sales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-4xl font-bold text-white">
                  ₦{totalRevenue.toFixed(0)}
                </div>
                <div className="p-3 bg-white/10 rounded-full backdrop-blur-sm">
                  <ShoppingCart className="w-6 h-6 text-green-200" />
                </div>
              </div>
              <p className="text-sm text-green-200 mt-3 font-medium">Revenue generated</p>
            </CardContent>
          </Card>

          {/* Expenses (admin / manager only) */}
          {(user.role === "admin" || user.role === "manager") && (
            <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden" style={{background: "linear-gradient(135deg, #4a1800 0%, #bf360c 50%, #e64a19 100%)"}}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-orange-200 uppercase tracking-widest">
                  Total Expenses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-4xl font-bold text-white">
                    ₦{totalExpenses.toFixed(0)}
                  </div>
                  <div className="p-3 bg-white/10 rounded-full backdrop-blur-sm">
                    <DollarSign className="w-6 h-6 text-orange-200" />
                  </div>
                </div>
                <p className="text-sm text-orange-200 mt-3 font-medium">Business expenses</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Actions – unchanged */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/inventory">
              <Card className="cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300 border-0 shadow-lg group overflow-hidden" style={{background: "linear-gradient(135deg, #2c1654 0%, #4a235a 50%, #6a1b9a 100%)"}}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3 text-white">
                    <div className="p-2 bg-white/15 rounded-lg">
                      <Package className="w-5 h-5 text-purple-200" />
                    </div>
                    Inventory Management
                  </CardTitle>
                  <CardDescription className="text-purple-200">
                    Manage products and stock levels
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            {(user.role === "admin" || user.role === "manager") && (
              <Link href="/sales">
                <Card className="cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300 border-0 shadow-lg group overflow-hidden" style={{background: "linear-gradient(135deg, #003d2b 0%, #00695c 50%, #00897b 100%)"}}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-3 text-white">
                      <div className="p-2 bg-white/15 rounded-lg">
                        <ShoppingCart className="w-5 h-5 text-teal-200" />
                      </div>
                      Sales Management
                    </CardTitle>
                    <CardDescription className="text-teal-200">
                      Track and manage sales transactions
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            )}

            {(user.role === "admin" || user.role === "manager") && (
              <Link href="/expenses">
                <Card className="cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300 border-0 shadow-lg group overflow-hidden" style={{background: "linear-gradient(135deg, #4a0030 0%, #880e4f 50%, #c2185b 100%)"}}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-3 text-white">
                      <div className="p-2 bg-white/15 rounded-lg">
                        <DollarSign className="w-5 h-5 text-pink-200" />
                      </div>
                      Expense Tracking
                    </CardTitle>
                    <CardDescription className="text-pink-200">
                      Monitor business expenses
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            )}

            {user.role === "admin" && (
              <Link href="/users">
                <Card className="cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300 border-0 shadow-lg group overflow-hidden" style={{background: "linear-gradient(135deg, #0d1b4b 0%, #1a237e 50%, #283593 100%)"}}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-3 text-white">
                      <div className="p-2 bg-white/15 rounded-lg">
                        <Package className="w-5 h-5 text-indigo-200" />
                      </div>
                      User Management
                    </CardTitle>
                    <CardDescription className="text-indigo-200">
                      Manage system users and roles
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            )}

            {user.role === "admin" && (
              <Link href="/reports">
                <Card className="cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300 border-0 shadow-lg group overflow-hidden" style={{background: "linear-gradient(135deg, #00333a 0%, #006064 50%, #00838f 100%)"}}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-3 text-white">
                      <div className="p-2 bg-white/15 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-cyan-200" />
                      </div>
                      Reports & Analytics
                    </CardTitle>
                    <CardDescription className="text-cyan-200">
                      View business analytics and reports
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            )}
          </div>
        </div>

        {/* Low Stock Alert */}
        {lowStockProducts.length > 0 && (
          <Card className="mt-8 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border-red-200 dark:border-red-800 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-red-700 dark:text-red-400 flex items-center gap-2">
                <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-full">
                  <TrendingUp className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                Low Stock Alert
              </CardTitle>
              <CardDescription className="text-red-600 dark:text-red-400">
                The following items are below reorder level and need attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-4 bg-white/70 dark:bg-slate-800/70 rounded-lg border border-red-100 dark:border-red-800/50 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                  >
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {product.name}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Current stock:{" "}
                        <span className="font-medium text-red-600 dark:text-red-400">
                          {product.quantity}
                        </span>{" "}
                        | Reorder level:{" "}
                        <span className="font-medium text-orange-600 dark:text-orange-400">
                          {product.reorderLevel}
                        </span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="px-3 py-1 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-full text-sm font-medium">
                        Restock Needed
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}