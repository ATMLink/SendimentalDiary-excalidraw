// File: app/src/types/diary.ts
export interface DiaryData {
    title: string;
    mood: string;
    tags: string[];
    image?: string[];
    content: string;
}

export type Mood = 'happy' | 'calm' | 'sad' | 'excited' | 'anxious';
