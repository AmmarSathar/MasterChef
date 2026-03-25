import { Request, Response, NextFunction } from "express";
export interface AuthenticatedRequest extends Request {
    session: {
        user: {
            id: string;
            name: string;
            email: string;
            image?: string | null;
            [key: string]: unknown;
        };
        session: {
            id: string;
            userId: string;
            expiresAt: Date;
            [key: string]: unknown;
        };
    };
}
export declare function requireSession(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=auth.middleware.d.ts.map