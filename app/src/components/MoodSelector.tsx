import type { Mood } from '../types/diary'

interface MoodSelectorProps {
  mood: Mood
  onChange: (mood: Mood) => void
}

export default function MoodSelector({ mood, onChange }: MoodSelectorProps) {
  return (
    <select value={mood} onChange={e => onChange(e.target.value as Mood)} className="select-zelda-apple">
      <option value="happy">开心</option>
      <option value="calm">平静</option>
      <option value="sad">难过</option>
      <option value="excited">兴奋</option>
      <option value="anxious">焦虑</option>
    </select>
  )
}