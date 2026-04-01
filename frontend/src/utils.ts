import { isAxiosError } from "axios";

export const handleError = (
  error: unknown,
  setError: (message: string) => void,
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