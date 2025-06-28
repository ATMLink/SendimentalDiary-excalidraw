// // app/src/pages/Diaries.tsx

// import React, { useState, useMemo, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useQuery } from '@tanstack/react-query';
// // **步骤 1: 确保 GetDiariesParams 的类型已更新**
// import { getDiaries, GetDiariesParams } from '../api/diaries';
// import { getTags } from '../api/tags';
// import type { Diary } from '../types/diary';

// // 卡片组件保持不变
// const DiaryCard = ({ diary, navigate }: { diary: Diary; navigate: (path:string) => void }) => {
//   // const coverImage = diary.image && diary.image.length > 0 
//   //   ? `http://localhost:3000${diary.image[0]}` 
//   //   : '/tears-of-kingdom.png';

//   const coverImage = diary.image?.length
//   ? diary.image[0]   // 这里已经是 public Blob URL 了
//   : '/tears-of-kingdom.png';

//   // 1. 定义一个内联样式，用于将用户的颜色传递给 CSS
//   const cardStyle = {
//     '--user-color': diary.user.color || '#3e6c4e' // 提供一个默认颜色以防万一
//   } as React.CSSProperties;

//   return (
//     // 2. 在根元素上应用内联样式和新的包裹类名
//     <div 
//       onClick={() => navigate(`/diary/${diary._id}`)} 
//       className="block group w-full h-full diary-card-wrapper"
//       style={cardStyle}
//     >
//       <div className="diary-card h-full flex flex-col">
//         <img 
//           src={coverImage} 
//           alt={diary.title} 
//           className="w-full h-48 object-cover flex-shrink-0"
//         />
//         <div className="p-4 flex-grow flex flex-col">
//           <h2 className="font-semibold text-lg truncate text-zeldaGold">{diary.title}</h2>
          
//           {/* 3. 新增：显示作者信息，并使用 var(--user-color) 来动态设置文字颜色 */}
//           <p className="text-sm mt-1 text-[var(--user-color)] opacity-80 font-orbitron">
//              {diary.user.username} 的回忆
//           </p>
          
//           <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 text-sm pt-2">
//             <p className="text-zelda-gold/70 capitalize">{diary.mood}</p>
//             {diary.tags && diary.tags.length > 0 && diary.tags.map(tag => (
//               <span 
//                 key={tag} 
//                 className="bg-zelda-green/60 text-zelda-gold/90 px-2 py-0.5 rounded-full text-xs font-semibold"
//               >
//                 {tag}
//               </span>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // 日期格式化函数保持不变
// const groupDiariesByDate = (diaries: Diary[]) => {
//     const groups = diaries.reduce((acc, diary) => {
//         const date = new Date(diary.createdAt).toLocaleDateString('en-US', { 
//             year: 'numeric', 
//             month: 'numeric', 
//             day: 'numeric' 
//         }).replace(/\//g, '-');
        
//         if (!acc[date]) {
//             acc[date] = [];
//         }
//         acc[date].push(diary);
//         return acc;
//     }, {} as Record<string, Diary[]>);

//     return Object.entries(groups).sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime());
// };

// export default function Diaries() {
//   const navigate = useNavigate();
  
//   // **关键修复 1: 确保 GetDiariesParams 类型支持 'tags'**
//   // 注意: 要完全解决TS错误，您必须在 'app/src/api/diaries.ts' 文件中
//   // 将 GetDiariesParams 接口的 'tag?: string' 修改为 'tags?: string[]'
//   const [filters, setFilters] = useState<GetDiariesParams>({ mood: '', tags: [], search: '' });
//   const [searchInput, setSearchInput] = useState('');

//   const { data: diaries, isLoading, isError } = useQuery({
//     queryKey: ['diaries', filters],
//     queryFn: () => getDiaries(filters),
//   });

//   const { data: tags } = useQuery<string[]>({ queryKey: ['tags'], queryFn: getTags });

