// app/inventory/actions.ts
"use server";

import { database as db } from "@/lib/db";
import { revalidatePath } from "next/cache";

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

/** Load all products */
export async function getProducts(): Promise<Product[]> {
  return await db.all("SELECT * FROM products ORDER BY name ASC");
}

/** Add a new product */
export async function addProduct(data: Omit<Product, "id">) {
  // Trim string fields
  const trimmedData = {
    ...data,
    name: data.name.trim(),
    sku: data.sku.trim(),
    category: data.category.trim(),
  };

  // Validation
  if (!trimmedData.name || !trimmedData.sku || !trimmedData.category) {
    throw new Error("Name, SKU, and category are required.");
  }
  if (trimmedData.quantity < 0 || trimmedData.reorderLevel < 0 || trimmedData.price < 0 || trimmedData.cost < 0) {
    throw new Error("Quantity, reorder level, price, and cost must be non-negative.");
  }

  // Check for existing SKU
  const existing = await db.get("SELECT id FROM products WHERE sku = ?", [trimmedData.sku]);
  if (existing) {
    throw new Error("A product with this SKU already exists.");
  }

  const id = `prod-${Date.now()}`;

  try {
    await db.run(
      `INSERT INTO products
       (id, name, sku, quantity, reorderLevel, price, cost, category)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        trimmedData.name,
        trimmedData.sku,
        trimmedData.quantity,
        trimmedData.reorderLevel,
        trimmedData.price,
        trimmedData.cost,
        trimmedData.category,
      ]
    );
  } catch (error) {
    console.error("Database error adding product:", error);
    throw new Error("Failed to add product due to a database error. Please try again.");
  }

  revalidatePath("/inventory");
  return { id, ...trimmedData };
}

/** Update an existing product */
export async function updateProduct(id: string, data: Partial<Product>) {
  const fields: string[] = [];
  const values: any[] = [];

  if (data.name !== undefined) {
    fields.push("name = ?");
    values.push(data.name);
  }
  if (data.sku !== undefined) {
    fields.push("sku = ?");
    values.push(data.sku);
  }
  if (data.quantity !== undefined) {
    fields.push("quantity = ?");
    values.push(data.quantity);
  }
  if (data.reorderLevel !== undefined) {
    fields.push("reorderLevel = ?");
    values.push(data.reorderLevel);
  }
  if (data.price !== undefined) {
    fields.push("price = ?");
    values.push(data.price);
  }
  if (data.cost !== undefined) {
    fields.push("cost = ?");
    values.push(data.cost);
  }
  if (data.category !== undefined) {
    fields.push("category = ?");
    values.push(data.category);
  }

  if (fields.length === 0) return;

  const sql = `UPDATE products SET ${fields.join(", ")} WHERE id = ?`;
  values.push(id);

  await db.run(sql, values);
  revalidatePath("/inventory");
}

/** Delete a product */
export async function deleteProduct(id: string) {
  await db.run("DELETE FROM products WHERE id = ?", [id]);
  revalidatePath("/inventory");
}