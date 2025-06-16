// app/src/router/index.tsx

import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Diaries from '../pages/Diaries';
import DiaryDetail from '../pages/DiaryDetail';
import DiaryEdit from '../pages/DiaryEditor';
import ProtectedRoute from '../components/common/ProtectedRoute';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />, // App 组件作为所有页面的根布局
    children: [
      {
        index: true, // 默认子路由 (/)
        element: <ProtectedRoute><Home /></ProtectedRoute>,
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'diaries', // 图鉴列表页
        element: <ProtectedRoute><Diaries /></ProtectedRoute>,
      },
      {
        path: 'diary/:id', // 日记详情页
        element: <ProtectedRoute><DiaryDetail /></ProtectedRoute>,
      },
      {
        path: 'edit/:id', // 已有日记的编辑页
        element: <ProtectedRoute><DiaryEdit /></ProtectedRoute>,
      },
      {
        path: 'new', // 新建日记页
        element: <ProtectedRoute><DiaryEdit /></ProtectedRoute>,
      },
    ],
  },
]);

export default router;