import pool from "./db.js";

export const addUser = async (user: string, room: string) => {
  if (room.length !== 5) throw new Error("Invalid room code");

  try {
    let users = await pool.query(
      "INSERT INTO users (username, room_id) SELECT $1, id FROM rooms WHERE room_code=$2 RETURNING id, username, joined_at",
      [user, room],
    );
    return users.rows[0];
  } catch (e) {
    throw new Error("Unable to create user");
  }
};

export const userExists = async (user: string, room: string) => {
  try {
    let result = await pool.query(
      "SELECT * FROM users JOIN rooms ON room_id = rooms.id WHERE username=$1 AND room_code=$2",
      [user, room],
    );

    return result.rowCount !== null && result.rowCount > 0;
  } catch (e) {
    console.log(e);
    return true;
  }
};

export const removeUser = async (id: string) => {
  try {
    await pool.query("DELETE FROM users WHERE id=$1", [id]);
  } catch (e) {
    console.log(e);
    throw new Error("Failed to delete user");
  }
};

export const removeAllUsers = async () => {
  try {
    await pool.query("DELETE FROM users", []);
  } catch (e) {
    console.log(e);
    throw new Error("Failed to delete user");
  }
};

export const getRoomFromUser = async (id: string) => {
  try {
    await pool.query(
      "SELECT room_code FROM rooms JOIN users ON rooms.id = users.room_id WHERE users.id = $1",
      [id],
    );
  } catch (e) {
    console.log(e);
    throw new Error("Failed to delete user");
  }
};
