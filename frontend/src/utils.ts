import { isAxiosError } from "axios";

export class AppError extends Error {
  public status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}



export const handleError = (
  error: unknown,
  setError:
    | React.Dispatch<React.SetStateAction<string>>
    | ((message: string) => void),
) => {
  let message = "An unexpected error occurred";

  if (isAxiosError(error)) {
    // Optional chaining simplifies the check for deeply nested data
    message = error.response?.data?.message || error.message;
  } else if (error instanceof Error) {
    message = error.message;
  }

  console.error("Error caught:", message);
  setError(message);
};
