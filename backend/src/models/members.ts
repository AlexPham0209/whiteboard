import AppError from "../utils/error.js";
import pool from "../db/db.js";
import type { DB } from "@/utils/types.js";

export const addMember = async (
  user_id: string,
  room_code: string,
  client: DB = pool,
) => {
  // Use AppError for consistency with your global handler
  if (room_code.length !== 5)
    throw new AppError("Invalid room code format", 400);

  try {
    const result = await client.query(
      `INSERT INTO members (user_id, room_id) 
       SELECT $1, rooms.id FROM rooms 
       WHERE rooms.room_code = $2
       RETURNING id, room_id`,
      [user_id, room_code],
    );

    // If result is empty, it means the room_code didn't match any room
    if (result.rows.length === 0)
      throw new AppError("Room not found or unable to join", 404);

    return result.rows[0];
  } catch (err: any) {
    if (err instanceof AppError) throw err;

    // Check for Unique Violation (e.g., user already in this room)
    if (err.code === "23505")
      throw new AppError("User is already a member of this room", 409);

    // Check for Foreign Key Violation (e.g., invalid user_id)
    if (err.code === "23503")
      throw new AppError("Invalid user identification", 400);

    throw new AppError("Failed to add member to room", 500);
  }
};

export const getMember = async (user_id: string, client: DB = pool) => {
  try {
    const result = await client.query(
      `SELECT id, room_id FROM members
      WHERE members.user_id=$1`,
      [user_id],
    );

    // If result is empty, it means the room_code didn't match any room
    if (result.rowCount === 0) return null;

    return result.rows[0];
  } catch (err: any) {
    throw err;
  }
};

export const memberExists = async (
  username: string,
  room_code: string,
  client: DB = pool,
) => {
  const result = await client.query(
    `SELECT 1 FROM members 
     JOIN rooms ON members.room_id = rooms.id 
     JOIN users ON members.user_id = users.id
     WHERE users.username = $1 AND rooms.room_code = $2 
     LIMIT 1`,
    [username, room_code],
  );

  return result.rows.length > 0;
};

export const removeMember = async (id: string, client: DB = pool) => {
  const result = await client.query("DELETE FROM members WHERE id = $1", [id]);
};


export const removeMemberFromUserID = async (id: string, client: DB = pool) => {
  const result = await client.query("DELETE FROM members WHERE user_id = $1", [id]);
};

export const removeAllMembers = async (client: DB = pool) => {
  await client.query("DELETE FROM members");
};

export const getRoomFromMember = async (
  membership_id: string,
  client: DB = pool,
) => {
  try {
    const result = await client.query(
      `SELECT rooms.id, rooms.room_code FROM rooms 
       JOIN members ON rooms.id = members.room_id 
       WHERE members.id = $1`,
      [membership_id],
    );

    if (result.rows.length === 0)
      throw new AppError("Membership not found", 404);

    return result.rows[0];
  } catch (err: any) {
    if (err instanceof AppError) throw err;
    if (err.code === "22P02") throw new AppError("Invalid ID format", 400);
    throw err;
  }
};