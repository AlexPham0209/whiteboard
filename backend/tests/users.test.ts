import { describe, it, expect, beforeEach, afterEach } from "vitest";
import AppError from "../src/utils/error.js";

import {
  createUser,
  getUser,
  userExists,
  authenticateUser,
  removeUser,
} from "../src/models/users.js";

import { PoolClient } from "pg";
import { dbTest } from "./contexts/dbTestContext.js";

describe("Users Model Tests", () => {
  dbTest("Should create a user successfully", async ({ dbClient }) => {
    const user = await createUser("Alex", "password123", dbClient);
    expect(user).toHaveProperty("id");
  });

  dbTest("Create multiple times", async ({ dbClient }) => {
    try {
      await createUser("Alex", "password123", dbClient);
      await createUser("Alex", "password123", dbClient);
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
    }
  });

  dbTest("Gets user by username", async ({ dbClient }) => {
      const user = await createUser("Alex", "password123", dbClient);

      await expect(getUser("Alex", dbClient)).resolves.toEqual(
        expect.objectContaining({
          id: user.id,
          password: "password123",
        }),
      );
  });
  
  dbTest("Throw error for non-existent user", async ({ dbClient }) => {
    try {
      await getUser("Alex", dbClient);
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect(err as AppError).toHaveProperty("message", "Invalid Username or Password");
      expect(err as AppError).toHaveProperty("status", 401);
    }
  });

  dbTest("Check if users exist", async ({ dbClient }) => {
    // Creating test users
    await createUser("Alex", "password123", dbClient);
    await createUser("Test", "password123", dbClient);

    expect(await userExists("Alex", dbClient)).toBe(true);
    expect(await userExists("Test", dbClient)).toBe(true);
    expect(await userExists("NonExistent", dbClient)).toBe(false);
  });

  dbTest("Validate user authentication", async ({ dbClient }) => {
    // Creating test users
    const { id } = await createUser("Alex", "password123", dbClient);
    expect(await authenticateUser(id, "Alex", dbClient)).toBe(true);
    expect(await authenticateUser("dd9f9cf0-61b1-4a97-9e15-a9d59fbefa95", "Alex", dbClient)).toBe(false);
    expect(await authenticateUser(id, "alex", dbClient)).toBe(false);
  });

  dbTest("Check user deletion", async ({ dbClient }) => {
    const { id } = await createUser("Alex", "password123", dbClient);
    await removeUser(id, dbClient);
    expect(await userExists("Alex", dbClient)).toBe(false);
    
    try {
      await removeUser("dd9f9cf0-61b1-4a97-9e15-a9d59fbefa95", dbClient);
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
    }
  });
});
