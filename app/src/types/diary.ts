// File: app/src/types/diary.ts
export interface DiaryData {
    title: string;
    mood: string;
    tags: string[];
    image?: string[];
    content: string;
}

export type Mood = 'happy' | 'calm' | 'sad' | 'excited' | 'anxious';

export interface Diary extends DiaryData {
  _id: string; // 后端返回的日记ID
  user: string;
  createdAt: string;
  updatedAt: string;
}