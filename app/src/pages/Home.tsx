// app/src/pages/Home.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import useUserStore from '../store/user';
import MoodWidget from '../components/mood/MoodWidget';

const Home: React.FC = () => {
  const { user, logout } = useUserStore();
  const navigate = useNavigate();

  if (!user._id) {
    return null; // ProtectedRoute 会处理重定向
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="page-sheikah flex flex-col items-center justify-center text-white relative">
      <div className="absolute top-8 right-8 z-10">
        <MoodWidget />
      </div>
      <div className="p-8 container-zelda-apple-lite rounded-xl w-full max-w-md text-center">
        <h1 className="text-3xl font-bold mb-4 text-zeldaYellow">Welcome, {user.username}</h1>
        <p className="mb-2">Email: {user.email || 'N/A'}</p>
        <p className="mb-6 text-xs text-zeldaGold/60">ID: {user._id}</p>
        <div className="flex flex-col gap-4">
          <button
            className="btn-zelda-apple"
            onClick={() => navigate('/diaries')} // --- 指向正确的图鉴页 ---
          >
            查看日记图鉴
          </button>
          <button
            className="btn-zelda-apple"
            onClick={() => navigate('/wishlist')}
          >
            愿望清单
          </button>
          {/* <button
            className="btn-zelda-apple"
            onClick={() => navigate('/new')} // --- 指向正确的新建页 ---
          >
            新的记忆
          </button> */}
          <button 
            className="btn-zelda-apple !bg-pink-600/80 hover:!bg-pink-500/80"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;