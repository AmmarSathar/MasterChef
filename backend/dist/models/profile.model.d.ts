import mongoose, { Document } from "mongoose";
export interface IProfile extends Document {
    authUserId: string;
    email: string;
    name: string;
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
    legacyUserId?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Profile: mongoose.Model<IProfile, {}, {}, {}, mongoose.Document<unknown, {}, IProfile, {}, mongoose.DefaultSchemaOptions> & IProfile & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IProfile>;
//# sourceMappingURL=profile.model.d.ts.map