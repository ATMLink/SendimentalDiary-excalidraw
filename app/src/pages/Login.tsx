// app/src/pages/Login.tsx
import UserTestPanel from '../components/Tests/UserTestPanel'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'  // 导入 useNavigate
import useUserStore from '../store/user'  // 引入 Zustand 的 store
import { useMutation, useQueryClient } from '@tanstack/react-query'
// import { useMutation } from '@tanstack/react-query'
import { loginApi, fetchMeApi} from '../api/auth'
// import { loginApi} from '../api/auth'
import type {User} from '../api/auth'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()  // 创建 navigate 函数
  const qc = useQueryClient()
  
  // 从 Zustand 获取 `setUser` 函数
  const setUser = useUserStore(state => state.setUser)
  
  // const handleLogin = async () => {
  //   try {
  //     const response = await loginApi(username, password) // 假设你有 loginApi 函数
  //     const { token, user } = response.data
  //     localStorage.setItem('token', token) // 将 token 存入 localStorage
  //     setUser(user) // 更新 user 状态
  //     navigate('/home') // 登录后跳转到 Home 页
  //   } catch (error) {
  //     console.error('Login failed', error)
  //   }
  // }
  // 登录的 mutation
  const loginMutation = useMutation({
    mutationFn: () => loginApi({ username, password }),
    onSuccess: async ({ token }) => {
      try {
        // 保存 token
        localStorage.setItem('token', token)

        // 获取当前用户信息
        const user = await fetchMeApi()
        console.log("fetched user from api:", user)
        // 确保返回的数据包含 user 属性
        if (user) {
          // 更新 Zustand 状态
          setUser(user as User)
          console.log('User data:', user)

          // 可选：在 React Query 缓存中保存 user
          qc.setQueryData(['me'], user)

          // 跳转到主页
          console.log('准备跳转到 /home')
          setTimeout(() => {
            console.log('跳转 home')
            navigate('/home')
          }, 100)
        } else {
          console.error('未能获取用户数据')
          alert('登录成功，但获取用户信息失败')
        }
      } catch (err) {
        console.error('获取用户信息失败', err)
        alert('登录成功但获取用户信息失败')
      }
    },
    onError: () => {
      alert('登录失败，请检查用户名和密码')
    },
  })

  // 登录逻辑
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('提交表单', { username, password })  // ← 新增
    loginMutation.mutate()
  }

  return (
    <div 
      className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-pink-400 to-blue-400"
      style={{backgroundImage: 'url(/triangle-power-theme.jpg)',backgroundSize: 'cover', backgroundPosition: 'center'}}
    >
      <div className="p-8 bg-white/20 backdrop-blur-md rounded-xl shadow-lg w-full max-w-sm mx-4">
          <h1 className="title-zelda">
              ZeldaDiary
              </h1>
          <form className="flex flex-col gap-4" onSubmit={handleLogin}>
              <input
                  type="text"
                  placeholder="用户名"
                  className="input-zelda"
                  value={username}
                  onChange={(e)=>setUsername(e.target.value)}
              />
              <input
                  type="password"
                  placeholder="密码"
                  className="input-zelda"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
              />
              <button
                  type="submit"
                  className="btn-zelda"
              >
              登录
              </button>
          </form>
      </div>
      {/* 测试组件 */}
      <UserTestPanel/>
    </div>
  )
}
// const handleLogin = (e: React.FormEvent) => {
  //   e.preventDefault()

  //   // 模拟一个简单的登录验证
  //   if (username === 'testuser' && password === 'password123') {
  //     const user = {
  //       id: '1',
  //       username: 'testuser',
  //       email: 'test@example.com',
  //     }

  //     // 设置用户数据到 Zustand
  //     setUser(user)

  //     // 登录成功后跳转到首页
  //     navigate('/home')  // 使用 navigate 进行跳转
  //   } else {
  //     alert('用户名或密码错误')
  //   }
  // }