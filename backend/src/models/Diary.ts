// File: backend/src/routes/diaries.ts
import { Schema, model, Types } from 'mongoose'

export interface IDiary {
  title: string
  mood: string
  content: string
  image?: string[]
  tags: string[]
  user: Types.ObjectId
  status: 'active' | 'pending_deletion';
  deletionRequestedBy?: Types.ObjectId | null;
}

const diarySchema = new Schema<IDiary>({
  title: { type: String, required: true },
  mood: { type: String, required: true },
  content: { type: String, default: '' },
  image: { type: [String], default: [] },
  tags: { type: [String], default: [] },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['active', 'pending_deletion'], default: 'active' },
  deletionRequestedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true })

export default model<IDiary>('Diary', diarySchema)
