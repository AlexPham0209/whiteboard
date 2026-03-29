import pool from "../db/db.js";

const generateCode = () => {
  let res = "";
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = 0; i < 5; i++)
    res += letters[Math.floor(Math.random() * (letters.length - 1))];

  return res;
};

export const createRoom = async () => {
  let result = null;

  while (result === null) {
    let code = generateCode();
    result = await pool
      .query("INSERT INTO rooms (room_code) VALUES ($1) RETURNING room_code", [
        code,
      ])
      .catch((err) => {
        console.log("Room code already exists in the database!");
        return null;
      });
  }

  return result.rows[0];
};

export const roomExists = async (code: string) => {
  try {
    const result = await pool.query(
      "SELECT 1 FROM rooms WHERE room_code=$1 LIMIT 1",
      [code],
    );

    return result.rows.length > 0;
  } catch (e) {
    return false;
  }
};

export const deleteRoom = async (code: string) => {
  try {
    await pool.query("DELETE FROM rooms WHERE room_code=$1", [code]);
  } catch (e) {
    throw new Error("Unable to delete room");
  }
};

export const deleteAllRooms = async (code: string) => {
  try {
    await pool.query("DELETE FROM rooms", [code]);
  } catch (e) {
    throw new Error("Unable to all rooms");
  }
};

export const getMembersInRoom = async (room_id: string) => {
  const result = await pool.query(
    "SELECT username, joined_at FROM members JOIN users ON members.user_id = users.id WHERE members.room_id = $1 ORDER BY joined_at ASC",
    [room_id],
  );

  return result.rows;
};

export const getUserCountInRoom = async (id: string) => {
  const result = await pool.query(
    "SELECT COUNT(*) FROM members JOIN users ON members.user_id = users.id WHERE members.room_id = $1",
    [id],
  );

  return Number(result.rows[0].count);
};
