// app/src/store/user.ts
import {create} from 'zustand'
import { persist} from 'zustand/middleware'

interface User {
    _id: string
    username: string
    email: string
    color?: string
  }
  
  interface UserState {
    user: User
    setUser: (user: User) => void
    logout: () => void
  }
  
  const useUserStore = create<UserState>()(
    persist(
      (set) => ({
        user: { _id: '', username: '', email: '', color: '' },
        setUser: (user) => set({ user }),
        logout: () =>{
          localStorage.removeItem('token')
          set({ user: { _id: '', username: '', email: '', color: '' } })
        }
          
      }),
      {
        name: 'user-storage', // localStorage key
      }
    )
  )
  
  export default useUserStore


