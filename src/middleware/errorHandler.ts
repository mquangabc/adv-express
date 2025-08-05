import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const isDevelopment = process.env.NODE_ENV === "development";

  // Log error
  console.error("Error:", err);

  // Default error
  let error = {
    message: err.message || "Internal server error",
    status: err.status || 500,
    stack: isDevelopment ? err.stack : undefined,
  };

  // Specific error handling
  if (err.name === "ValidationError") {
    error.status = 400;
    error.message = err.message;
  }

  if (err.name === "UnauthorizedError") {
    error.status = 401;
    error.message = "Unauthorized";
  }

  if (err.code === "23505") {
    // PostgreSQL unique violation
    error.status = 409;
    error.message = "Resource already exists";
  }

  if (err.code === "23503") {
    // PostgreSQL foreign key violation
    error.status = 400;
    error.message = "Invalid reference";
  }

  // Send error response
  res.status(error.status).json({
    success: false,
    message: error.message,
    ...(isDevelopment && { stack: error.stack }),
  });
};
