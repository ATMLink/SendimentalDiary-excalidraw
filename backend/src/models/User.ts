// File: backend/src/models/User.ts

import { Schema, model, Types } from 'mongoose'

interface IUser {
  username: string
  password: string
  email?: string
  color?: string
  partner?: Types.ObjectId;
}

const userSchema = new Schema<IUser>({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  email: {type: String },
  color: {type: String},
  partner: { type: Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true })

export default model<IUser>('User', userSchema)
