import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role: "user" | "admin" | "owner";
}
const UserSchema = new Schema<IUser>({
  name: { type: String, requireed: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: { type: String, required: true, minlength: 0 },
  phone: { type: String, trim: true, minlength: 0 },
  role: { type: String, enum: ["user", "admin", "owner"], default: "user" },
},{timestamps:true});

UserSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  },
});

export const User = model<IUser>("User", UserSchema);
