// // app/src/pages/DiaryNew.tsx

import { useState } from 'react'
import { Excalidraw } from '@excalidraw/excalidraw'
import { useNavigate } from 'react-router-dom'

export default function DiaryNew() {
  const [title, setTitle] = useState('')
  const [mood, setMood] = useState<'happy' | 'calm' | 'sad' | 'excited' | 'anxious'>('happy')
  const navigate = useNavigate()

  const handleSave = () => {
    console.log({ title, mood })
    navigate('/diary')
  }

  return (
    <div className="page-sheikah font-orbitron">
      {/* 标题输入 */}
      <div className="decorative-top p-4">
        <input
          type="text"
          maxLength={100}
          placeholder="输入日记标题..."
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="input-sheikah text-xl text-center"
        />
      </div>

      {/* Excalidraw 区域 */}
      <div className="canvas-sheikah py-6 decorative-border">
        <Excalidraw
          theme="dark"
          initialData={{
            elements: Array.from({ length: 100 }, (_, i) => {
              const y = 100 + i * 60 // 60px 间隔
              return {
                id: `line-${i}`,
                type: "line",
                x: 0,
                y,
                width: 5000,
                height: 0,
                points: [[0, 0], [5000, 0]],
                angle: 0,
                strokeColor: "#00ffd1",
                backgroundColor: "transparent",
                strokeWidth: 2,
                roughness: 0,
                opacity: 50,
                seed: Math.floor(Math.random() * 100000),
                version: 1,
                versionNonce: Math.floor(Math.random() * 100000),
                isDeleted: false,
                groupIds: [],
                boundElementIds: [],
                updated: Date.now(),
                locked: true,
              }
            }),
          }}
        />
      </div>

      {/* 情绪 + 保存按钮 */}
      <div className="decorative-bottom p-4 flex justify-between items-center">
        <select
          value={mood}
          onChange={e => setMood(e.target.value as typeof mood)}
          className="select-sheikah"
        >
          <option value="happy">开心</option>
          <option value="calm">平静</option>
          <option value="sad">难过</option>
          <option value="excited">兴奋</option>
          <option value="anxious">焦虑</option>
        </select>

        <button onClick={handleSave} className="btn-sheikah text-lg">
          保存
        </button>
      </div>
    </div>
  )
}
