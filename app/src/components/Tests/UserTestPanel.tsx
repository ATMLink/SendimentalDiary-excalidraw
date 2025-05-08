// app/src/components/UserTestPanel.tsx

// import React from 'react'
import useUserStore from '../../store/user'

export default function UserTestPanel() {
  const user = useUserStore((state) => state.user)
  const setUser = useUserStore((state) => state.setUser)
  const logout = useUserStore((state) => state.logout)

  const mockUser = {
    _id: 'u001',
    username: 'alice',
    email: 'alice@example.com',
  }

  return (
    <div style={{ padding: 20, backgroundColor: '#eee', borderRadius: 8 }}>
      <h2>🧪 Zustand 用户测试面板</h2>
      <p>
        <strong>当前用户：</strong><br />
        ID: {user?._id || '无'}<br />
        用户名: {user?.username || '无'}<br />
        email: {user?.email || '无'}
      </p>
      <button onClick={() => setUser(mockUser)} style={{ marginRight: 10 }}>
        设置用户信息
      </button>
      <button onClick={logout}>登出（清除用户）</button>
    </div>
  )
}
