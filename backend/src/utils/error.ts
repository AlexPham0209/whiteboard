import type { ExtendedError } from "socket.io";

export default class AppError extends Error {
  public status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export const createExtendedError = (message: string, status: number) => {
  const error: ExtendedError = new Error(message);
  error.data = { status };
  return error;
};
