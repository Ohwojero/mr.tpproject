// lib/db.ts
import { createClient, type LibsqlClient } from "@libsql/client";
import { hash } from "bcrypt";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function initDb() {
  await client.executeMultiple(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'manager', 'salesgirl'))
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      sku TEXT UNIQUE NOT NULL,
      quantity INTEGER NOT NULL,
      reorderLevel INTEGER NOT NULL,
      price REAL NOT NULL,
      cost REAL NOT NULL,
      category TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sales (
      id TEXT PRIMARY KEY,
      productId TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      total REAL NOT NULL,
      date TEXT NOT NULL,
      salesPersonId TEXT NOT NULL,
      paymentMode TEXT NOT NULL CHECK(paymentMode IN ('POS', 'transfer', 'cash')),
      FOREIGN KEY (productId) REFERENCES products(id),
      FOREIGN KEY (salesPersonId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      date TEXT NOT NULL,
      createdBy TEXT NOT NULL,
      FOREIGN KEY (createdBy) REFERENCES users(id)
    );
  `);

  const adminPassword = await hash("admin123", 10);
  await client.execute({
    sql: `
      INSERT OR IGNORE INTO users (id, email, password, name, role)
      VALUES ('admin1', 'admin@inventory.com', ?, 'Admin User', 'admin')
    `,
    args: [adminPassword],
  });
}

let initPromise: Promise<void> | null = null;
if (!initPromise) {
  initPromise = initDb().catch((e) => {
    console.error("DB init failed:", e);
    throw e;
  });
}

export const db = {
  async all<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    await initPromise;
    const result = await client.execute({ sql, args: params });
    return result.rows as T[];
  },

  async get<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    await initPromise;
    const result = await client.execute({ sql, args: params });
    return (result.rows[0] as T) ?? null;
  },

  async run(sql: string, params: any[] = []): Promise<void> {
    await initPromise;
    await client.execute({ sql, args: params });
  },

  async transaction<T>(fn: (tx: typeof db) => Promise<T>): Promise<T> {
    await initPromise;
    return client.transaction("write", async (tx) => {
      const txDb = {
        all: (sql: string, params: any[] = []) => tx.execute({ sql, args: params }).then((r) => r.rows),
        get: (sql: string, params: any[] = []) => tx.execute({ sql, args: params }).then((r) => r.rows[0] ?? null),
        run: (sql: string, params: any[] = []) => tx.execute({ sql, args: params }),
      };
      return fn(txDb as any);
    });
  },
};

export { client as rawClient };