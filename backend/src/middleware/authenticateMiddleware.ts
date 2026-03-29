import jwt, { type JwtPayload } from "jsonwebtoken";
import { type Request, type Response, type NextFunction } from "express";
import { AppError } from "@/utils/error.js";
import { validateUser } from "@/models/users.js";

// JWT secrets
const SECRET = process.env.SECRET!;
const { sign } = jwt;

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return next(new AppError("Missing token", 401));

  try {
    const decoded = jwt.verify(token, SECRET) as JwtPayload;
    const { userId, username } = decoded.data;
    
    if (!userId || !username)
      return next(new AppError("Invalid username or user id", 401));

    
    const validated = await validateUser(userId, username);
    if (!validated)
      return next(new AppError("Invalid username or user id", 401));

    next();
  } catch (err) {
    return next(err);
  }
};
