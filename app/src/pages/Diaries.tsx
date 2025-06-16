// app/src/pages/Diaries.tsx

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getDiaries } from '../api/diaries';
import { getTags } from '../api/tags';
import type { Diary } from '../types/diary';

const DiaryCard = ({ diary, navigate }: { diary: Diary; navigate: (path: string) => void }) => {
  const coverImage = diary.image && diary.image.length > 0 
    ? `http://localhost:3000${diary.image[0]}` 
    : '/tears-of-kingdom.png';

  return (
    <div onClick={() => navigate(`/diary/${diary._id}`)} className="block group">
      <div className="diary-card h-full flex flex-col">
        <img 
          src={coverImage} 
          alt={diary.title} 
          className="w-full h-48 object-cover flex-shrink-0"
        />
        <div className="p-4 flex-grow">
          <h2 className="font-semibold text-lg truncate text-zeldaGold">{diary.title}</h2>
          <p className="text-sm text-zeldaGold/70 capitalize">{diary.mood}</p>
        </div>
      </div>
    </div>
  );
};

const groupDiariesByDate = (diaries: Diary[]) => {
    const groups = diaries.reduce((acc, diary) => {
        const date = new Date(diary.createdAt).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(diary);
        return acc;
    }, {} as Record<string, Diary[]>);

    return Object.entries(groups);
};


export default function Diaries() {
  const navigate = useNavigate();

  // 用于筛选和搜索的 state
  const [moodFilter, setMoodFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // 使用 React Query 获取日记列表，并将筛选条件作为 queryKey 的一部分
  const { data: diaries, isLoading, isError, error } = useQuery({
    queryKey: ['diaries', { mood: moodFilter, tag: tagFilter, search: searchTerm }],
    queryFn: () => getDiaries({ mood: moodFilter, tag: tagFilter, search: searchTerm }),
  });

  // 获取所有标签用于下拉框
  const { data: tags } = useQuery({ queryKey: ['tags'], queryFn: getTags });

  // --- 新增: 时间分组 ---
  const groupedDiaries = useMemo(() => {
      if (!diaries) return [];
      return groupDiariesByDate(diaries);
  }, [diaries]);

  if (isLoading) {
    return <div className="page-sheikah flex items-center justify-center text-2xl">读取中...</div>;
  }

  if (isError) {
    return <div className="page-sheikah flex items-center justify-center text-2xl text-pink-500">读取日记失败: {error.message}</div>;
  }

  return (
    <div className="page-sheikah-diaries font-orbitron">
      <div className="w-full mx-auto">
        
        <h1 className="title-zelda">日记图鉴</h1>
        
        {/* --- 关键修改: 将所有操作项合并到一个容器中 --- */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 p-4 container-zelda-apple-lite rounded-lg items-center">
            {/* 返回按钮 */}
            <button onClick={() => navigate('/')} className="btn-zelda-square flex-shrink-0">
                <div className="icon-back" />
            </button>

            {/* 搜索框 */}
            <input
                type="text"
                placeholder="搜索标题..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-zelda-apple-lite flex-grow" // flex-grow 使其占据剩余空间
            />
            
            {/* 心情筛选 */}
            <select value={moodFilter} onChange={(e) => setMoodFilter(e.target.value)} className="select-zelda-apple flex-shrink-0">
                <option value="">所有心情</option>
                <option value="happy">开心</option>
                <option value="calm">平静</option>
                <option value="sad">难过</option>
                <option value="excited">兴奋</option>
                <option value="anxious">焦虑</option>
            </select>

            {/* 标签筛选 */}
            <select value={tagFilter} onChange={(e) => setTagFilter(e.target.value)} className="select-zelda-apple flex-shrink-0">
                <option value="">所有标签</option>
                {Array.isArray(tags) && tags.map((tag: string) => <option key={tag} value={tag}>{tag}</option>)}
            </select>

            {/* 新的记忆按钮 */}
            <button onClick={() => navigate('/new')} className="btn-zelda-apple flex-shrink-0">
              + 新的记忆
            </button>
        </div>
        
        {diaries && diaries.length > 0 ? (
          <div className="space-y-12">
            {groupedDiaries.map(([date, diaryGroup]: [string, Diary[]]) => (
                <section key={date}>
                    <h2 className="text-2xl font-cinzel text-zeldaGold/80 border-b-2 border-zeldaGreen/30 pb-2 mb-6">{date}</h2>
                    <div 
                      className="grid gap-6 justify-center" 
                      style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}
                    >
                        {diaryGroup.map((diary: Diary) => ( 
                            <DiaryCard key={diary._id} diary={diary} navigate={navigate} />
                        ))}
                    </div>
                </section>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[50vh] text-center">
            <p className="text-xl text-zeldaGold/80">没有找到符合条件的记忆...</p>
          </div>
        )}
      </div>
    </div>
  );
}