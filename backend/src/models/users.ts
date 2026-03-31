import AppError from "../utils/error.js";
import pool from "../db/db.js";
import type { DB } from "@/utils/types.js";

export const createUser = async (
  username: string,
  password: string,
  client: DB = pool,
) => {
  try {
    const result = await client.query(
      `INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id`,
      [username, password],
    );

    if (result.rows.length === 0)
      throw new AppError("User creation failed", 500);

    return result.rows[0];
  } catch (err: any) {
    // Check for Duplicate Username
    if (err.code === "23505")
      throw new AppError("Username is already taken", 409);

    throw err;
  }
};

export const getUser = async (username: string, client: DB = pool) => {
  try {
    const result = await client.query(
      `SELECT id, password FROM users WHERE username=$1`,
      [username],
    );

    if (result.rows.length === 0)
      throw new AppError("Invalid Username or Password", 401);

    return result.rows[0];
  } catch (err: any) {
    // If the DB is down or query is malformed
    if (err instanceof AppError) throw err;
    throw new AppError("Database connection error", 500);
  }
};

export const userExists = async (username: string, client: DB = pool) => {
  // We don't necessarily need try/catch here because a "not found"
  // isn't an error in this logic—it just returns false.
  const result = await client.query(
    `SELECT 1 FROM users WHERE username=$1 LIMIT 1`,
    [username],
  );
  return result.rows.length > 0;
};

export const authenticateUser = async (
  user_id: string,
  username: string,
  client: DB = pool,
) => {
  try {
    const result = await client.query(
      `SELECT 1 FROM users WHERE id=$1 AND username=$2 LIMIT 1`,
      [user_id, username],
    );
    return result.rows.length > 0;
  } catch (err: any) {
    if (err.code === "22P02")
      throw new AppError("Invalid user identification format", 400);

    throw err;
  }
};

export const removeUser = async (id: string, client: DB = pool) => {
  try {
    const result = await client.query("DELETE FROM users WHERE id=$1", [id]);

    // Optional: Throw if trying to delete a user that doesn't exist
    if (result.rowCount === 0) throw new AppError("User not found", 404);
  } catch (err: any) {
    if (err instanceof AppError) throw err;
    throw new AppError("Failed to delete user", 500);
  }
};
