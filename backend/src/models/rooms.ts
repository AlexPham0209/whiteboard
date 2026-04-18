import type { DB } from "@/utils/types.js";
import pool from "../db/db.js";
import AppError from "../utils/error.js";

const generateCode = () => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let res = "";
  for (let i = 0; i < 5; i++) {
    res += letters[Math.floor(Math.random() * letters.length)];
  }
  return res;
};

export const createRoom = async (client: DB = pool) => {
  let result = null;

  while (result === null) {
    const code = generateCode();
    try {
      result = await client.query(
        "INSERT INTO rooms (room_code) VALUES ($1) RETURNING id, room_code",
        [code],
      );
    } catch (err: any) {
      // If it's a unique constraint violation (23505), let the loop retry
      if (err.code === "23505") {
        console.log(`Room code ${code} collision, retrying...`);
        continue;
      }
      // If it's any other error (DB down, etc.), throw it so we don't loop forever
      throw new AppError("Failed to create room", 500);
    }
  }

  return result.rows[0];
};

export const roomExists = async (id: string, client: DB = pool) => {
  const result = await client.query("SELECT 1 FROM rooms WHERE id=$1 LIMIT 1", [
    id,
  ]);
  return result.rows.length > 0;
};

export const roomExistsFromCode = async (code: string, client: DB = pool) => {
  const result = await client.query(
    "SELECT 1 FROM rooms WHERE room_code=$1 LIMIT 1",
    [code],
  );
  return result.rows.length > 0;
};

export const deleteRoom = async (id: string, client: DB = pool) => {
  const result = await client.query("DELETE FROM rooms WHERE id=$1", [id]);
};

export const deleteAllRooms = async (client: DB = pool) => {
  // Usually "deleteAll" implies a mass action; we check if anything was actually deleted
  const result = await client.query("DELETE FROM rooms");
};

export const getMembersInRoom = async (room_id: string, client: DB = pool) => {
  try {
    const result = await client.query(
      `SELECT username, users.id as user_id, joined_at 
       FROM members 
       JOIN users ON members.user_id = users.id 
       WHERE members.room_id = $1 
       ORDER BY joined_at ASC`,
      [room_id],
    );
    return result.rows;
  } catch (err: any) {
    // Handle malformed UUIDs for room_id
    if (err.code === "22P02") throw new AppError("Invalid room ID format", 400);

    throw err;
  }
};

export const getMemberCountInRoom = async (id: string, client: DB = pool) => {
  const result = await client.query(
    `SELECT COUNT(*) 
     FROM members 
     WHERE room_id = $1`, // Simplified: joining 'users' isn't needed just for a count
    [id],
  );
  return Number(result.rows[0].count);
};
