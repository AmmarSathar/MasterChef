import mongoose, { Document, Schema } from "mongoose";

export interface IUserSession extends Document {
  tokenHash: string;
  userId: mongoose.Types.ObjectId;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSessionSchema = new Schema<IUserSession>(
  {
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
      expires: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const UserSession = mongoose.model<IUserSession>("UserSession", userSessionSchema);
