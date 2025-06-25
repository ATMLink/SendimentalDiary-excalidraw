// backend/src/models/Wish.ts
import { Schema, model, Types, Document } from 'mongoose';

// 定义愿望清单的数据结构接口
export interface IWish extends Document {
  content: string;
  createdBy: Types.ObjectId;
  fulfilledBy?: Types.ObjectId;
  status: 'pending' | 'fulfilled';
//   priority: 'high' | 'medium' | 'low';
  note?: string;
//   sortOrder: number;
}

// 创建 Mongoose Schema
const wishSchema = new Schema<IWish>({
  content: { type: String, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  fulfilledBy: { type: Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['pending', 'fulfilled'], default: 'pending' },
//   priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  note: { type: String },
//   sortOrder: { type: Number, default: 0 },
}, { timestamps: true });

// 导出模型
export default model<IWish>('Wish', wishSchema);