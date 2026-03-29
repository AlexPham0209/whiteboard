import { type Request, type Response, type NextFunction } from "express";

export const test = async (req: Request, res: Response, next: NextFunction) => {
  res.send("ACCESS");
};
