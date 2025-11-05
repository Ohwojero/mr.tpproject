// lib/types.ts
export type UserRole = "admin" | "manager" | "salesgirl";
export type PaymentMode = "POS" | "transfer" | "cash";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  reorderLevel: number;
  price: number;
  cost: number;
  category: string;
}

export interface Sale {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  total: number;
  date: string;
  salesPersonId: string;
  paymentMode: PaymentMode;
  productName?: string;
  salesPersonName?: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  createdBy: string;
}