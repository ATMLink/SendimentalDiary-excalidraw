// backend/src/models/Tag.ts
import { Schema, model } from 'mongoose'

export interface ITag {
  name: string
}

const tagSchema = new Schema<ITag>({
  name: { type: String, required: true, unique: true },
})

export default model<ITag>('Tag', tagSchema)
