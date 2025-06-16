// app/src/api/tags.ts
import api from '../lib/axios';

// 获取所有不重复的标签名
export const getTags = async (): Promise<string[]> => {
  const { data } = await api.get('/tags');
  return data;
};