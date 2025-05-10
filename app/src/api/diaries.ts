// app/src/api/diaries.ts
import axios from 'axios';
// import type { DiaryData } from '../types/diary';

// export function postDiary(data: DiaryData) {

//   const token = localStorage.getItem('token'); // 从 localStorage 中获取 token

//   return axios.post('/api/diaries', data, {
//     headers: {
//       Authorization: `Bearer ${token}` // 替换成你登录时返回的 token
//     }
//   });
// }

export function postDiary(formData: FormData){
  const token = localStorage.getItem('token') || ''; // 从 localStorage 中获取 token
  return axios.post('/api/diaries', formData, {
    headers: {
      Authorization: `Bearer ${token}`, // 替换成你登录时返回的 token
      'Content-Type': 'multipart/form-data' // 设置请求头为 multipart/form-data
    },
  })
}