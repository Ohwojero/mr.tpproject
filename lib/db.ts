// lib/db.ts
import { createClient } from '@libsql/client';
import { hashSync } from "bcrypt";
import path from "path";

let libsqlClient: any = null;

async function getDb() {
  if (!libsqlClient) {
    const dbUrl = process.env.NODE_ENV === 'production' ? ':memory:' : `file:${path.join(process.cwd(), "data", "inventory.db")}`;
    libsqlClient = createClient({ url: dbUrl });

    // Initialize database tables
    await libsqlClient.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('admin', 'manager', 'salesgirl'))
      );
    `);

    await libsqlClient.execute(`
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
    `);

    await libsqlClient.execute(`
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
    `);

    await libsqlClient.execute(`
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
    const adminPassword = hashSync("admin123", 10);
    await libsqlClient.execute(`
      INSERT OR IGNORE INTO users (id, email, password, name, role)
      VALUES (?, ?, ?, ?, ?)
    `, ['admin1', 'admin@inventory.com', adminPassword, 'Admin User', 'admin']);

    // Insert sample products if not exists
    await libsqlClient.execute(`
      INSERT OR IGNORE INTO products (id, name, sku, quantity, reorderLevel, price, cost, category)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, ['prod1', 'Sample Product 1', 'SKU001', 100, 10, 50.00, 30.00, 'Electronics']);

    await libsqlClient.execute(`
      INSERT OR IGNORE INTO products (id, name, sku, quantity, reorderLevel, price, cost, category)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, ['prod2', 'Sample Product 2', 'SKU002', 200, 20, 25.00, 15.00, 'Clothing']);

    await libsqlClient.execute(`
      INSERT OR IGNORE INTO products (id, name, sku, quantity, reorderLevel, price, cost, category)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, ['prod3', 'Sample Product 3', 'SKU003', 150, 15, 75.00, 45.00, 'Home Goods']);
  }
  return libsqlClient;
}

export const database: {
  all<T = any>(sql: string, params?: any[]): Promise<T[]>;
  get<T = any>(sql: string, params?: any[]): Promise<T | null>;
  run(sql: string, params?: any[]): Promise<void>;
  transaction<T>(fn: (tx: typeof database) => Promise<T>): Promise<T>;
} = {
  async all<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    try {
      const client = await getDb();
      const result = await client.execute({ sql, args: params });
      return result.rows as T[];
    } catch (error) {
      console.error('Database all() error:', error, 'SQL:', sql, 'Params:', params);
      throw error;
    }
  },

  async get<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    try {
      const client = await getDb();
      const result = await client.execute({ sql, args: params });
      return (result.rows[0] as T) ?? null;
    } catch (error) {
      console.error('Database get() error:', error, 'SQL:', sql, 'Params:', params);
      throw error;
    }
  },

  async run(sql: string, params: any[] = []): Promise<void> {
    try {
      const client = await getDb();
      await client.execute({ sql, args: params });
    } catch (error) {
      console.error('Database run() error:', error, 'SQL:', sql, 'Params:', params);
      throw error;
    }
  },

  async transaction<T>(fn: (tx: typeof database) => Promise<T>): Promise<T> {
    try {
      const client = await getDb();
      await client.execute('BEGIN');
      try {
        const result = await fn(database);
        await client.execute('COMMIT');
        return result;
      } catch (error) {
        await client.execute('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('Database transaction() error:', error);
      throw error;
    }
  },
};

// Database will be initialized lazily on first access
export { getDb as rawClient };
