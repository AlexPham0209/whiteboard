import AppError from "@/utils/error.js";
import pool from "../db/db.js";

export const addMember = async (user_id: string, room_code: string) => {
  if (room_code.length !== 5) throw new Error("Invalid room code");

  try {
    let users = await pool.query(
      `INSERT INTO members (user_id, room_id) 
      SELECT users.id, rooms.id FROM rooms 
      JOIN users
      ON users.id=$1 AND rooms.room_code=$2
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

export const memberExists = async (user: string, room: string) => {
  try {
    let result = await pool.query(
      `SELECT 1 FROM users 
      JOIN rooms ON room_id = rooms.id 
      WHERE username=$1 AND room_code=$2 
      LIMIT 1`,
      [user, room],
    );

    return result.rows[0].length !== 0;
  } catch (err) {
    throw err;
  }
};

export const removeMember = async (id: string) => {
  try {
    await pool.query("DELETE FROM users WHERE id=$1", [id]);
  } catch (err) {
    throw err;
  }
};

export const removeAllMembers = async () => {
  try {
    await pool.query("DELETE FROM users", []);
  } catch (err) {
    throw err;
  }
};

export const getRoomFromMember = async (id: string) => {
  try {
    await pool.query(
      `SELECT room_code FROM rooms 
      JOIN users ON rooms.id = users.room_id 
      WHERE users.id = $1`,
      [id],
    );
  } catch (err) {
    throw err;
  }
};
