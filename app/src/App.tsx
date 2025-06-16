// app/src/App.tsx

import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import useUserStore from './store/user';
import { fetchMeApi } from './api/auth';
import type { User } from './types/user';
import { useQuery } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

function AuthLoader({ children }: { children: React.ReactNode }) {
  const { user, setUser, logout } = useUserStore();
  const navigate = useNavigate();

  // --- 关键修复 1: 移除 onSuccess/onError, 改为从 useQuery 返回值中获取状态 ---
  const { isLoading, data: fetchedUser, isError } = useQuery<User>({
    queryKey: ['me'],
    queryFn: fetchMeApi,
    enabled: !!localStorage.getItem('token') && !user._id,
    retry: false, // 失败后不重试
  });

  // --- 关键修复 2: 使用 useEffect 响应数据和错误状态的变化 ---
  useEffect(() => {
    // 当 useQuery 成功获取到数据时
    if (fetchedUser) {
      setUser(fetchedUser);
    }
    // 当 useQuery 遇到错误时
    if (isError) {
      logout(); // 调用 store 的 logout 方法来清理状态
      navigate('/login');
    }
  }, [fetchedUser, isError, setUser, logout, navigate]);

  useEffect(() => {
    // 监听其他标签页的登出操作
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'token' && !event.newValue) {
        logout();
        navigate('/login');
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [logout, navigate]);

  // isInitialLoading 在 v5 中更常用，表示首次加载
  if (isLoading) {
    return <div className="page-sheikah flex items-center justify-center text-2xl">验证身份中...</div>;
  }

  return <>{children}</>;
}

const App: React.FC = () => {
  return (
    <AuthLoader>
      <Toaster
        position="bottom-center"
        toastOptions={{ duration: 2000 }}
      />
      <Outlet />
    </AuthLoader>
  );
};

export default App;