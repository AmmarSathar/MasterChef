import mongoose, { Document } from "mongoose";
export interface IUserSession extends Document {
    tokenHash: string;
    userId: mongoose.Types.ObjectId;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const UserSession: mongoose.Model<IUserSession, {}, {}, {}, mongoose.Document<unknown, {}, IUserSession, {}, mongoose.DefaultSchemaOptions> & IUserSession & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IUserSession>;
//# sourceMappingURL=session.model.d.ts.map