import { Schema, model } from "mongoose";

export interface IUserSchema {
  name: string;
  email: string;
  DateOfBirth: Date;
}

const UserSchema = new Schema<IUserSchema>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    DateOfBirth: { type: Date, required: true },
  },
  { timestamps: true }
);

export default model("User", UserSchema);
