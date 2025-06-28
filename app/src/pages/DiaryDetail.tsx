// app/src/pages/DiaryDetail.tsx

import React, { useEffect, useState, useMemo } from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';
import { useParams, useNavigate } from 'react-router-dom'; // Link 已被移除
import { fetchDiaryById, deleteDiaryApi } from '../api/diaries';
import type { BinaryFileData, AppState } from '@excalidraw/excalidraw/types/types';
import { blobToDataURL } from '../utils/image';
import { toast } from 'react-hot-toast';
import useUserStore from '../store/user';
import type { ExcalidrawElement, FileId } from '@excalidraw/excalidraw/types/element/types';

type SceneData = {
    elements: readonly ExcalidrawElement[];
    appState: AppState;
    files: Record<FileId, BinaryFileData>;
};

export default function DiaryDetail() {
    const { id: paramId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const currentUser = useUserStore(state => state.user);

    const [sceneData, setSceneData] = useState<SceneData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [diaryTitle, setDiaryTitle] = useState('');
    const [authorId, setAuthorId] = useState<string | null>(null);

    const isAuthor = useMemo(() => authorId === currentUser._id, [authorId, currentUser._id]);

    const collaborators = useMemo(() => new Map([
        [currentUser._id, { username: currentUser.username || 'Anonymous', id: currentUser._id }]
    ]), [currentUser]);

    useEffect(() => {
        // ... (useEffect 的内容保持完全不变)
        if (!paramId) {
            navigate('/diaries');
            return;
        }

        const loadSceneForViewing = async () => {
            try {
                const data = await fetchDiaryById(paramId);
                setDiaryTitle(data.title);
                setAuthorId(data.user);

                if (data.content) {
                    const content = JSON.parse(data.content);
                    const sceneFiles = content.files || {};
                    type FileFromJSON = { id: string; url: string; mimeType: string; created: number };
                    const filesArray = await Promise.all(
                        (Object.values(sceneFiles) as FileFromJSON[]).map(async (file) => {
                            if (!file || !file.url) return null;
                            // const res = await fetch(`http://localhost:3000${file.url}`);
                            const res = await fetch(file.url!);
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

                    setSceneData({
                        elements: content.elements,
                        appState: {
                            ...content.appState,
                            viewModeEnabled: true,
                            viewBackgroundColor: '#f8f1d5',
                            collaborators,
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

    const handleDelete = async () => {
        if (window.confirm('这段记忆将被送回时光之流，再也无法唤醒。你确定要这么做吗？')) {
            try {
                await deleteDiaryApi(paramId!);
                toast.success('记忆已回归海拉鲁...');
                navigate('/diaries');
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error: any) {
                toast.error(error.response?.data?.message || '删除失败');
            }
        }
    };
    
    // --- 关键修改：新增一个处理编辑跳转的函数 ---
    const handleEdit = () => {
        navigate(`/edit/${paramId}`);
    };

    if (isLoading) {
        return <div className="page-sheikah flex items-center justify-center text-2xl">唤醒记忆中...</div>;
    }

    return (
        <div className="page-sheikah font-orbitron relative min-h-screen flex flex-col">
            <div className="absolute top-5 left-5 z-20">
                <button onClick={() => navigate('/diaries')} className="btn-zelda-apple">返回图鉴</button>
            </div>
            
            {isAuthor && (
                <div className="absolute top-5 right-5 z-20 flex space-x-2">
                    <button onClick={handleEdit} className="btn-zelda-apple">编辑</button>
                    <button onClick={handleDelete} className="btn-zelda-apple-danger">删除</button>
                </div>
            )}

            <h1 className="title-zelda py-1">{diaryTitle}</h1>
            <main className="flex-grow w-full h-full">
                {sceneData && (
                    <Excalidraw
                        initialData={sceneData}
                    />
                )}
            </main>
        </div>
    );
}