//   const groupedDiaries = useMemo(() => {
//       if (!diaries) return [];
//       return groupDiariesByDate(diaries);
//   }, [diaries]);

//   const handleSearch = useCallback(() => {
//     setFilters(prev => ({ ...prev, search: searchInput }));
//   }, [searchInput]);

//   // handleFilterChange 现在只处理 mood
//   const handleMoodChange = (value: string) => {
//     setFilters(prev => ({ ...prev, mood: value }));
//   };
  
//   // **关键修复 2: handler 保持不变，但依赖于正确的 GetDiariesParams 类型**
//   const handleTagToggle = (tagToToggle: string) => {
//     console.log('Tag clicked:', tagToToggle);
//     setFilters(prev => {
//         console.log('Previous filters:', prev);
        
//         const currentTags = prev.tags || [];
//         // **关键修复 3: 为 't' 添加显式类型以解决 'implicit any' 错误**
//         const newTags = currentTags.includes(tagToToggle)
//             ? currentTags.filter((t: string) => t !== tagToToggle)
//             : [...currentTags, tagToToggle];
//         return { ...prev, tags: newTags };
//     });
//   };

//   const handleResetFilters = () => {
//     setSearchInput('');
//     // 重置时也要将 tags 设置为空数组
//     setFilters({ mood: '', tags: [], search: '' });
//   };

//   const renderContent = () => {
//     if (isLoading) {
//       return <div className="flex items-center justify-center h-full text-2xl text-zelda-gold">读取中...</div>;
//     }
//     if (isError) {
//       return <div className="flex items-center justify-center h-full text-2xl text-pink-500">读取日记失败</div>;
//     }
//     if (!diaries || diaries.length === 0) {
//       return (
//         <div className="flex flex-col items-center justify-center h-full text-center p-4">
//             <p className="text-xl text-zelda-gold/80">没有找到符合条件的记忆...</p>
//             <button 
//               onClick={handleResetFilters} 
//               className="mt-4 btn-zelda-apple"
//             >
//               重置筛选
//             </button>
//         </div>
//       );
//     }
//     return (
//       <div className="space-y-12 p-4 sm:p-8">
//         {groupedDiaries.map(([date, diaryGroup]) => (
//           <section key={date}>
//             <h2 className="text-2xl font-cinzel text-zelda-gold/80 border-b-2 border-zelda-green/30 pb-2 mb-6">{date}</h2>
//             <div className="flex flex-wrap -m-3">
//               {diaryGroup.map((diary) => ( 
//                 <div key={diary._id} className="w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 p-3">
//                   <DiaryCard diary={diary} navigate={navigate} />
//                 </div>
//               ))}
//             </div>
//           </section>
//         ))}
//       </div>
//     );
//   };

//   return (
//     // **布局修正: 使用有效的 Tailwind/UnoCSS 宽度类**
//     <div className="flex flex-col md:flex-row h-screen w-screen bg-zelda-green/20 text-[#f8f1d5] font-sheikah overflow-hidden">
      
//       {/* --- 左侧筛选和控制面板 (6/20 宽度) --- */}
//       <aside className="w-full md:w-6/20 p-4 sm:p-6 bg-black/20 flex flex-col gap-4 border-r border-zelda-green/30 overflow-y-auto">
//         <div className="flex items-center gap-4">
//           <button onClick={() => navigate('/')} className="btn-zelda-square">
//              <div className="icon-back" />
//           </button>
//           <h1 className="title-zelda !text-left !text-3xl sm:!text-4xl">日记图鉴</h1>
//         </div>
        
//         <div className="container-zelda-apple-lite rounded-lg p-4 flex flex-col gap-4">
//            <div className="flex gap-2">
//              <input
//                 type="text"
//                 placeholder="搜索标题..."
//                 value={searchInput}
//                 onChange={(e) => setSearchInput(e.target.value)}
//                 onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
//                 className="input-zelda-apple-lite"
//              />
//              <button onClick={handleSearch} className="btn-zelda-apple flex-shrink-0">搜索</button>
//            </div>

