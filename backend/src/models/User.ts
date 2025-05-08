// File: backend/src/models/User.ts

import { Schema, model } from 'mongoose'

interface IUser {
  username: string
  password: string
  email?: string
  color?: string
}

const userSchema = new Schema<IUser>({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  email: {type: String },
  color: {type: String}
}, { timestamps: true })

export default model<IUser>('User', userSchema)
