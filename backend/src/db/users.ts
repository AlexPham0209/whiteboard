import pool from "./db.js";

export const addUser = async (user: string, room: string) => {
  if (room.length !== 5) throw "Room code must be 5 characters long";

  try {
    let users = await pool.query(
      "INSERT INTO users (username, room_id) SELECT $1, id FROM rooms WHERE room_code=$2 RETURNING *",
      [user, room],
    );
    if (users.rowCount === null || users.rowCount === 0) throw "Room not found";

    return users.rows;
  } catch (e) {
    throw "User must not already exist";
  }
};

export const userExists = async (user: string, room: string) => {
  let result = await pool.query(
    "SELECT * FROM users WHERE username=$1 AND room_code=$2",
    [user, room],
  );

  return result.rowCount !== null && result.rowCount > 0;
};

export const removeUser = async (user: string) => {
  await pool.query("DELETE FROM users WHERE username=$1", [user]);
};
