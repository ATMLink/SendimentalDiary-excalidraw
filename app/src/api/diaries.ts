// app/src/api/diaries.ts
import axios from 'axios';
import api from '../lib/axios';
import type { Diary } from '../types/diary';

export function postDiary(formData: FormData){
  const token = localStorage.getItem('token') || ''; // 从 localStorage 中获取 token
  return axios.post('/api/diaries', formData, {
    headers: {
      Authorization: `Bearer ${token}`, // 替换成你登录时返回的 token
      'Content-Type': 'multipart/form-data' // 设置请求头为 multipart/form-data
    },
  })
}

export function updateDiary(id: string, formData: FormData){
  const token = localStorage.getItem('token') || ''; // 从 localStorage 中获取 token
  return axios.patch(`/api/diaries/${id}`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  })
}

export async function fetchDiaryById(id: string) {
  const token = localStorage.getItem('token') || ''
  const res = await fetch(`/api/diaries/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return res.json()
}

export interface GetDiariesParams {
  mood?: string;
  tag?: string;
  search?: string;
}

export const getDiaries = async (params: GetDiariesParams = {}): Promise<Diary[]> => {
  // 使用 axios 的 params 选项来传递查询参数
  const { data } = await api.get('/diaries', { params });
  return data;
};