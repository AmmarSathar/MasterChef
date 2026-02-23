import mongoose from "mongoose";
import { CreateUserInput, LoginUserInput, UpdateProfileInput, UserResponse } from "../types/index.js";
interface UserLike {
    _id: mongoose.Types.ObjectId | string;
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
    createdAt: Date;
    updatedAt: Date;
}
export declare function toUserResponse(user: UserLike): UserResponse;
export declare function registerUser(input: CreateUserInput): Promise<UserResponse>;
export declare function loginUser(input: LoginUserInput): Promise<UserResponse>;
export declare function updateUserProfile(input: UpdateProfileInput): Promise<UserResponse>;
export {};
//# sourceMappingURL=auth.service.d.ts.map