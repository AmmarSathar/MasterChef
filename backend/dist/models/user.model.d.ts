import mongoose, { Document } from "mongoose";
export interface IUser extends Document {
    email: string;
    name: string;
    passwordHash: string;
    pfp?: string;
    age?: number;
    birth?: string;
    weight?: number;
    height?: number;
    bio?: string;
    dietary_restric?: string[];
    allergies?: string[];
    skill_level?: "beginner" | "intermediate" | "advanced" | "expert";
    cuisines_pref?: string[];
    isCustomized: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, mongoose.DefaultSchemaOptions> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IUser>;
//# sourceMappingURL=user.model.d.ts.map