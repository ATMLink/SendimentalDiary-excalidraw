export interface DiaryData {
    title: string;
    mood: string;
    tags: string[];
    image?: string;
    content: string;
}

export type Mood = 'happy' | 'calm' | 'sad' | 'excited' | 'anxious';

// export async function createDiary(payload: DiaryData) {
//     const res = await fetch('../api/diary', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//     })
//     if (!res.ok) throw new Error('保存失败')
//     return res.json()
// }