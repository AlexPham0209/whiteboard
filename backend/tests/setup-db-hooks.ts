// tests/setup-db-hooks.ts
import { beforeEach, afterEach } from "vitest";
import pool from "../src/db/db.js";
import { PoolClient } from "pg";

declare module "vitest" {
  export interface TestContext {
    dbClient: PoolClient;
  }
}

beforeEach(async (context) => {
  const client = await pool.connect();
  await client.query("BEGIN");
  context.dbClient = client;
});

afterEach(async (context) => {
  if (context.dbClient) {
    await context.dbClient.query("ROLLBACK");
    context.dbClient.release();
  }
});