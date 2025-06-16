// app/src/pages/Diaries.tsx

import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getDiaries, GetDiariesParams } from '../api/diaries';
import { getTags } from '../api/tags';
import type { Diary } from '../types/diary';

// 卡片组件保持不变
const DiaryCard = ({ diary, navigate }: { diary: Diary; navigate: (path: string) => void }) => {
  const coverImage = diary.image && diary.image.length > 0 
    ? `http://localhost:3000${diary.image[0]}` 
    : '/tears-of-kingdom.png';

  return (
    // **关键修改: 卡片使用 diary-card shortcut**
    <div onClick={() => navigate(`/diary/${diary._id}`)} className="block group w-full h-full">
      <div className="diary-card h-full flex flex-col">
        <img 
          src={coverImage} 
          alt={diary.title} 
          className="w-full h-48 object-cover flex-shrink-0"
        />
        <div className="p-4 flex-grow flex flex-col">
          <h2 className="font-semibold text-lg truncate text-zelda-gold">{diary.title}</h2>
          <p className="text-sm text-zelda-gold/70 capitalize mt-auto">{diary.mood}</p>
        </div>
      </div>
    </div>
  );
};

// 日期格式化函数保持不变 (m-d-y)
const groupDiariesByDate = (diaries: Diary[]) => {
    const groups = diaries.reduce((acc, diary) => {
        const date = new Date(diary.createdAt).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'numeric', 
            day: 'numeric' 
        }).replace(/\//g, '-');
        
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(diary);
        return acc;
    }, {} as Record<string, Diary[]>);

    return Object.entries(groups).sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime());
};

export default function Diaries() {
  const navigate = useNavigate();
  
  const [filters, setFilters] = useState<GetDiariesParams>({ mood: '', tag: '', search: '' });
  const [searchInput, setSearchInput] = useState('');

  const { data: diaries, isLoading, isError } = useQuery({
    queryKey: ['diaries', filters],
    queryFn: () => getDiaries(filters),
  });

  const { data: tags } = useQuery<string[]>({ queryKey: ['tags'], queryFn: getTags });

  const groupedDiaries = useMemo(() => {
      if (!diaries) return [];
      return groupDiariesByDate(diaries);
  }, [diaries]);

  const handleSearch = useCallback(() => {
    setFilters(prev => ({ ...prev, search: searchInput }));
  }, [searchInput]);

  const handleFilterChange = (key: 'mood' | 'tag', value: string) => {
    setFilters(prev => ({
        ...prev,
        [key]: value
    }));
  };
  
  const handleResetFilters = () => {
    setSearchInput('');
    setFilters({ mood: '', tag: '', search: '' });
  };

  const renderContent = () => {
    if (isLoading) {
      return <div className="flex items-center justify-center h-full text-2xl text-zelda-gold">读取中...</div>;
    }
    if (isError) {
      return <div className="flex items-center justify-center h-full text-2xl text-pink-500">读取日记失败</div>;
    }
    if (!diaries || diaries.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <p className="text-xl text-zelda-gold/80">没有找到符合条件的记忆...</p>
            <button 
              onClick={handleResetFilters} 
              className="mt-4 btn-zelda-apple" // 使用 shortcut
            >
              重置筛选
            </button>
        </div>
      );
    }
    return (
      <div className="space-y-12 p-4 sm:p-8">
        {groupedDiaries.map(([date, diaryGroup]) => (
          <section key={date}>
            <h2 className="text-2xl font-cinzel text-zelda-gold/80 border-b-2 border-zelda-green/30 pb-2 mb-6">{date}</h2>
            <div className="flex flex-wrap -m-3">
              {diaryGroup.map((diary) => ( 
                <div key={diary._id} className="w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 p-3">
                  <DiaryCard diary={diary} navigate={navigate} />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen bg-zelda-green/20 text-[#f8f1d5] font-sheikah overflow-hidden">
      
      {/* --- 左侧筛选和控制面板 (3/10 宽度) --- */}
      <aside className="w-full md:w-3/10 p-4 sm:p-6 bg-black/20 flex flex-col gap-4 border-r border-zelda-green/30">
        <div className="flex items-center gap-4">
          {/* **关键修改: 恢复使用 btn-zelda-square shortcut** */}
          <button onClick={() => navigate('/')} className="btn-zelda-square">
             <div className="icon-back" />
          </button>
          <h1 className="title-zelda !text-left !text-3xl sm:!text-4xl">日记图鉴</h1>
        </div>
        
        {/* **关键修改: 使用 container-zelda-apple-lite 作为容器并恢复内部元素的 shortcuts** */}
        <div className="container-zelda-apple-lite rounded-lg p-4 flex flex-col gap-4">
           <div className="flex gap-2">
             <input
                type="text"
                placeholder="搜索标题..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="input-zelda-apple-lite" // 恢复 shortcut
             />
             <button onClick={handleSearch} className="btn-zelda-apple flex-shrink-0">搜索</button>
           </div>

           <select value={filters.mood} onChange={(e) => handleFilterChange('mood', e.target.value)} className="select-zelda-apple">
              <option value="">所有心情</option>
              <option value="happy">开心</option>
              <option value="calm">平静</option>
              <option value="sad">难过</option>
              <option value="excited">兴奋</option>
              <option value="anxious">焦虑</option>
           </select>

           <select value={filters.tag} onChange={(e) => handleFilterChange('tag', e.target.value)} className="select-zelda-apple">
               <option value="">所有标签</option>
               {Array.isArray(tags) && tags.map((tag) => <option key={tag} value={tag}>{tag}</option>)}
           </select>
        </div>
        
        <button onClick={() => navigate('/new')} className="btn-zelda-apple">
           + 新的记忆
        </button>

      </aside>

      {/* --- 右侧日记卡片展示区 (7/10 宽度) --- */}
      <main className="w-full md:w-7/10 h-full overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
}