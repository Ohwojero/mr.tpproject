// app/dashboard/page.tsx
"use client";

import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { type RootState, logout } from "@/lib/store";
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
  const router = useRouter();

  // ---------- 1. Load data from SQLite ----------
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, [isAuthenticated, user, router]);

  // ---------- 2. Logout ----------
  const handleLogout = () => {
    // dispatch is not needed for logout if you only use auth slice
    // but we keep it for consistency
    // dispatch(logout());
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
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                Total Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-4xl font-bold text-slate-900 dark:text-white">
                  {stats?.totalProducts ?? 0}
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                  <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 font-medium">
                Active inventory items
              </p>
            </CardContent>
          </Card>

          {/* Low Stock */}
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                Low Stock Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-4xl font-bold text-red-600 dark:text-red-400">
                  {stats?.lowStock ?? 0}
                </div>
                <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-full">
                  <TrendingUp className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 font-medium">
                Items needing restock
              </p>
            </CardContent>
          </Card>

          {/* Total Sales */}
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                Total Sales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-4xl font-bold text-green-600 dark:text-green-400">
                  ₦{totalRevenue.toFixed(0)}
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-full">
                  <ShoppingCart className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 font-medium">
                Revenue generated
              </p>
            </CardContent>
          </Card>

          {/* Expenses (admin / manager only) */}
          {(user.role === "admin" || user.role === "manager") && (
            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                  Total Expenses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-4xl font-bold text-orange-600 dark:text-orange-400">
                    ₦{totalExpenses.toFixed(0)}
                  </div>
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/50 rounded-full">
                    <DollarSign className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 font-medium">
                  Business expenses
                </p>
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
              <Card className="cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg group">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3 text-slate-800 dark:text-slate-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg group-hover:bg-purple-200 dark:group-hover:bg-purple-800/50 transition-colors">
                      <Package className="w-5 h-5" />
                    </div>
                    Inventory Management
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                    Manage products and stock levels
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            {(user.role === "admin" || user.role === "manager") && (
              <Link href="/sales">
                <Card className="cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg group">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-3 text-slate-800 dark:text-slate-200 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                      <div className="p-2 bg-cyan-100 dark:bg-cyan-900/50 rounded-lg group-hover:bg-cyan-200 dark:group-hover:bg-cyan-800/50 transition-colors">
                        <ShoppingCart className="w-5 h-5" />
                      </div>
                      Sales Management
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                      Track and manage sales transactions
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            )}

            {(user.role === "admin" || user.role === "manager") && (
              <Link href="/expenses">
                <Card className="cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg group">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-3 text-slate-800 dark:text-slate-200 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                      <div className="p-2 bg-pink-100 dark:bg-pink-900/50 rounded-lg group-hover:bg-pink-200 dark:group-hover:bg-pink-800/50 transition-colors">
                        <DollarSign className="w-5 h-5" />
                      </div>
                      Expense Tracking
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                      Monitor business expenses
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            )}

            {user.role === "admin" && (
              <Link href="/users">
                <Card className="cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg group">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-3 text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg group-hover:bg-indigo-200 dark:group-hover:bg-indigo-800/50 transition-colors">
                        <Package className="w-5 h-5" />
                      </div>
                      User Management
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                      Manage system users and roles
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            )}

            {user.role === "admin" && (
              <Link href="/reports">
                <Card className="cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg group">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-3 text-slate-800 dark:text-slate-200 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      <div className="p-2 bg-teal-100 dark:bg-teal-900/50 rounded-lg group-hover:bg-teal-200 dark:group-hover:bg-teal-800/50 transition-colors">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      Reports & Analytics
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
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