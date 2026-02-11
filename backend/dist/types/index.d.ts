import { Request, Response, NextFunction } from "express";
export interface ApiError extends Error {
    statusCode?: number;
}
export type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;
export interface CreateUserInput {
    email: string;
    password: string;
    name: string;
}
export interface UserResponse {
    id: string;
    email: string;
    name: string;
}
//# sourceMappingURL=index.d.ts.map