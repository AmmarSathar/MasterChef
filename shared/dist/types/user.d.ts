export interface User {
    id: string;
    email: string;
    name: string;
    pfp?: string[];
    age: number;
    birth?: string | number;
    weight?: number;
    height?: number;
    bio?: string;
    dietary_restric?: string[];
    allergies?: string[];
    skill_level?: "beginner" | "intermediate" | "advanced" | "expert";
    cuisines_pref: string[];
    createdAt?: Date;
    updatedAt?: Date;
}
export interface UserCredentials {
    email: string;
    password: string;
}
export interface UserProfile {
    id: string;
    email: string;
    name: string;
}
//# sourceMappingURL=user.d.ts.map