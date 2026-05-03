import jwt, { type JwtPayload } from "jsonwebtoken";
import { type Request, type Response, type NextFunction } from "express";
import AppError, { createExtendedError } from "../utils/error.js";
import { authenticateUser } from "../models/users.js";
import type { ExtendedError, Socket } from "socket.io";
import { create } from "node:domain";

// JWT secrets
const SECRET = process.env.JWT_SECRET!;
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
      return next(new AppError("Missing token data", 401));

    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return next(new AppError("Token expired", 401));
    } else if (err instanceof jwt.JsonWebTokenError) {
      return next(new AppError("Invalid token", 401));
    }
    return next(err);
  }
};

export const authenticateSocket = async (
  socket: Socket,
  next: (err?: ExtendedError) => void,
) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(createExtendedError("Missing token", 401));
  
  try {
    const decoded = jwt.verify(token, SECRET) as JwtPayload;
    const { userId, username } = decoded.data;

    if (!userId || !username)
      return next(createExtendedError("Missing token data", 401));

    socket.data.username = username;
    socket.data.user_id = userId;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError)
      return next(createExtendedError("Token expired", 401));
    else if (err instanceof jwt.JsonWebTokenError)
      return next(createExtendedError("Invalid token", 401));
    return next(err as ExtendedError);
  }
};
