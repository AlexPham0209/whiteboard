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
  it("Should create a user successfully", async ({ dbClient }) => {
    const user = await createUser("Alex", "password123", dbClient);
    expect(user).toHaveProperty("id");
  });

  it("Create multiple times", async ({ dbClient }) => {
    try {
      await createUser("Alex", "password123", dbClient);
      await createUser("Alex", "password123", dbClient);
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
    }
  });

  it("Gets user by username", async ({ dbClient }) => {
      const user = await createUser("Alex", "password123", dbClient);
      await expect(getUser("Alex", dbClient)).resolves.toEqual(
        expect.objectContaining({
          id: user.id,
          password: "password123",
        }),
      );
  });
  
  it("Throw error for non-existent user", async ({ dbClient }) => {
    try {
      await getUser("Alex", dbClient);
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect(err as AppError).toHaveProperty("message", "Invalid Username or Password");
      expect(err as AppError).toHaveProperty("status", 401);
    }
  });

  
});
