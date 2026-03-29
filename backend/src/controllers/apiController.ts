import { createRoom } from "../models/rooms.js";
import { type Request, type Response, type NextFunction } from "express";

export const test = async (req: Request, res: Response, next: NextFunction) => {
  res.send("ACCESS");
};

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { room_code } = await createRoom();
    res.status(200).json({success: true, room_code: room_code});
  } catch (err) {
    return next(err);
  }
}; 
