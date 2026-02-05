import pool from "./db.js";

export interface Line {
  draw_mode: string;
  color: string;
  brush_size: number;
  points: number[];
}

export const addLine = async (username: string, code: string, line: Line) => {
  try {
    const result = await pool.query(
      "INSERT INTO lines (room_id, user_id, mode, color, brush_size, points) SELECT room_id, users.id, $1, $2, $3, $4 FROM users JOIN rooms ON users.room_id = rooms.id WHERE username = $5 AND room_code = $6 RETURNING *",
      [
        line.draw_mode,
        line.color,
        line.brush_size,
        line.points,
        username,
        code,
      ],
    );

    return result.rows;
  } catch (e) {
    console.log(e);
  }
};

export const getCanvas = async (code: string) => {
  try {
    const result = await pool.query(
      "SELECT users.username, lines.mode, lines.color, lines.brush_size, lines.points FROM lines JOIN rooms ON lines.room_id = rooms.id JOIN users ON lines.user_id = users.id WHERE rooms.room_code = $1 ORDER BY lines.created_at ASC;",
      [code],
    );

    return result.rows;
  } catch (e) {
    console.log(e);
  }
};
