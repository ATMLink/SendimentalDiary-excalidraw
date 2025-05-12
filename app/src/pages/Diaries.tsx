// app/src/pages/Diaries.tsx
import { useQuery } from "@tanstack/react-query"
import { fetchAllDiaries } from "../api/diaries"

const Diaries = () => {
  const { data: diaries, isLoading } = useQuery(['diaries'], fetchAllDiaries)

  if (isLoading) return <div>加载中...</div>

  return (
    <div>
      {diaries.map(diary => (
        <Link to={`/diary/${diary.id}/edit`} key={diary.id}>
          <div className="border p-4 my-2 rounded">
            <h2 className="font-bold">{diary.title}</h2>
            <p>{diary.tags.join(', ')}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}
