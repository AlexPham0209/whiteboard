import {
  authenticateUser,
  createUser,
  getUser,
  userExists,
} from "../models/users.js";
import AppError from "../utils/error.js";
import { type Request, type Response, type NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { generateAccessToken, generateRefreshToken } from "@/utils/tokens.js";

// Number of salt rounds for hashing
const SALT_ROUNDS =
  process.env.SALT_ROUNDS !== undefined ? Number(process.env.SALT_ROUNDS) : 12;

// JWT secrets
console.log("JWT_SECRET:", process.env.JWT_SECRET);
console.log("JWT_REFRESH_SECRET:", process.env.JWT_REFRESH_SECRET);
console.log("JWT_EXPIRATION:", process.env.JWT_EXPIRATION);
console.log("JWT_REFRESH_EXPIRATION:", process.env.JWT_REFRESH_EXPIRATION);

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
    const user = { userId: result.id, username: username };

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res
      .status(200)
      .cookie("refresh_token", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .json({ success: true, accessToken: accessToken });
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
    const user = { userId: user_id, username: username };

    if (same) {
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      res
        .status(200)
        .cookie("refresh_token", refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        })
        .json({ success: true, accessToken: accessToken });
    } else {
      return next(new AppError("Invalid Username or Password", 401));
    }
  } catch (err) {
    return next(err);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const refreshToken = req.cookies.refresh_token;
  if (!refreshToken) return next(new AppError("Missing refresh token", 401));

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET!,
    ) as JwtPayload;
    const { userId, username } = decoded.data;

    if (!userId || !username)
      return next(new AppError("Missing token data", 401));

    const authenticated = await authenticateUser(userId, username);
    if (!authenticated)
      return next(new AppError("Couldn't authenticate user", 401));

    const user = { userId, username };
    const newAccessToken = generateAccessToken(user);
    res.status(200).json({ success: true, accessToken: newAccessToken });
  } catch (err) {
    console.log(err);
    return next(err);
  }
};
