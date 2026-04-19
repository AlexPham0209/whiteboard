import jwt from "jsonwebtoken";
import { type StringValue } from "ms";

const { sign } = jwt;

export const generateAccessToken = (user: {
  userId: number;
  username: string;
}) => {
  const expiration: StringValue = (process.env.JWT_EXPIRATION ||
    "1h") as StringValue;
  return sign({ data: user }, process.env.JWT_SECRET!, {
    expiresIn: expiration,
  });
};

export const generateRefreshToken = (user: {
  userId: number;
  username: string;
}) => {
  const expiration: StringValue = (process.env.JWT_REFRESH_EXPIRATION ||
    "7d") as StringValue;
  return sign({ data: user }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: expiration,
  });
};
