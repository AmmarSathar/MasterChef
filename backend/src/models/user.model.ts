import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  name: string;
  passwordHash: string;
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
  },
  {
    timestamps: true,
  }
);

// Prevent password hash from being returned in queries by default
userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.passwordHash;
    delete ret.__v;
    return ret;
  },
});

export const User = mongoose.model<IUser>("User", userSchema);