//            <select value={filters.mood} onChange={(e) => handleMoodChange(e.target.value)} className="select-zelda-apple">
//               <option value="">所有心情</option>
//               <option value="happy">开心</option>
//               <option value="calm">平静</option>
//               <option value="sad">难过</option>
//               <option value="excited">兴奋</option>
//               <option value="anxious">焦虑</option>
//            </select>

//            <div className="flex flex-col gap-2">
//               <h3 className="text-base text-zelda-gold/70">标签筛选:</h3>
//               <div className="flex flex-wrap gap-2">
//                 {Array.isArray(tags) && tags.map((tag) => (
//                     <button
//                         key={tag}
//                         onClick={() => handleTagToggle(tag)}
//                         className={`px-3 py-1 rounded-full text-sm font-semibold transition-all duration-200
//                             ${(filters.tags || []).includes(tag)
//                                 ? 'bg-zelda-yellow text-zelda-green shadow-md'
//                                 : 'bg-zelda-green/50 text-zelda-gold hover:bg-zelda-green'
//                             }`}
//                     >
//                         {tag}
//                     </button>
//                 ))}
//               </div>
//            </div>
//         </div>
        
//         <button onClick={() => navigate('/new')} className="btn-zelda-apple mt-auto">
//            + 新的记忆
//         </button>

//       </aside>

//       {/* --- 右侧日记卡片展示区 (14/20 宽度) --- */}
//       <main className="w-full md:w-14/20 h-full overflow-y-auto">
//         {renderContent()}
//       </main>
//     </div>
//   );
// }
import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getDiaries, GetDiariesParams } from '../api/diaries';
import { getTags } from '../api/tags';
import type { Diary } from '../types/diary';

