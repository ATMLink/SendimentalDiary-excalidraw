// app/src/router/index.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from '../pages/Login'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/diaries" element={<div>日记页</div>} />
      </Routes>
    </BrowserRouter>
  )
}
