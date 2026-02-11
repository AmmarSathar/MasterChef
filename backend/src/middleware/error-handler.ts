import { Request, Response, NextFunction } from "express";
import { ApiError } from "../types/index.js";
import { config } from "../config/index.js";

export function errorHandler(
  err: ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode || (err as any).status || 500;
  const message = err.message || "Internal Server Error";

  console.error("Error:", statusCode, message, err.stack);

  res.status(statusCode).json({
    error: message,
    message: message,
    ...(config.isDev && { stack: err.stack }),
  });
}
