// app/src/app.tsx
import React, { useEffect } from 'react'
import {  Routes, Route } from 'react-router-dom'
// import { HashRouter, Routes, Route } from 'react-router-dom'
import useUserStore from './store/user'
import Login from './pages/Login'
import HomePage from './pages/Home'
import { fetchMeApi} from './api/auth'
import type {User} from './api/auth'
import { useQuery } from '@tanstack/react-query'
import DiaryEdit from './pages/DiaryEditor'
// import Diaries from './pages/Diaries'
import { Toaster } from 'react-hot-toast'

function AuthLoader({ children }: { children: React.ReactNode }) {
  const setUser = useUserStore(state => state.setUser)
  // 只有本地有 token 时才尝试请求
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ['me'],
    queryFn: fetchMeApi,
    enabled: !!localStorage.getItem('token'),
  })

  
  useEffect(() => {
    if (user) setUser(user)
  }, [user, setUser])

  if(isLoading){
    return <div className="text-center mt-20">Loading...</div>
  }


  return <>{children}</>
}

const App: React.FC = () => {
  // const { setUser } = useUserStore()

  // useEffect(() => {
  //   // 可选：从 localStorage 或 API 加载用户信息
  //   const savedUser = localStorage.getItem('user')
  //   if (savedUser) {
  //     setUser(JSON.parse(savedUser))
  //   }
  // }, [setUser])

  return (
      <AuthLoader>
        <Toaster
          position="bottom-center"
          toastOptions={{
            duration: 2000,
          }}
        />
        <Routes>
          <Route path="/" element={<Login />} />{/* 默认路由到登录页面 */}
          <Route path="/login" element={<Login/>}/>
          <Route path="/home" element={<HomePage />} />
          <Route path="/diary/new" element={<DiaryEdit />}/>
          <Route path="/diary/:id/edit" element={<DiaryEdit/>}/>
          {/* <Route path="/diaries" element={<Diaries/>}/> */}
        </Routes>
      </AuthLoader>
  )
}

export default App