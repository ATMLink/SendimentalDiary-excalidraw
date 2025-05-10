// app/src/api/auth.ts
import api from '../lib/axios'

export interface User {
    _id: string
    username: string
    email: string
    color: string
  }
// 登录：返回 { token: string }
export function loginApi(data: { username: string; password: string }) {
  return api.post<{ token: string }>('/auth/login', data).then(res => res.data)
}

// 获取当前登录用户信息：返回 { id, username, email, color }
export function fetchMeApi() {
  return api.get<User>('/auth/me').then(res => res.data)
}

// 定义 User 类型

