// app/src/lib/axios.ts
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000/api', // 根据你的后端地址调整
})

// 请求拦截：自动带上 token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, (error) => {
    return Promise.reject(error)
})

export default api
