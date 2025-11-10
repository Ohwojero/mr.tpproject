// lib/db.ts
import Database, { Database as DatabaseType } from "better-sqlite3";
import { hash } from "bcrypt";
import path from "path";

const dbPath = path.join(process.cwd(), "data", "inventory.db");
const sqliteDb = new Database(dbPath);

// Initialize database tables
sqliteDb.exec(`
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

// Insert default admin user if not exists
const adminPassword = hash("admin123", 10).then((hashed) => {
  const insertAdmin = sqliteDb.prepare(`
    INSERT OR IGNORE INTO users (id, email, password, name, role)
    VALUES (?, ?, ?, ?, ?)
  `);
  insertAdmin.run('admin1', 'admin@inventory.com', hashed, 'Admin User', 'admin');
});

export const database: {
  all<T = any>(sql: string, params?: any[]): T[];
  get<T = any>(sql: string, params?: any[]): T | null;
  run(sql: string, params?: any[]): void;
  transaction<T>(fn: (tx: typeof database) => T): T;
} = {
  all<T = any>(sql: string, params: any[] = []): T[] {
    const stmt = sqliteDb.prepare(sql);
    return stmt.all(params) as T[];
  },

  get<T = any>(sql: string, params: any[] = []): T | null {
    const stmt = sqliteDb.prepare(sql);
    return (stmt.get(params) as T) ?? null;
  },

  run(sql: string, params: any[] = []): void {
    const stmt = sqliteDb.prepare(sql);
    stmt.run(params);
  },

  transaction<T>(fn: (tx: any) => T): T {
    return sqliteDb.transaction(fn)(sqliteDb);
  },
};

export { sqliteDb as rawClient };
