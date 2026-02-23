import type { Request, Response } from "express";
export declare function clearSessionCookie(res: Response): void;
export declare function createSessionForUser(res: Response, userId: string, rememberMe: boolean): Promise<void>;
export declare function resolveSessionUser(req: Request): Promise<(import("mongoose").Document<unknown, {}, import("../models/user.model.js").IUser, {}, import("mongoose").DefaultSchemaOptions> & import("../models/user.model.js").IUser & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}) | null>;
export declare function revokeSession(req: Request, res: Response): Promise<void>;
//# sourceMappingURL=session.d.ts.map