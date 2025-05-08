// // import React from 'react'
// import { Navigate } from 'react-router-dom'
// import useUserStore from '../../store/user'

// interface Props {
//   children: JSX.Element
// }

// export default function ProtectedRoute({ children }: Props) {
//   const user = useUserStore(state => state.user)

//   // 如果用户未登录（user.id 为空），重定向到 /login
//   if (!user?.id) {
//     return <Navigate to="/login" replace />
//   }

//   // 否则正常渲染
//   return children
// }
