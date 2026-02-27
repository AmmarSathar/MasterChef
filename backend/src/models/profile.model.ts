import mongoose, { Document, Schema } from "mongoose";

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

const profileSchema = new Schema<IProfile>(
  {
    authUserId: {
      type: String,
      required: [true, "Auth user ID is required"],
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
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
    isCustomized: { type: Boolean, default: false },
    legacyUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

profileSchema.set("toJSON", {
  transform: (_doc, ret) => {
    const { __v, ...rest } = ret;
    return rest;
  },
});

export const Profile = mongoose.model<IProfile>("Profile", profileSchema);
