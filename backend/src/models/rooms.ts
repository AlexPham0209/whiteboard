import type { DB } from "@/utils/types.js";
import pool from "../db/db.js";

const generateCode = () => {
  let res = "";
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = 0; i < 5; i++)
    res += letters[Math.floor(Math.random() * (letters.length - 1))];

  return res;
};

export const createRoom = async (client: DB = pool) => {
  let result = null;

  while (result === null) {
    let code = generateCode();
    result = await client
      .query(
        "INSERT INTO rooms (room_code) VALUES ($1) RETURNING id, room_code",
        [code],
      )
      .catch(() => {
        console.log("Room code already exists in the database!");
        return null;
      });
  }

  return result.rows[0];
};

export const roomExists = async (id: string, client: DB = pool) => {
  try {
    const result = await client.query(
      "SELECT 1 FROM rooms WHERE id=$1 LIMIT 1",
      [id],
    );

    return result.rows.length > 0;
  } catch (err) {
    throw err;
  }
};

export const roomExistsFromCode = async (code: string, client: DB = pool) => {
  try {
    const result = await client.query(
      "SELECT 1 FROM rooms WHERE room_code=$1 LIMIT 1",
      [code],
    );

    return result.rows.length > 0;
  } catch (err) {
    throw err;
  }
};

export const deleteRoom = async (id: string, client: DB = pool) => {
  try {
    await client.query("DELETE FROM rooms WHERE id=$1", [id]);
  } catch (err) {
    throw err;
  }
};

export const deleteAllRooms = async (code: string, client: DB = pool) => {
  try {
    await client.query("DELETE FROM rooms WHERE room_code=$1", [code]);
  } catch (err) {
    throw new Error("Unable to delete all rooms");
  }
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
  } catch (err) {
    throw err;  
  }
};

export const getUserCountInRoom = async (id: string, client: DB = pool) => {
  const result = await client.query(
    `SELECT COUNT(*) 
    FROM members 
    JOIN users ON members.user_id = users.id 
    WHERE members.room_id = $1`,
    [id],
  );

  return Number(result.rows[0].count);
};
