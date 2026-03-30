import jwt, { type JwtPayload } from "jsonwebtoken";
import { type Request, type Response, type NextFunction } from "express";
import AppError from "../utils/error.js";
import { authenticateUser } from "../models/users.js";
import type { ExtendedError, Socket } from "socket.io";

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
      return next(new AppError("Missing token data", 401));

    const authenticated = await authenticateUser(userId, username);
    if (!authenticated)
      return next(new AppError("Couldn't authenticate user", 401));

    next();
  } catch (err) {
    return next(err);
  }
};

export const authenticateSocket = async (
  socket: Socket,
  next: (err?: ExtendedError) => void,
) => {
  const token = socket.handshake.auth.token;

  if (!token) return next(new Error("Missing token"));

  try {
    const decoded = jwt.verify(token, SECRET) as JwtPayload;
    const { userId, username } = decoded.data;

    if (!userId || !username) return next(new Error("Missing token data"));

    const authenticated = await authenticateUser(userId, username);
    if (!authenticated) return next(new Error("Couldn't authenticate user"));

    socket.data.username = username;
    socket.data.user_id = userId;
    next();
  } catch (err) {
    return next(err as ExtendedError);
  }
};
