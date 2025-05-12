// app/src/api/diaries.ts
import axios from 'axios';

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
