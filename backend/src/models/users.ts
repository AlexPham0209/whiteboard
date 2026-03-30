import AppError from "../utils/error.js";
import pool from "../db/db.js";
import type { Pool, PoolClient } from "pg";
import type { DB } from "@/utils/types.js";

export const createUser = async (
  username: string,
  password: string,
  client: DB = pool,
) => {
  try {
    let result = await client.query(
      `INSERT INTO users (username, password) 
      VALUES ($1, $2)
      RETURNING id`,
      [username, password],
    );

    if (result.rows.length === 0)
      throw new AppError("Couldn't create users", 400);

    return result.rows[0];
  } catch (err) {
    throw err;
  }
};

export const getUser = async (username: string, client: DB = pool) => {
  try {
    let result = await client.query(
      `SELECT id, password FROM users
      WHERE username=$1`,
      [username],
    );

    if (result.rows.length === 0)
      throw new AppError("Invalid Username or Password", 401);

    return result.rows[0];
  } catch (err) {
    throw err;
  }
};

export const userExists = async (username: string, client: DB = pool) => {
  try {
    let result = await client.query(
      `SELECT 1 FROM users 
      WHERE username=$1 
      LIMIT 1`,
      [username],
    );

    return result.rows.length > 0;
  } catch (err) {
    throw err;
  }
};

export const authenticateUser = async (
  user_id: string,
  username: string,
  client: DB = pool,
) => {
  try {
    let result = await client.query(
      `SELECT 1 FROM users 
      WHERE id=$1 AND username=$2 
      LIMIT 1`,
      [user_id, username],
    );

    return result.rows.length > 0;
  } catch (err) {
    throw err;
  }
};

export const removeUser = async (id: string, client: DB = pool) => {
  try {
    await client.query("DELETE FROM users WHERE id=$1", [id]);
  } catch (err) {
    throw err;
  }
};
