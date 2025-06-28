// app/src/components/mood/MoodWidget.tsx

import React, { useState } from 'react';
import useUserStore from '../../store/user';
import { useMutation } from '@tanstack/react-query';
import { updateMoodApi } from '../../api/moods';
import { toast } from 'react-hot-toast';
// import type { Partner } from '../../types/user';

// 新增：一个可复用的、用于显示单人心情的组件
const MoodDisplay = ({ title, moodValue, emoji, isPartner = false, color }: {
  title: string;
  moodValue: number;
  emoji: string;
  isPartner?: boolean;
  color?: string;
}) => (
  <div className={`p-3 rounded-md ${isPartner ? 'bg-black/10' : ''}`}>
    <h3 className="text-base font-semibold text-zeldaGold">{title}</h3>
    <div className="my-2 text-5xl">{emoji}</div>
    <div 
        className="text-2xl font-bold tracking-widest"
        style={{ color: isPartner ? color : '#ffe86c' }} // 伴侣的心情值用他/她自己的颜色
    >
      {Math.round(moodValue)}
    </div>
  </div>
);

const MoodWidget = () => {
  const user = useUserStore((state) => state.user);
  const setMoodValue = useUserStore((state) => state.setMoodValue);
  
  const myMood = user.moodValue ?? 80;
  const partner = user.partner;

  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(myMood);

  const mutation = useMutation({
    mutationFn: updateMoodApi,
    onSuccess: (updatedUser) => {
      toast.success('心情值已更新！');
      if (typeof updatedUser.moodValue === 'number') {
        setMoodValue(updatedUser.moodValue); 
      }
      setIsEditing(false);
    },
    onError: () => toast.error('更新失败，请重试'),
  });

  const handleUpdate = () => {
    const newMoodValue = Number(inputValue);
    if (!isNaN(newMoodValue) && newMoodValue >= 0 && newMoodValue <= 100) {
      mutation.mutate({ moodValue: newMoodValue });
    } else {
      toast.error('请输入 0-100 的有效数字');
    }
  };
  
  const getMoodEmoji = (value: number) => {
    if (value > 80) return '😍';
    if (value > 60) return '😊';
    if (value > 40) return '🙂';
    if (value > 20) return '😟';
    return '😭';
  };

  return (
    <div className="bg-zeldaGreen/30 border border-zeldaYellow/50 rounded-lg p-4 w-64 backdrop-blur-md shadow-lg font-orbitron text-center">
      
      {/* 使用新的 MoodDisplay 组件来显示心情 */}
      <div className={`grid ${partner ? 'grid-cols-2' : 'grid-cols-1'} gap-2`}>
        <MoodDisplay 
          title="我的心情"
          moodValue={myMood}
          emoji={getMoodEmoji(myMood)}
        />
        {partner && (
          <MoodDisplay 
            title={`${partner.username}的心情`}
            moodValue={partner.moodValue ?? 80}
            emoji={getMoodEmoji(partner.moodValue ?? 80)}
            isPartner={true}
            color={partner.color}
          />
        )}
      </div>

      {/* 手动调整区域 */}
      <div className="mt-4 pt-4 border-t border-zeldaGold/20">
        {isEditing ? (
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm text-zeldaGold">调整我的心情</span>
            <input 
              type="range" 
              min="0" max="100" 
              value={inputValue}
              onChange={(e) => setInputValue(Number(e.target.value))}
              className="w-full"
            />
            <button 
              onClick={handleUpdate} 
              className="btn-zelda-apple w-full text-sm py-1"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? '保存中...' : '确认修改'}
            </button>
            <button onClick={() => setIsEditing(false)} className="text-xs text-zelda-gold/60 hover:text-white">
              取消
            </button>
          </div>
        ) : (
          <button 
            onClick={() => {
              setInputValue(myMood);
              setIsEditing(true);
            }} 
            className="btn-zelda-apple-lite w-full text-sm py-1"
          >
            调整我的心情
          </button>
        )}
      </div>
    </div>
  );
};

export default MoodWidget;