"use client";

import { useSelector, useDispatch } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import { type RootState, logout } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  Package,
  ShoppingCart,
  DollarSign,
  Users,
  BarChart3,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

export function Sidebar() {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  const menuItems = [
    ...(user?.role !== "salesgirl" ? [{ href: "/dashboard", label: "Dashboard", icon: Package, color: "from-blue-500 to-blue-600", bg: "bg-blue-50 dark:bg-blue-950/40", iconBg: "bg-blue-100 dark:bg-blue-900/50", iconColor: "text-blue-600 dark:text-blue-400" }] : []),
    ...(user?.role === "admin" || user?.role === "manager"
      ? [{ href: "/inventory", label: "Inventory", icon: Package, color: "from-orange-500 to-orange-600", bg: "bg-orange-50 dark:bg-orange-950/40", iconBg: "bg-orange-100 dark:bg-orange-900/50", iconColor: "text-orange-600 dark:text-orange-400" }]
      : []),
    ...(user?.role === "admin" || user?.role === "manager" || user?.role === "salesgirl"
      ? [{ href: "/sales", label: "Sales", icon: ShoppingCart, color: "from-green-500 to-green-600", bg: "bg-green-50 dark:bg-green-950/40", iconBg: "bg-green-100 dark:bg-green-900/50", iconColor: "text-green-600 dark:text-green-400" }]
      : []),
    ...(user?.role === "admin" || user?.role === "manager"
      ? [{ href: "/expenses", label: "Expenses", icon: DollarSign, color: "from-red-500 to-red-600", bg: "bg-red-50 dark:bg-red-950/40", iconBg: "bg-red-100 dark:bg-red-900/50", iconColor: "text-red-600 dark:text-red-400" }]
      : []),
    ...(user?.role === "admin"
      ? [
          { href: "/users", label: "Users", icon: Users, color: "from-purple-500 to-purple-600", bg: "bg-purple-50 dark:bg-purple-950/40", iconBg: "bg-purple-100 dark:bg-purple-900/50", iconColor: "text-purple-600 dark:text-purple-400" },
          { href: "/reports", label: "Reports", icon: BarChart3, color: "from-cyan-500 to-cyan-600", bg: "bg-cyan-50 dark:bg-cyan-950/40", iconBg: "bg-cyan-100 dark:bg-cyan-900/50", iconColor: "text-cyan-600 dark:text-cyan-400" },
        ]
      : []),
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed top-4 left-4 z-50 p-2 hover:bg-muted rounded-lg"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-r border-slate-200 dark:border-slate-700 transition-transform duration-300 z-40 shadow-xl ${
          isMobile
            ? isOpen
              ? "translate-x-0"
              : "-translate-x-full"
            : "translate-x-0"
        }`}
      >
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                {user?.role === "salesgirl" ? "Sales Management" : "Inventory"}
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {user?.name}
              </p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <button
                  onClick={() => setIsOpen(false)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                      : `${item.bg} text-slate-700 dark:text-slate-300 hover:shadow-md hover:scale-[1.02]`
                  }`}
                >
                  <div
                    className={`p-1.5 rounded-lg ${
                      isActive
                        ? "bg-white/20"
                        : item.iconBg
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${
                        isActive
                          ? "text-white"
                          : item.iconColor
                      }`}
                    />
                  </div>
                  <span className="font-medium">{item.label}</span>
                </button>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <Button
            variant="outline"
            className="w-full bg-transparent hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-colors"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
