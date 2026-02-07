import pool from "./db.js";

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

  return result.rows;
};

export const roomExists = async (code: string) => {
  const result = await pool.query("SELECT * FROM rooms WHERE room_code=$1", [
    code,
  ]);
  return result.rowCount !== null && result.rowCount > 0;
};

export const deleteRoom = async (code: string) => {
  await pool.query("DELETE FROM rooms WHERE room_code=$1", [code]);
};

export const deleteAllRooms = async (code: string) => {
  await pool.query("DELETE FROM rooms", [code]);
};

export const getUsersInRoom = async (code: string) => {
  const result = await pool.query(
    "SELECT username, joined_at FROM users JOIN rooms ON users.room_id = rooms.id WHERE rooms.room_code = $1 ORDER BY joined_at ASC",
    [code],
  );

  return result.rows;
};

export const getUserCountInRoom = async (code: string) => {
  const result = await pool.query(
    "SELECT COUNT(*) FROM users JOIN rooms ON users.room_id = rooms.id WHERE rooms.room_code = $1",
    [code],
  );

  return Number(result.rows[0].count);
};
