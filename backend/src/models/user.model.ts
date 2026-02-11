import mongoose, { Schema, Document } from "mongoose";

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
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    passwordHash: {
      type: String,
      required: [true, "Password hash is required"],
    },
    pfp: { type: String },
    age: { type: Number },
    birth: { type: String },
    weight: { type: Number },
    height: { type: Number },
    bio: { type: String, maxlength: 500 },
    dietary_restric: { type: [String], default: [] },
    allergies: { type: [String], default: [] },
    skill_level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", "expert"],
    },
    cuisines_pref: { type: [String], default: [] },
  },
  {
    timestamps: true,
  }
);

// Prevent password hash from being returned in queries by default
userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    const { passwordHash, __v, ...rest } = ret;
    return rest;
  },
});

export const User = mongoose.model<IUser>("User", userSchema);
