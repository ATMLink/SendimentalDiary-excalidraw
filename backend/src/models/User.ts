// File: backend/src/models/User.ts

import { Schema, model, Types } from 'mongoose'

interface IUser {
  username: string
  password: string
  email?: string
  color?: string
  partner?: Types.ObjectId;
  moodValue?: number;
}

const userSchema = new Schema<IUser>({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  email: {type: String },
  color: {type: String},
  partner: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  moodValue: { type: Number, default: 80, min: 0, max: 120 },
}, { timestamps: true })

export default model<IUser>('User', userSchema)
