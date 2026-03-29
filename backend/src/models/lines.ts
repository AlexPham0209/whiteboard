import pool from "../db/db.js";

export interface Line {
  draw_mode: string;
  color: string;
  brush_size: number;
  points: number[];
}

export const addLine = async (user_id: string, line: Line) => {
  try {
    const result = await pool.query(
      `INSERT INTO lines (room_id, user_id, draw_mode, color, brush_size, points) 
      SELECT room_id, user_id, $1, $2, $3, $4 
      FROM members
      WHERE members.user_id=$1
      RETURNING *`,
      [line.draw_mode, line.color, line.brush_size, line.points, user_id],
    );

    return result.rows;
  } catch (e) {
    console.log(e);
  }
};

export const getCanvas = async (room_id: string) => {
  try {
    const result = await pool.query(
      `SELECT lines.user_id, lines.draw_mode, lines.color, lines.brush_size, lines.points 
      FROM lines 
      WHERE lines.room_id = $1 
      ORDER BY lines.created_at ASC`,
      [room_id],
    );

    return result.rows as Line[];
  } catch (e) {
    throw e;
  }
};


export const getCanvasFromCode = async (room_code: string) => {
  try {
    const result = await pool.query(
      `SELECT lines.user_id, lines.draw_mode, lines.color, lines.brush_size, lines.points 
      FROM lines 
      JOIN rooms ON lines.room_id = rooms.id 
      WHERE rooms.room_code=$1 
      ORDER BY lines.created_at ASC`,
      [room_code],
    );

    return result.rows as Line[];
  } catch (e) {
    console.log(e);
    return new Error("Failed to get canvas");
  }
};

