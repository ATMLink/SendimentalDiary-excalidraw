// app/src/pages/Login.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // 导入 useLocation
import useUserStore from '../store/user';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { loginApi, fetchMeApi } from '../api/auth';
import type { User } from '../types/user';
// import UserTestPanel from '../components/Tests/UserTestPanel';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const location = useLocation(); // 获取 location 对象
  const qc = useQueryClient();
  
  const { user, setUser } = useUserStore();
  
  // 检查登录后是否需要跳转回之前的页面
  const from = location.state?.from?.pathname || "/"; // 默认跳转到根路径

  useEffect(() => {
    if (user && user._id) {
      // --- 关键修复 1: 跳转到正确的路径 ---
      // 如果有来源页，就跳回去，否则跳到根路径
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const loginMutation = useMutation({
    mutationFn: () => loginApi({ username, password }),
    onSuccess: async ({ token }) => {
      try {
        localStorage.setItem('token', token);
        const fetchedUser = await fetchMeApi();
        if (fetchedUser) {
          setUser(fetchedUser as User); 
          qc.setQueryData(['me'], fetchedUser);
        } else {
          alert('登录成功，但获取用户信息失败');
        }
      } catch (err) {
        // 使用 console.error 打印错误，而不是 alert
        console.error('获取用户信息失败', err);
        alert('登录成功但获取用户信息失败');
      }
    },
    onError: () => {
      alert('登录失败，请检查用户名和密码');
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate();
  };

  return (
    <div 
      className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-pink-400 to-blue-400"
      style={{backgroundImage: 'url(/triangle-power-theme.jpg)', backgroundSize: 'cover', backgroundPosition: 'center'}}
    >
      <div className="p-8 bg-white/20 backdrop-blur-md rounded-xl shadow-lg w-full max-w-sm mx-4">
          <h1 className="title-zelda">ZeldaDiary</h1>
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
                  disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? '登录中...' : '登录'}
              </button>
          </form>
      </div>
    </div>
  );
}