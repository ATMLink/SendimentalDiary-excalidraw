// File: app/src/types/diary.ts
export interface DiaryData {
    title: string;
    mood: Mood;
    tags: string[];
    image?: string[];
    content: string;
}

export type Mood = 'happy' | 'calm' | 'sad' | 'excited' | 'anxious';

export interface Diary extends DiaryData {
  _id: string; // 后端返回的日记ID
  user: DiaryAuthor; // 作者信息
  createdAt: string;
  updatedAt: string;
}

export type DiaryAuthor = {
  _id: string;
  username: string;
  color: string;
};