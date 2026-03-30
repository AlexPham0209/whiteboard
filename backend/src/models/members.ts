import AppError from "../utils/error.js";
import pool from "../db/db.js";
import type { DB } from "@/utils/types.js";

export const addMember = async (
  user_id: string,
  room_code: string,
  client: DB = pool,
) => {
  if (room_code.length !== 5) throw new Error("Invalid room code");

  try {
    let users = await client.query(
      `INSERT INTO members (user_id, room_id) 
      SELECT $1, rooms.id FROM rooms 
      WHERE rooms.room_code=$2
      RETURNING id, room_id`,
      [user_id, room_code],
    );

    if (users.rows.length === 0)
      throw new AppError("Unable to create room", 400);

    return users.rows[0];
  } catch (err) {
    throw err;
  }
};

export const memberExists = async (
  user: string,
  room: string,
  client: DB = pool,
) => {
  try {
    let result = await client.query(
      `SELECT 1 FROM members 
      JOIN rooms ON room_id = rooms.id 
      JOIN users ON user_id = users.id
      WHERE users.username=$1 AND rooms.room_code=$2 
      LIMIT 1`,
      [user, room],
    );

    if (result.rows.length === 0) return false;

    return result.rows[0].length !== 0;
  } catch (err) {
    throw err;
  }
};

export const removeMember = async (id: string, client: DB = pool) => {
  try {
    await client.query("DELETE FROM members WHERE id=$1", [id]);
  } catch (err) {
    throw err;
  }
};

export const removeAllMembers = async (client: DB = pool) => {
  try {
    await client.query("DELETE FROM users", []);
  } catch (err) {
    throw err;
  }
};

export const getRoomFromMember = async (id: string, client: DB = pool) => {
  try {
    const result = await client.query(
      `SELECT rooms.id, rooms.room_code FROM rooms 
      JOIN members ON rooms.id = members.room_id 
      WHERE members.id = $1`,
      [id],
    );
    return result.rows[0];
  } catch (err) {
    throw err;
  }
};
