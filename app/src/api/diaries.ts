// app/src/api/diaries.ts
// import axios from 'axios';
import api from '../lib/axios';
import type { Diary } from '../types/diary';

export function postDiary(formData: FormData){
  // const token = localStorage.getItem('token') || ''; // 从 localStorage 中获取 token
  return api.post('/diaries', formData, {
    headers: {
      // Authorization: `Bearer ${token}`, // 替换成你登录时返回的 token
      'Content-Type': 'multipart/form-data' // 设置请求头为 multipart/form-data
    },
  })
}

export function updateDiary(id: string, formData: FormData){
  // const token = localStorage.getItem('token') || ''; // 从 localStorage 中获取 token
  return api.patch(`/diaries/${id}`, formData, {
    headers: {
      // Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  })
}

export async function fetchDiaryById(id: string) {
  // const token = localStorage.getItem('token') || ''
  const response = await api.get(`/diaries/${id}`);
  return response.data;
}

export interface GetDiariesParams {
  mood?: string;
  tags?: string[];
  search?: string;
}

// app/src/api/diaries.ts

export const getDiaries = async (params: GetDiariesParams = {}): Promise<Diary[]> => {
 console.log('getDiaries function called with params:', params);

 // 1. 使用 URLSearchParams 来构建查询字符串
 const searchParams = new URLSearchParams();

 // 2. 添加其他参数
 if (params.mood) {
  searchParams.append('mood', params.mood);
 }
 if (params.search) {
  searchParams.append('search', params.search);
 }
 
 // 3. 关键：为数组中的每个标签重复添加 'tags' 键
 if (params.tags && params.tags.length > 0) {
  params.tags.forEach(tag => {
   searchParams.append('tags', tag);
  });
 }

 // 4. 使用生成的查询字符串发起请求
 // 此时的 URL 会是 /diaries?tags=work&tags=study (如果选中了这两个标签)
 const { data } = await api.get(`/diaries?${searchParams.toString()}`);
 return data;
};

// 删除日记
export const deleteDiaryApi = async (id: string) => {
  const { data } = await api.delete(`/diaries/${id}`);
  return data;
};