// tests/test-db.ts
import { test as base } from "vitest";
import pool from "../../src/db/db.js";
import { PoolClient } from "pg";

type DbContext = {
  dbClient: PoolClient;
};

export const dbTest = base.extend<DbContext>({
  dbClient: async ({}, use) => {
    const client = await pool.connect();
    await client.query("BEGIN");

    try {
      await use(client);
    } finally {
      await client.query("ROLLBACK");
      client.release();
    }
  },
});
