import { describe, it, expect, vi, beforeEach } from "vitest";
import AppError from "../src/utils/error.js";

// Mock the pool BEFORE importing users
vi.mock("../src/db/db.js", () => ({
  default: {
    query: vi.fn(),
  },
}));

import pool from "../src/db/db.js";
import {
  createUser,
  getUser,
  userExists,
  authenticateUser,
  removeUser,
} from "../src/models/users.js";

beforeEach(() => {
  vi.clearAllMocks(); // Reset mock state before each test
});

const query = (pool.query as unknown as ReturnType<typeof vi.fn>);

describe("Users Model Tests", () => {
  it("should create a user successfully", async () => {
    query.mockResolvedValueOnce({
      rows: [{ id: 1 }],
    });
    
    const result = await createUser("Alex", "password123");
    
    expect(result).toEqual({ id: 1 });
    expect(pool.query).toHaveBeenCalledWith(
      `INSERT INTO users (username, password) 
      VALUES ($1, $2)
      RETURNING id`,
      ["Alex", "password123"]
    );
  });

  it("should throw AppError if no rows returned", async () => {
    query.mockResolvedValueOnce({
      rows: [],
    });

    await expect(createUser("Alex", "password123")).rejects.toThrow(AppError);
  });


  it("should get a user successfully", async () => {
    query.mockResolvedValueOnce({
      rows: [{ id: 1, password: "hashedpw" }],
    });

    const result = await getUser("Alex");
    expect(result).toEqual({ id: 1, password: "hashedpw" });
    expect(pool.query).toHaveBeenCalledWith(
      `SELECT id, password FROM users
      WHERE username=$1`,
      ["Alex"]
    );
  });

  it("should throw AppError if user not found", async () => {
    query.mockResolvedValueOnce({
      rows: [],
    });

    await expect(getUser("Alex")).rejects.toThrow(AppError);
  });

  it("should return true if user exists", async () => {
    query.mockResolvedValueOnce({
      rows: [{ "1": 1 }],
    });

    const exists = await userExists("Alex");
    expect(exists).toBe(true);
  });

  it("should return false if user does not exist", async () => {
    query.mockResolvedValueOnce({
      rows: [],
    });

    const exists = await userExists("Alex");
    expect(exists).toBe(false);
  });


  it("should authenticate user successfully", async () => {
    query.mockResolvedValueOnce({
      rows: [{ "1": 1 }],
    });

    const auth = await authenticateUser("1", "Alex");
    expect(auth).toBe(true);
  });

  it("should fail authentication if no match", async () => {
    query.mockResolvedValueOnce({
      rows: [],
    });

    const auth = await authenticateUser("1", "Alex");
    expect(auth).toBe(false);
  });

  it("should remove a user successfully", async () => {
    query.mockResolvedValueOnce({});

    await removeUser("1");

    expect(pool.query).toHaveBeenCalledWith(
      "DELETE FROM users WHERE id=$1",
      ["1"]
    );
  });
});