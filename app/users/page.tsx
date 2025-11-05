"use client";

import { Sidebar } from "@/components/sidebar";
import type React from "react";
import { useSelector, useDispatch } from "react-redux";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { DataTable } from "@/components/data-table";
import { ArrowLeft } from "lucide-react";

// Server actions
import { getAllUsers, createUser, deleteUserById, type User } from "./actions";

export default function UsersPage() {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    role: "manager" as const,
    password: "",
  });
  const [error, setError] = useState("");
  const router = useRouter();

  // Load users
  useEffect(() => {
    async function load() {
      const data = await getAllUsers();
      setUsers(data);
      setLoading(false);
    }
    load();
  }, []);

  // Auth guard
  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      router.push("/dashboard");
    }
  }, [isAuthenticated, user, router]);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.name || !formData.password) {
      setError("All fields are required");
      return;
    }

    try {
      const newUser = await createUser({
        email: formData.email,
        name: formData.name,
        role: formData.role,
        password: formData.password,
      });

      if (newUser) {
        setUsers((prev) => [...prev, newUser]);
        setFormData({ email: "", name: "", role: "manager", password: "" });
        setIsOpen(false);
      }
    } catch (err: any) {
      setError(err.message || "Failed to create user");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === user?.id) {
      alert("Cannot delete your own account");
      return;
    }
    if (!confirm("Delete this user?")) return;

    await deleteUserById(userId);
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  const dispatch = useDispatch();

  if (!isAuthenticated || user?.role !== "admin") return null;

  const tableColumns = [
    { key: "name", label: "Name", searchable: true },
    { key: "email", label: "Email", searchable: true },
    {
      key: "role",
      label: "Role",
      render: (value: string) => (
        <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
          {value}
        </span>
      ),
    },
    {
      key: "id",
      label: "Actions",
      render: (value: string) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleDeleteUser(value)}
          disabled={value === user?.id}
        >
          <Trash2 className="w-4 h-4 text-destructive" />
        </Button>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Sidebar />

      <main className="md:ml-64 p-4 md:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="hover:bg-white/50">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex-1">
            <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3 bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              User Management
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Manage system users and their roles
            </p>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Create a new user account with assigned role and password
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddUser} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-100 text-red-700 rounded">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(v: any) => setFormData({ ...formData, role: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="salesgirl">Sales</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">
                  Create User
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              All Users
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400 text-base">
              Total users: <span className="font-semibold">{users.length}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading users...</p>
            ) : (
              <DataTable
                columns={tableColumns}
                data={users}
                itemsPerPage={10}
                searchPlaceholder="Search by name or email..."
              />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}