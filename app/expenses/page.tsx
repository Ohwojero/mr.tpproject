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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Plus,
  Trash2,
  DollarSign,
  Download,
  Printer,
  ArrowLeft,
} from "lucide-react";

import { Sidebar } from "@/components/sidebar";
import { DataTable } from "@/components/data-table";
import Link from "next/link";

import { getExpenses, addExpense, deleteExpense } from "./actions";

const EXPENSE_CATEGORIES = [
  "Supplies",
  "Utilities",
  "Rent",
  "Salaries",
  "Marketing",
  "Maintenance",
  "Other",
];

export default function ExpensesPage() {
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const router = useRouter();

  // ---------- UI state ----------
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    description: "",
    amount: 0,
    category: "Supplies",
  });

  // ---------- Data ----------
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ---------- Load expenses ----------
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (user?.role !== "admin" && user?.role !== "manager") {
      router.push("/dashboard");
      return;
    }

    (async () => {
      const data = await getExpenses();
      setExpenses(data);
      setLoading(false);
    })();
  }, [isAuthenticated, user, router]);

  // ---------- Add expense ----------
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description || form.amount <= 0 || !user) return;

    try {
      await addExpense({
        ...form,
        createdBy: user.id,
      });
      setForm({ description: "", amount: 0, category: "Supplies" });
      setIsOpen(false);
      const refreshed = await getExpenses();
      setExpenses(refreshed);
    } catch (err: any) {
      alert(err.message ?? "Failed to add expense");
    }
  };

  // ---------- Delete expense ----------
  const handleDeleteExpense = async (id: string) => {
    if (!confirm("Delete this expense?")) return;
    try {
      await deleteExpense(id);
      const refreshed = await getExpenses();
      setExpenses(refreshed);
    } catch (err: any) {
      alert(err.message ?? "Failed to delete");
    }
  };

  // ---------- CSV download ----------
  const downloadExpensesAsCSV = () => {
    if (expenses.length === 0) {
      alert("No expenses to download.");
      return;
    }

    const headers = ["Description", "Category", "Amount", "Date"];
    const rows = expenses.map((e) => [
      `"${e.description}"`,
      `"${e.category}"`,
      e.amount.toFixed(2),
      new Date(e.date).toLocaleDateString(),
    ]);

    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `expenses_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const printExpenses = () => window.print();

  // ---------- Calculations ----------
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const currentMonth = new Date().toLocaleString("default", {
    month: "long",
    year: "numeric",
  });
  const monthlyExpenses = expenses
    .filter((e) => {
      const d = new Date(e.date);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((s, e) => s + e.amount, 0);

  const expensesByCategory = EXPENSE_CATEGORIES.map((cat) => ({
    category: cat,
    amount: expenses
      .filter((e) => e.category === cat)
      .reduce((s, e) => s + e.amount, 0),
  }));

  // ---------- Table columns ----------
  const tableColumns = [
    { key: "description", label: "Description", searchable: true },
    {
      key: "category",
      label: "Category",
      searchable: true,
      render: (v: string) => (
        <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-muted text-muted-foreground">
          {v}
        </span>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      render: (v: number) => `₦${v.toFixed(2)}`,
    },
    {
      key: "date",
      label: "Date",
      render: (v: string) => new Date(v).toLocaleDateString(),
    },
    {
      key: "id",
      label: "Actions",
      render: (id: string) => (
        <Button variant="ghost" size="sm" onClick={() => handleDeleteExpense(id)}>
          <Trash2 className="w-4 h-4 text-red-600" />
        </Button>
      ),
    },
  ];

  // ---------- Loading / Auth guard ----------
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading…
      </div>
    );
  }

  // ---------- Render ----------
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-orange-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Sidebar />

      <main className="md:ml-64 p-4 md:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>

          <div className="flex-1">
            <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3 bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              Expense Tracking
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Monitor and manage business expenses
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={downloadExpensesAsCSV}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 hover:from-blue-600 hover:to-blue-700"
            >
              <Download className="w-4 h-4 mr-2" />
              CSV
            </Button>

            <Button
              variant="outline"
              onClick={printExpenses}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 hover:from-green-600 hover:to-green-700"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Expense
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Record New Expense</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddExpense} className="space-y-4">
                  <div>
                    <Label>Description</Label>
                    <Input
                      placeholder="e.g., Office supplies"
                      value={form.description}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <Label>Amount</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={form.amount}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          amount: Number(e.target.value) || 0,
                        })
                      }
                      required
                    />
                  </div>

                  <div>
                    <Label>Category</Label>
                    <select
                      value={form.category}
                      onChange={(e) =>
                        setForm({ ...form, category: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                    >
                      {EXPENSE_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Button type="submit" className="w-full">
                    Record Expense
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                Total Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-4xl font-bold text-red-600 dark:text-red-400">
                  ₦{totalExpenses.toFixed(0)}
                </div>
                <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-full">
                  <DollarSign className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 font-medium">
                All time expenses
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                {currentMonth} Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-4xl font-bold text-orange-600 dark:text-orange-400">
                  ₦{monthlyExpenses.toFixed(0)}
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900/50 rounded-full">
                  <DollarSign className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 font-medium">
                Current month total
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-amber-50 to-lime-50 dark:from-amber-950/20 dark:to-lime-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                Total Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-4xl font-bold text-amber-600 dark:text-amber-400">
                  {expenses.length}
                </div>
                <div className="p-3 bg-amber-100 dark:bg-amber-900/50 rounded-full">
                  <Plus className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 font-medium">
                Expense entries
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Expenses by Category */}
        <Card className="mb-12 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              Expenses by Category
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400 text-base">
              Breakdown of expenses across different categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {expensesByCategory.map((item) => (
                <div
                  key={item.category}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100/50 dark:hover:bg-slate-600/50 transition-colors gap-2 sm:gap-4"
                >
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    {item.category}
                  </span>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
                    <div className="w-full sm:w-40 h-3 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-400 to-red-600 rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            totalExpenses > 0
                              ? (item.amount / totalExpenses) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white w-full sm:w-24 text-left sm:text-right">
                      ₦{item.amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* All Expenses Table */}
        <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              All Expenses
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400 text-base">
              Total records:{" "}
              <span className="font-semibold text-slate-900 dark:text-white">
                {expenses.length}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={tableColumns}
              data={expenses}
              itemsPerPage={10}
              searchPlaceholder="Search by description or category..."
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}