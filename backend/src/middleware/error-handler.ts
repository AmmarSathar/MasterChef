import { Request, Response, NextFunction } from "express";
import { ApiError } from "../types/index.js";
import { config } from "../config/index.js";

export function errorHandler(
  err: ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    error: message,
    ...(config.isDev && { stack: err.stack }),
  });
}
