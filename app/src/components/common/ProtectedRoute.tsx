import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useUserStore from '../../store/user';

// 定义 Props 类型，明确 children 是一个 React 节点
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // 从 Zustand store 中获取用户信息
  const user = useUserStore(state => state.user);
  // 同时也检查 localStorage 中是否存在 token，作为备用验证
  const token = localStorage.getItem('token');
  // 获取当前页面的位置信息
  const location = useLocation();

  // 如果 zustand 中没有用户信息，并且 localStorage 中也没有 token，
  // 则认为用户未登录
  if (!user && !token) {
    // 使用 Navigate 组件进行重定向
    // - to="/login": 指定重定向的目标路径
    // - replace: 表示替换历史记录，这样用户点击浏览器后退按钮时不会回到被保护的页面
    // - state={{ from: location }}: 将当前位置信息传递给登录页，方便登录后能返回到这个页面
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 如果验证通过，则正常渲染被包裹的子组件（比如 <Home />, <Diaries /> 等）
  return <>{children}</>;
};

export default ProtectedRoute;