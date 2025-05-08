// app/src/pages/Home.tsx
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useUserStore from '../store/user'

const Home: React.FC = () => {
  const { user, logout } = useUserStore()
  const navigate = useNavigate()

  useEffect(() => {
    console.log('User in Home:', user)
    // 如果用户未登录，跳转回登录页
    if (!user || !user._id) {
      navigate('/login')
    }
  }, [user, navigate])

  if(!user || !user._id) return null

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-green-400 to-blue-400">
      <div className="p-8 bg-white/20 backdrop-blur-md rounded-xl shadow-lg w-full max-w-sm mx-4">
        <h1 className="text-xl font-bold mb-4">Welcome, {user.username}</h1>
        <p>Email: {user.email || 'No email found'}</p>
        <p>ID: {user._id || 'No ID found'}</p>
        <button
          className="btn-zelda mb-4"
          onClick={() => navigate('/diary/new')}
          >
            ➕ 新建日记
        </button>
        <button 
          className="btn-zelda"
          onClick={() => logout()}
        >
          Logout
        </button>
      </div>
    </div>
  )
}

export default Home
