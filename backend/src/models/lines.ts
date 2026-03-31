import { type Pool, type PoolClient } from "pg";
import pool from "../db/db.js";
import AppError from "../utils/error.js";
import type { DB } from "@/utils/types.js";

export interface Line {
  user_id?: string;
  draw_mode: string;
  color: string;
  brush_size: number;
  points: number[];
}

export const addLine = async (
  user_id: string,
  line: Line,
  db: DB = pool,
) => {
  try {
    // BUG FIX: Changed WHERE members.user_id=$1 to $5
    // $1 is draw_mode, $5 is user_id
    const result = await db.query(
      `INSERT INTO lines (room_id, user_id, draw_mode, color, brush_size, points) 
      SELECT room_id, user_id, $1, $2, $3, $4 
      FROM members
      WHERE members.user_id = $5
      RETURNING *`,
      [line.draw_mode, line.color, line.brush_size, line.points, user_id],
    );

    if (result.rows.length === 0) 
      throw new AppError("Unable to add line. User may not be a member of any room.", 403);
    
    return result.rows;
  } catch (err: any) {
    if (err instanceof AppError) throw err;
    // Handle specific foreign key or data type errors
    if (err.code === '23503') throw new AppError("Room or User no longer exists", 404);
    if (err.code === '22P02') throw new AppError("Invalid data format for line points", 400);
    throw err;
  }
};

export const getCanvas = async (room_id: string, db: DB = pool) => {
  try {
    const result = await db.query(
      `SELECT lines.user_id, lines.draw_mode, lines.color, lines.brush_size, lines.points 
      FROM lines 
      WHERE lines.room_id = $1 
      ORDER BY lines.created_at ASC`,
      [room_id],
    );

    return result.rows as Line[];
  } catch (err: any) {
    if (err.code === '22P02') throw new AppError("Invalid room ID format", 400);
    throw err;
  }
};

export const getCanvasFromCode = async (room_code: string, db: DB = pool) => {
  try {
    const result = await db.query(
      `SELECT lines.user_id, lines.draw_mode, lines.color, lines.brush_size, lines.points 
      FROM lines 
      JOIN rooms ON lines.room_id = rooms.id 
      WHERE rooms.room_code = $1 
      ORDER BY lines.created_at ASC`,
      [room_code],
    );

    return result.rows as Line[];
  } catch (err: any) {
    // If we can't get the canvas, it's usually because the room_code is wrong or DB is down
    throw new AppError("Failed to retrieve canvas data", 500);
  }
};