import { createUser, getUser, userExists } from "../models/users.js";
import AppError from "../utils/error.js";
import { type Request, type Response, type NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Number of salt rounds for hashing
const SALT_ROUNDS =
  process.env.SALT_ROUNDS !== undefined ? Number(process.env.SALT_ROUNDS) : 12;

// JWT secrets
const SECRET = process.env.SECRET;
const { sign } = jwt;

// Register
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password)
    return next(new AppError("Username and password are required", 400));

  try {
    const exists = await userExists(username);

    if (exists) return next(new AppError("User already exists", 409));

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const result = await createUser(username, hash);

    const token = sign(
      {
        data: { userId: result.id, username: username },
      },
      SECRET!,
      { expiresIn: "1h" },
    );

    res.status(201).json({ success: true, token: token });
  } catch (err) {
    return next(err);
  }
};

// Login
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password)
    return next(new AppError("Username and password are required", 400));

  try {
    const result = await getUser(username);
    const user_id = result.id;
    const hashed_password = result.password;

    const same = await bcrypt.compare(password, hashed_password);

    if (same) {
      const token = sign(
        {
          data: { userId: user_id, username: username },
        },
        SECRET!,
        { expiresIn: "1h" },
      );

      res.status(200).json({ success: true, token: token });
    } else {
      return next(new AppError("Invalid Username or Password", 401));
    }
  } catch (err) {
    return next(err);
  }
};
