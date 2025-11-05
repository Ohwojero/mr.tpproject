"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"

export type UserRole = "admin" | "manager" | "salesgirl"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
}

export interface Product {
  id: string
  name: string
  sku: string
  quantity: number
  reorderLevel: number
  price: number
  cost: number
  category: string
}

export interface Sale {
  id: string
  productId: string
  quantity: number
  price: number
  total: number
  date: string
  salesPersonId: string
}

export interface Expense {
  id: string
  description: string
  amount: number
  category: string
  date: string
  createdBy: string
}

interface AppContextType {
  user: User | null
  products: Product[]
  sales: Sale[]
  expenses: Expense[]
  users: User[]
  login: (user: User) => void
  logout: () => void
  addProduct: (product: Product) => void
  updateProduct: (product: Product) => void
  deleteProduct: (id: string) => void
  updateStock: (id: string, quantity: number) => void
  addSale: (sale: Sale) => void
  deleteSale: (id: string) => void
  addExpense: (expense: Expense) => void
  deleteExpense: (id: string) => void
  addUser: (user: User) => void
  deleteUser: (id: string) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [products, setProducts] = useState<Product[]>([
    {
      id: "1",
      name: "Laptop",
      sku: "LAP-001",
      quantity: 15,
      reorderLevel: 5,
      price: 1200,
      cost: 800,
      category: "Electronics",
    },
    {
      id: "2",
      name: "Mouse",
      sku: "MOU-001",
      quantity: 50,
      reorderLevel: 20,
      price: 25,
      cost: 10,
      category: "Accessories",
    },
    {
      id: "3",
      name: "Keyboard",
      sku: "KEY-001",
      quantity: 3,
      reorderLevel: 10,
      price: 75,
      cost: 40,
      category: "Accessories",
    },
  ])
  const [sales, setSales] = useState<Sale[]>([
    {
      id: "1",
      productId: "1",
      quantity: 2,
      price: 1200,
      total: 2400,
      date: new Date().toISOString(),
      salesPersonId: "user2",
    },
  ])
  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: "1",
      description: "Office supplies",
      amount: 150,
      category: "Supplies",
      date: new Date().toISOString(),
      createdBy: "user1",
    },
  ])
  const [users, setUsers] = useState<User[]>([
    {
      id: "user1",
      email: "admin@inventory.com",
      name: "Admin User",
      role: "admin",
    },
    {
      id: "user2",
      email: "manager@inventory.com",
      name: "Manager User",
      role: "manager",
    },
    {
      id: "user3",
      email: "sales@inventory.com",
      name: "Sales Girl",
      role: "salesgirl",
    },
  ])

  const login = useCallback((newUser: User) => {
    setUser(newUser)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  const addProduct = useCallback((product: Product) => {
    setProducts((prev) => [...prev, product])
  }, [])

  const updateProduct = useCallback((product: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === product.id ? product : p)))
  }, [])

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const updateStock = useCallback((id: string, quantity: number) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, quantity } : p)))
  }, [])

  const addSale = useCallback(
    (sale: Sale) => {
      setSales((prev) => [...prev, sale])
      // Update stock
      updateStock(sale.productId, products.find((p) => p.id === sale.productId)?.quantity || 0 - sale.quantity)
    },
    [products, updateStock],
  )

  const deleteSale = useCallback((id: string) => {
    setSales((prev) => prev.filter((s) => s.id !== id))
  }, [])

  const addExpense = useCallback((expense: Expense) => {
    setExpenses((prev) => [...prev, expense])
  }, [])

  const deleteExpense = useCallback((id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id))
  }, [])

  const addUser = useCallback((newUser: User) => {
    setUsers((prev) => [...prev, newUser])
  }, [])

  const deleteUser = useCallback((id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id))
  }, [])

  return (
    <AppContext.Provider
      value={{
        user,
        products,
        sales,
        expenses,
        users,
        login,
        logout,
        addProduct,
        updateProduct,
        deleteProduct,
        updateStock,
        addSale,
        deleteSale,
        addExpense,
        deleteExpense,
        addUser,
        deleteUser,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useApp must be used within AppProvider")
  }
  return context
}
