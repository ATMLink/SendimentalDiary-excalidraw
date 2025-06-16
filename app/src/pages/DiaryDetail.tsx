// app/src/pages/DiaryDetail.tsx

import React, { useEffect, useState, useMemo } from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchDiaryById } from '../api/diaries';
import type { BinaryFileData, AppState } from '@excalidraw/excalidraw/types/types';
import { blobToDataURL } from '../utils/image';
import { toast } from 'react-hot-toast';
import useUserStore from '../store/user';
import type { ExcalidrawElement, FileId } from '@excalidraw/excalidraw/types/element/types';


// 定义场景数据的完整类型
type SceneData = {
    elements: readonly ExcalidrawElement[];
    appState: AppState;
    files: Record<FileId, BinaryFileData>;
};

export default function DiaryDetail() {
    const { id: paramId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const user = useUserStore(state => state.user);

    // --- 关键修改 1: 使用 state 来管理场景数据和加载状态 ---
    const [sceneData, setSceneData] = useState<SceneData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [diaryTitle, setDiaryTitle] = useState('');

    const collaborators = useMemo(() => new Map([
        [user._id, { username: user.username || 'Anonymous', id: user._id }]
    ]), [user]);

    useEffect(() => {
        if (!paramId) {
            navigate('/diaries');
            return;
        }

        const loadSceneForViewing = async () => {
            try {
                const data = await fetchDiaryById(paramId);
                setDiaryTitle(data.title);

                if (data.content) {
                    const content = JSON.parse(data.content);
                    const sceneFiles = content.files || {};
                    
                    type FileFromJSON = { id: string; url: string; mimeType: string; created: number };
                    
                    const filesArray = await Promise.all(
                        (Object.values(sceneFiles) as FileFromJSON[]).map(async (file) => { // 在这里添加 as FileFromJSON[]
                            if (!file || !file.url) return null;
                            const res = await fetch(`http://localhost:3000${file.url}`);
                            const blob = await res.blob();
                            const dataURL = await blobToDataURL(blob) as string;
                            return { 
                                id: file.id as FileId, 
                                mimeType: file.mimeType as BinaryFileData['mimeType'], 
                                dataURL, 
                                created: file.created 
                            };
                        })
                    ).then(results => results.filter((f): f is BinaryFileData => !!f));
                    
                    const filesRecord = filesArray.reduce((acc, file) => {
                        acc[file.id] = file;
                        return acc;
                    }, {} as Record<FileId, BinaryFileData>);

                    // --- 关键修复 2: 将所有准备好的数据存入 state ---
                    setSceneData({
                        elements: content.elements,
                        appState: {
                            ...content.appState,
                            viewModeEnabled: true, // 确保是只读模式
                            viewBackgroundColor: '#f8f1d5',
                            collaborators, // 传入协作者信息
                        },
                        files: filesRecord
                    });
                }
            } catch (err) {
                toast.error("加载日记详情失败");
                console.error(err);
                navigate('/diaries');
            } finally {
                setIsLoading(false);
            }
        };
        
        loadSceneForViewing();
    }, [paramId, navigate, collaborators]);

    if (isLoading) {
        return <div className="page-sheikah flex items-center justify-center text-2xl">唤醒记忆中...</div>;
    }

    return (
        <div className="page-sheikah font-orbitron relative min-h-screen flex flex-col">
            <div className="absolute top-5 left-5 z-20">
                <button onClick={() => navigate('/diaries')} className="btn-zelda-apple">返回图鉴</button>
            </div>
             <div className="absolute top-5 right-5 z-20">
                <button onClick={() => navigate(`/edit/${paramId}`)} className="btn-zelda-apple">编辑</button>
            </div>
            <h1 className="title-zelda py-1">{diaryTitle}</h1>
            <main className="flex-grow w-full h-full">
                {/* --- 关键修复 3: 只有当数据完全准备好后，才渲染 Excalidraw --- */}
                {sceneData && (
                    <Excalidraw
                        initialData={sceneData}
                        // 在只读模式下，不需要 API ref 和 onChange
                    />
                )}
            </main>
        </div>
    );
}