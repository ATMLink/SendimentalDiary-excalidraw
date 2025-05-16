// app/src/hooks/useSaveDiary.ts

// import { useNavigate } from 'react-router-dom'
// import type { DiaryData } from '../types/diary'
import {postDiary, updateDiary} from '../api/diaries'
import {useMutation} from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import {toast} from 'react-hot-toast'


// export function useDiarySave() {
//   const navigate = useNavigate()

//   const mutation = useMutation({
//     mutationFn: (formData: FormData) => postDiary(formData),
//     onSuccess: () => {
//       alert('日记保存成功！')
//       navigate('/diaries')
//     },
//     onError: (error) => {
//       let msg = '保存失败，请重试'
//       if (isAxiosError(error)) {
//         msg = error.response?.data?.message || error.message
//       } else if (error instanceof Error) {
//         msg = error.message
//       }
//       alert(msg)
//       console.error(error)
//     },
//   })

//   return {
//     saveDiary: mutation.mutate,
//     isSaving: mutation.isPending,
//   }
// }

export function useDiarySave(
  diaryId: string | null,
  setDiaryId: (id: string) => void
) {
  // const navigate = useNavigate()

  const createMutation = useMutation({
    mutationFn: (formData: FormData) => postDiary(formData),
    onSuccess: (res) => {
      const id = res.data._id
      setDiaryId(id) // 保存 ID，下一次变为 PATCH
      toast.success('日记创建成功！')
      // alert('日记创建成功！')
      // navigate('/diaries')
    },
    onError: handleError,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, form }: { id: string; form: FormData }) =>
      updateDiary(id, form),
    onSuccess: () => {
      // console.log('自动保存成功')
      toast.success('日记保存成功')
    },
    onError: handleError,
  })

  function handleError(error: unknown) {
    let msg = '保存失败，请重试'
    if (isAxiosError(error)) {
      msg = error.response?.data?.message || error.message
    } else if (error instanceof Error) {
      msg = error.message
    }
    // alert(msg)
    toast.error(msg)
    console.error(error)
  }

  const saveDiary = (form: FormData) => {
    if (diaryId) {
      updateMutation.mutate({ id: diaryId, form })
    } else {
      createMutation.mutate(form)
    }
  }

  return {
    saveDiary,
    isSaving: createMutation.isPending || updateMutation.isPending,
  }
}