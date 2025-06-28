// app/src/api/moods.ts

import api from '../lib/axios'; // 导入你封装的 axios 实例
import type { User } from '../types/user'; // 导入 User 类型

interface UpdateMoodPayload {
  moodValue: number;
}

// 调用后端接口来手动更新心情值
export const updateMoodApi = async (payload: UpdateMoodPayload): Promise<User> => {
  const { data } = await api.put('/moods/update', payload);
  return data;
};