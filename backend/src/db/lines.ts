import pool from "./db.js";

export interface Line {
  draw_mode: string;
  color: string;
  brush_size: number;
  points: number[];
}

export const addLine = async (id: string, line: Line) => {
  try {
    const result = await pool.query(
      "INSERT INTO lines (room_id, username, draw_mode, color, brush_size, points) SELECT room_id, username, $1, $2, $3, $4 FROM rooms JOIN users ON rooms.id = users.room_id WHERE users.id=$5 RETURNING *",
      [line.draw_mode, line.color, line.brush_size, line.points, id],
    );

    return result.rows;
  } catch (e) {
    console.log(e);
  }
};

export const getCanvas = async (code: string) => {
  try {
    const result = await pool.query(
      "SELECT lines.username, lines.draw_mode, lines.color, lines.brush_size, lines.points FROM lines JOIN rooms ON lines.room_id = rooms.id WHERE rooms.room_code=$1 ORDER BY lines.created_at ASC",
      [code],
    );

    return result.rows as Line[];
  } catch (e) {
    console.log(e);
    return new Error("Failed to get canvas");
  }
};

export const getCanvasFromID = async (id: string) => {
  try {
    const result = await pool.query(
      "SELECT lines.username, lines.draw_mode, lines.color, lines.brush_size, lines.points FROM lines JOIN rooms ON lines.room_id = rooms.id JOIN users ON users.room_id = rooms.id WHERE users.id = $1 ORDER BY lines.created_at ASC;",
      [id],
    );

    return result.rows as Line[];
  } catch (e) {
    console.log(e);
    return new Error("Failed to get canvas");
  }
};
