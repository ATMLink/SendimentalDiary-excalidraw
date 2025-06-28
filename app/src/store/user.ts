// app/src/store/user.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types/user'; // 确保从统一的类型文件导入

// --- 关键修改 1: 定义一个 "默认/空" 用户对象 ---
const defaultUser: User = {
  _id: '',
  username: '',
  email: '',
  color: '',
  moodValue: 80,
};

interface UserState {
  user: User; // --- 关键修改 2: user 类型不再是 User | null，而是 User ---
  setUser: (user: User) => void;
  setMoodValue: (value: number) => void;
  logout: () => void;
}

const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: defaultUser, // --- 关键修改 3: 初始状态为默认用户对象 ---
      setUser: (user) => set((state) => ({ 
        user: { ...state.user, ...user } 
      })),
      setMoodValue: (value) => set((state) => ({
        user: { ...state.user, moodValue: value }
      })),
      logout: () => {
        localStorage.removeItem('token');
        set({ user: defaultUser }); // --- 关键修改 4: 登出时设置回默认用户对象 ---
      },
    }),
    {
      name: 'user-storage',
    }
  )
);

export default useUserStore;