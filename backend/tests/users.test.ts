import { describe, it, expect, beforeEach, afterEach } from "vitest";
import AppError from "../src/utils/error.js";

import pool from "../src/db/db.js";
import {
  createUser,
  getUser,
  userExists,
  authenticateUser,
  removeUser,
} from "../src/models/users.js";

import { PoolClient } from "pg";

describe("Users Model Tests", () => {
  it("should create a user successfully", async ({ dbClient }) => {
    await createUser("Alex", "password123", dbClient);
  });

  it("Create multiple times", async ({ dbClient }) => {
    await createUser("Alex", "password123", dbClient);
  });

  it("Create multiple times", async ({ dbClient }) => {
    await createUser("Alex", "password123", dbClient);
  });

  it("Create multiple times", async () => {
    expect(1 + 2).toBe(3);
  });
});
