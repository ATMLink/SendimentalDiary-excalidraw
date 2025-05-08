// app/src/pages/DiaryNew.tsx

import { useState } from 'react'
import { Excalidraw } from '@excalidraw/excalidraw'
import { useNavigate } from 'react-router-dom'

export default function DiaryNew() {
  const [title, setTitle] = useState('')
  const [mood, setMood] = useState<'happy' | 'calm' | 'sad' | 'excited' | 'anxious'>('happy')
  const navigate = useNavigate()

  const handleSave = () => {
    console.log({ title, mood })
    navigate('/diaries')
  }

  return (
    <div className="flex flex-col h-screen w-screen">
        <div className="px-[50px] py-4 box-border flex justify-center">
            <input
                type="text"
                maxLength={100}
                placeholder="在此输入标题"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full p-2 border rounded mb-4"
            />
        </div>
      {/* 控制画布大小的容器 */}
      <div className="px-[50px] flex-1 min-h-0">
        <Excalidraw />
      </div>

      <div className="px-[50px] py-4 flex justify-center items-center gap-4 box-border">
        <select
          value={mood}
          onChange={e => setMood(e.target.value as typeof mood)}
          className="p-2 border rounded"
        >
          <option value="happy">开心</option>
          <option value="calm">平静</option>
          <option value="sad">难过</option>
          <option value="excited">兴奋</option>
          <option value="anxious">焦虑</option>
        </select>
        <button onClick={handleSave} className="btn-zelda">
          保存
        </button>
      </div>
    </div>
  )
}
