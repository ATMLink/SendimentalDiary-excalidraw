import api from '../lib/axios';
import type { User } from '../types/user';

// Wish 类型已简化
export interface Wish {
  _id: string;
  content: string;
  createdBy: User;
  fulfilledBy?: User;
  status: 'pending' | 'fulfilled'; // 移除了 'archived'
  note?: string;
  createdAt: string;
  updatedAt: string;
}

// 负载类型已简化
export type UpdateWishPayload = {
  status?: 'fulfilled';
  note?: string;
  fulfilledBy?: string;
};

export const getWishes = (status: 'pending' | 'fulfilled'): Promise<Wish[]> => {
  return api.get(`/wishes?status=${status}`).then(res => res.data);
};

// 创建愿望的负载已简化
export const createWish = (data: { content: string; note?: string }): Promise<Wish> => {
  return api.post('/wishes', data).then(res => res.data);
};

export const updateWish = (id: string, data: UpdateWishPayload): Promise<Wish> => {
  return api.put(`/wishes/${id}`, data).then(res => res.data);
};