// 卡片组件保持不变
const DiaryCard = ({ diary, navigate }: { diary: Diary; navigate: (path:string) => void }) => {
  const coverImage = diary.image?.length
  ? diary.image[0] 
  : '/tears-of-kingdom.png';

  const cardStyle = {
    '--user-color': diary.user.color || '#3e6c4e' 
  } as React.CSSProperties;

  return (
    <div 
      onClick={() => navigate(`/diary/${diary._id}`)} 
      className="block group w-full h-full diary-card-wrapper"
      style={cardStyle}
    >
      <div className="diary-card h-full flex flex-col">
        <img 
          src={coverImage} 
          alt={diary.title} 
          className="w-full h-48 object-cover flex-shrink-0"
        />
        <div className="p-4 flex-grow flex flex-col">
          <h2 className="font-semibold text-lg truncate text-zeldaGold">{diary.title}</h2>
          
          <p className="text-sm mt-1 text-[var(--user-color)] opacity-80 font-orbitron">
            {diary.user.username} 的回忆
          </p>
          
          <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 text-sm pt-2">
            <p className="text-zelda-gold/70 capitalize">{diary.mood}</p>
            {diary.tags && diary.tags.length > 0 && diary.tags.map(tag => (
              <span 
                key={tag} 
                className="bg-zelda-green/60 text-zelda-gold/90 px-2 py-0.5 rounded-full text-xs font-semibold"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// 日期格式化函数保持不变
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
  
  const [filters, setFilters] = useState<GetDiariesParams>({ mood: '', tags: [], search: '' });
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

  const handleMoodChange = (value: string) => {
    setFilters(prev => ({ ...prev, mood: value }));
  };
  
  const handleTagToggle = (tagToToggle: string) => {
    console.log('Tag clicked:', tagToToggle);
    setFilters(prev => {
        console.log('Previous filters:', prev);
        
        const currentTags = prev.tags || [];
        const newTags = currentTags.includes(tagToToggle)
            ? currentTags.filter((t: string) => t !== tagToToggle)
            : [...currentTags, tagToToggle];
        return { ...prev, tags: newTags };
    });
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setFilters({ mood: '', tags: [], search: '' });
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
              className="mt-4 btn-zelda-apple"
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
            {/* 核心修改 1: 在 iPad (md) 及以上屏幕显示多列 */}
            {/* iPad 竖屏通常是 md 断点 (768px)，横屏是 lg/xl 断点 (1024px/1280px) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {diaryGroup.map((diary) => ( 
                <div key={diary._id}> {/* 移除固定的 w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 p-3，让 grid-cols 统一控制 */}
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
    // 布局修正: 调整主容器的 flex 行为，更好地利用空间
    <div className="flex flex-col md:flex-row h-screen w-screen bg-zelda-green/20 text-[#f8f1d5] font-sheikah overflow-hidden">
      
      {/* --- 左侧筛选和控制面板 --- */}
      {/* 核心修改 2: 调整 aside 宽度，并在小屏时可滚动 */}
      <aside className="w-full md:w-1/4 lg:w-1/5 p-4 sm:p-6 bg-black/20 flex flex-col gap-4 border-r border-zelda-green/30 overflow-y-auto">
        <div className="flex items-center gap-4">
          {/* 核心修改 3: 增大返回按钮的触控区域 */}
          <button onClick={() => navigate('/')} className="btn-zelda-square p-3 min-w-[48px] min-h-[48px] flex items-center justify-center">
             <div className="icon-back text-2xl" /> {/* 增大图标 */}
          </button>
          <h1 className="title-zelda !text-left !text-3xl sm:!text-4xl">日记图鉴</h1>
        </div>
        
        <div className="container-zelda-apple-lite rounded-lg p-4 flex flex-col gap-4">
           <div className="flex gap-2">
             {/* 核心修改 4: 增大搜索输入框和按钮的触控区域 */}
             <input
               type="text"
               placeholder="搜索标题..."
               value={searchInput}
               onChange={(e) => setSearchInput(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
               className="input-zelda-apple-lite flex-grow py-2 px-3"
             />
             <button onClick={handleSearch} className="btn-zelda-apple flex-shrink-0 px-4 py-2">搜索</button> {/* 增加内边距 */}
           </div>

           {/* 核心修改 5: 增大 Mood 选择框的触控区域 */}
           <select value={filters.mood} onChange={(e) => handleMoodChange(e.target.value)} className="select-zelda-apple py-2 px-3">
             <option value="">所有心情</option>
             <option value="happy">开心</option>
             <option value="calm">平静</option>
             <option value="sad">难过</option>
             <option value="excited">兴奋</option>
             <option value="anxious">焦虑</option>
           </select>

           <div className="flex flex-col gap-2">
             <h3 className="text-base text-zelda-gold/70">标签筛选:</h3>
             <div className="flex flex-wrap gap-2">
                {Array.isArray(tags) && tags.map((tag) => (
                    <button
                        key={tag}
                        onClick={() => handleTagToggle(tag)}
                        // 核心修改 6: 增大标签按钮的触控区域
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 min-w-[44px] min-h-[44px]
                            ${(filters.tags || []).includes(tag)
                                ? 'bg-zelda-yellow text-zelda-green shadow-md'
                                : 'bg-zelda-green/50 text-zelda-gold hover:bg-zelda-green'
                            }`}
                    >
                        {tag}
                    </button>
                ))}
             </div>
           </div>
        </div>
        
        {/* 核心修改 7: 增大“新的记忆”按钮的触控区域 */}
        <button onClick={() => navigate('/new')} className="btn-zelda-apple mt-auto px-4 py-3">
            + 新的记忆
        </button>

      </aside>

      {/* --- 右侧日记卡片展示区 --- */}
      {/* 核心修改 8: 调整 main 宽度，使其占据剩余空间 */}
      <main className="w-full md:w-3/4 lg:w-4/5 h-full overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
}