// app/src/hooks/useSaveDiary.ts

import { useNavigate } from 'react-router-dom'
// import type { DiaryData } from '../types/diary'
import {postDiary} from '../api/diaries'
import {useMutation} from '@tanstack/react-query'
import { isAxiosError } from 'axios'

// export function useDiarySave() {
//   const navigate = useNavigate()

//   // const saveDiary = (data: DiaryData) => {
//   //   console.log('保存中:', data)
//   //   // 可扩展：调用后端API、保存到本地storage等
//   //   navigate('/diary')
//   // }

//   const mutation = useMutation({
//       mutationFn: postDiary,
//       onSuccess: () => {
//         alert('日记保存成功！！！')
//         navigate('/diaries')
//       },
//       onError: (error) => {
//         if (isAxiosError(error)) {
//           console.error('服务器错误:', error.response?.data)
//           alert(`保存失败: ${error.response?.data?.message || '未知错误'}`)
//         } else {
//           console.error('未知错误:', error)
//           alert('保存失败，请重试')
//           }
//       },
//   })

//   const saveDiary = (data: DiaryData) => {
//     console.log('保存中:', data)
//     // 可扩展：调用后端API、保存到本地storage等
//     mutation.mutate(data)
//   }

//   return { 
//     saveDiary,
//     isSaving: mutation.isPending,
//    }
// }

export function useDiarySave() {
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: (formData: FormData) => postDiary(formData),
    onSuccess: () => {
      alert('日记保存成功！')
      navigate('/diaries')
    },
    onError: (error) => {
      let msg = '保存失败，请重试'
      if (isAxiosError(error)) {
        msg = error.response?.data?.message || error.message
      } else if (error instanceof Error) {
        msg = error.message
      }
      alert(msg)
      console.error(error)
    },
  })

  return {
    saveDiary: mutation.mutate,
    isSaving: mutation.isPending,
  }
}