// app/src/pages/DiaryEditor.tsx
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';

// 保持您修正后的 import 结构
import {
    Excalidraw,
    exportToBlob,
    serializeAsJSON,
} from '@excalidraw/excalidraw';
import type {
    ExcalidrawImperativeAPI,
    BinaryFileData,
    AppState,
    DataURL,
    Collaborator,
    // ExcalidrawElement,
    // FileId
} from '@excalidraw/excalidraw/types/types';
import type { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types';
import type { FileId } from '@excalidraw/excalidraw/types/element/types';

// 其他 imports
import '../styles/ExcalidrawCustom.css';
import { useDiarySave } from '../hooks/useSaveDiary';
import type { Mood } from '../types/diary';
import { blobToDataURL } from '../utils/image';
import MoodSelector from '../components/MoodSelector';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchDiaryById } from '../api/diaries';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import useUserStore from '../store/user';
import { toast } from 'react-hot-toast';

function dataURLtoFile(dataurl: string, filename: string): File | null {
    const arr = dataurl.split(',');
    if (arr.length < 2) return null;
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) return null;
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
}

type ParsedDiaryContent = {
    elements?: readonly ExcalidrawElement[];
    appState?: Partial<AppState>;
    files?: Record<string, { id: string; mimeType: string; url?: string; created: number }>;
};

export default function DiaryEdit() {
    const { user } = useUserStore();
    const { id: paramId } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [mood, setMood] = useState<Mood>('happy');
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [diaryId, setDiaryId] = useState<string | null>(null);
    const excalidrawRef = useRef<ExcalidrawImperativeAPI | null>(null);
    const { saveDiary } = useDiarySave(diaryId, setDiaryId);

    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const dirtyRef = useRef(false);
    const serverFileMap = useRef<Record<string, { url?: string }>>({});
    const isSavingRef = useRef(false);
    const markDirty = () => { dirtyRef.current = true; };

    const collaborators = useMemo(
        () => new Map<string, Collaborator>(user._id ? [[user._id, { username: user.username || 'Anonymous', id: user._id }]] : []),
        [user._id, user.username]
    );

    // load diary
    useEffect(() => {
        if (!paramId) return;
        const loadDiary = async () => {
            try {
                const data = await fetchDiaryById(paramId);
                setTitle(data.title || '');
                setMood(data.mood || 'happy');
                setTags(data.tags || []);
                setDiaryId(data._id);
                let parsed: ParsedDiaryContent = {};
                if (data.content) { try { parsed = JSON.parse(data.content); } catch { parsed = {}; } }

                const { elements = [], appState: sceneAppState = {}, files: sceneFiles = {} } = parsed;
                serverFileMap.current = sceneFiles || {};

                // --- 关键修复 1: 构建一个类型完整的 appState 对象 ---
                const completeAppState = {
                    ...sceneAppState,
                    viewBackgroundColor: '#f8f1d5',
                    collaborators,
                    // 使用空值合并运算符 (??) 为所有可能为 undefined 的属性提供确切的默认值
                    contextMenu: sceneAppState.contextMenu ?? null,
                    viewModeEnabled: sceneAppState.viewModeEnabled ?? false,
                    zenModeEnabled: sceneAppState.zenModeEnabled ?? false,
                    gridSize: sceneAppState.gridSize ?? null,
                    // 根据之前的错误日志，补全其他可能引起问题的属性
                    currentChartType: sceneAppState.currentChartType ?? 'bar',
                    currentItemBackgroundColor: sceneAppState.currentItemBackgroundColor ?? 'transparent',
                    currentItemEndArrowhead: sceneAppState.currentItemEndArrowhead ?? 'arrow',
                    currentItemFillStyle: sceneAppState.currentItemFillStyle ?? 'hachure',
                    currentItemFontFamily: sceneAppState.currentItemFontFamily ?? 1,
                    currentItemFontSize: sceneAppState.currentItemFontSize ?? 20,
                    // currentItemLinearStrokeSharpness: sceneAppState.currentItemLinearStrokeSharpness ?? 'sharp',
                    currentItemOpacity: sceneAppState.currentItemOpacity ?? 100,
                    currentItemRoughness: sceneAppState.currentItemRoughness ?? 1,
                    currentItemStartArrowhead: sceneAppState.currentItemStartArrowhead ?? null,
                    currentItemStrokeColor: sceneAppState.currentItemStrokeColor ?? '#000000',
                    currentItemStrokeStyle: sceneAppState.currentItemStrokeStyle ?? 'solid',
                    currentItemStrokeWidth: sceneAppState.currentItemStrokeWidth ?? 1,
                    currentItemTextAlign: sceneAppState.currentItemTextAlign ?? 'left',
                } as AppState;

                const filesArray = await Promise.all(
                    Object.values(sceneFiles).map(async (file) => {
                        if (!file || !file.url) return null;
                        const res = await fetch(`http://localhost:3000${file.url}`);
                        const blob = await res.blob();
                        const dataURL = await blobToDataURL(blob);
                        return {
                            id: file.id as FileId,
                            mimeType: file.mimeType as BinaryFileData['mimeType'],
                            dataURL: dataURL as DataURL,
                            created: file.created,
                        };
                    })
                ).then(results => results.filter((file): file is BinaryFileData => file !== null));

                if (excalidrawRef.current) {
                    excalidrawRef.current.addFiles(filesArray);
                    setTimeout(() => {
                        excalidrawRef.current?.updateScene({ elements, appState: completeAppState});
                    }, 0);
                }

                dirtyRef.current = false; // 重置脏状态
            } catch (err) {
                console.error('读取日记失败:', err);
                toast.error(`读取日记失败: ${err instanceof Error ? err.message : '未知错误'}`);
                navigate('/diaries');
            }
        };
        loadDiary();
    }, [paramId, navigate, collaborators]);

    // --- 更新 buildFormData，修复 serializeAsJSON 参数类型 ---
const buildFormData = useCallback(async () => {
  if (!excalidrawRef.current) return null;

  const snapshotBlob = await generateBlob();
  if (!snapshotBlob) return null;

  // 获取场景数据
  const elements = excalidrawRef.current.getSceneElements();
  const rawAppState = excalidrawRef.current.getAppState();
  const files = excalidrawRef.current.getFiles();

  // 构造完整的 AppState，并断言类型
  const appState = {
    ...rawAppState,
    collaborators: new Map(),
    contextMenu: null,
  } as AppState;

  // 新版 serializeAsJSON 最后一个参数只能是 "local" | "database"
  // 因此我们只传入 "local"，如果需要附加元信息，可在返回后自行封装
  const rawJson = serializeAsJSON(
    elements,
    appState,
    files,
    'local'
  );

  // 如果你需要在 content 中保留自定义 metadata，可以这样做：
  const contentObject = JSON.parse(rawJson);
  const contentWithMeta = JSON.stringify({
    metadata: { type: 'excalidraw', version: 2, source: window.location.origin },
    ...contentObject,
  });

  // 构建 FormData
  const form = new FormData();
  form.append('title', title);
  form.append('mood', mood);
  form.append('content', contentWithMeta);
  tags.forEach(t => form.append('tags', t));
  form.append('snapshot', snapshotBlob, 'snapshot.png');

  // 上传新添加的图片文件
  for (const file of Object.values(files)) {
    if (file.dataURL.startsWith('data:')) {
      const imageFile = dataURLtoFile(file.dataURL, `${file.id}.png`);
      if (imageFile) form.append(file.id, imageFile);
    }
  }

  return form;
}, [title, mood, tags]);



    const handleSuccessfulSave = useCallback(async (response: { data: { content: string } }) => {
        const parsedContent = JSON.parse(response.data.content);
        serverFileMap.current = parsedContent.files || {};
        dirtyRef.current = false;
    }, []);

    const handleSave = useCallback(async () => {
        if (!title.trim()) {
            toast.error('标题不能为空！');
            return { success: false };
        }
        const form = await buildFormData();
        if (!form) return { success: true };
        try {
            const response = await saveDiary(form);
            await handleSuccessfulSave(response);
            // toast.success('保存成功！');
            return { success: true };
        } catch (err) {
            toast.error('保存失败: ' + (err instanceof Error ? err.message : '未知错误'));
            return { success: false };
        }
    }, [title, buildFormData, saveDiary, handleSuccessfulSave]);

    const handleBack = async () => {
        if (!dirtyRef.current || !title.trim()) {
            navigate('/diaries');
            return;
        }
        const result = await handleSave();
        if (result.success) {
            navigate('/diaries');
        }
    };

    // 自动保存
    useEffect(() => {
        // 设置保存间隔，单位为毫秒 (例如：30秒)
        const AUTOSAVE_INTERVAL = 30000; 

        // console.log("自动保存计时器已启动，每30秒检查一次。");

        const intervalId = setInterval(async () => {
            // 检查1：如果当前没有未保存的更改，则跳过
            if (!dirtyRef.current) {
                // console.log("内容无变化，跳过本次自动保存。");
                return;
            }
            // 检查2：如果上一个保存操作还未完成，则跳过
            if (isSavingRef.current) {
                // console.log("正在保存中，跳过本次自动保存。");
                return;
            }

            // console.log("检测到更改，正在执行自动保存...");
            isSavingRef.current = true;
            
            const form = await buildFormData();
            if (!form) {
                isSavingRef.current = false;
                return;
            };

            try {
                const response = await saveDiary(form);
                await handleSuccessfulSave(response); // 这个函数会把 dirtyRef.current 设为 false
                // toast.success('已自动保存！', { duration: 2000 });
            } catch (error) {
                console.error("定时自动保存失败:", error);
                // 定时保存失败一般不强烈打扰用户，只在控制台打印错误
                // 如果需要，也可以加一个不自动消失的 toast
                // toast.error('自动保存失败，请检查网络连接');
            } finally {
                isSavingRef.current = false;
            }

        }, AUTOSAVE_INTERVAL);

        // 组件卸载时，必须清除定时器，防止内存泄漏
        return () => {
            clearInterval(intervalId);
            console.log("自动保存计时器已清除。");
        };

    // 依赖项应包含 useEffect 内部闭包所使用的、且可能变化的函数
    }, [buildFormData, saveDiary, handleSuccessfulSave]);

    const onTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => { setTitle(e.target.value); markDirty(); };
    const onMoodChange = (m: Mood) => { setMood(m); markDirty(); };

    const generateBlob = async (): Promise<Blob | null> => {
        if (!excalidrawRef.current) return null;
        const elements = excalidrawRef.current.getSceneElements();
        const files = excalidrawRef.current.getFiles();
        if (!elements || !elements.length) return null;
        try {
            return await exportToBlob({
                elements,
                files,
                mimeType: 'image/png',
                appState: { exportBackground: true, viewBackgroundColor: '#f8f1d5' },
            });
        } catch (e) {
            console.error(e);
            toast.error('导出 Blob 失败');
            return null;
        }
    };

    const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
            e.preventDefault();
            const newTag = tagInput.trim();
            if (!tags.includes(newTag)) {
                setTags([...tags, newTag]);
                markDirty();
            }
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
        markDirty();
    };

    // 在 DiaryEdit 组件的 return 语句处

return (
    <div className="page-sheikah font-orbitron relative min-h-screen flex flex-col overflow-x-hidden">
        {/* 顶部按钮组 */}
        <div className="absolute top-5 left-10 z-40">
            <button
                onClick={handleBack}
                // 1. 应用基础样式
                // 2. 使用 w-12 h-12 定义按钮大小
                className="btn-zelda-square w-12 h-12"
                aria-label="返回"
            >
                {/* 3. 使用 icon-back shortcut 来显示图标，并用 text-2xl 定义图标大小 */}
                <div className="icon-back text-2xl"></div>
            </button>
        </div>
        <div className="absolute top-10 right-15 z-49 flex">
            {/* <button onClick={generatePreview} className="btn-zelda-apple">预览</button> */}
            <button
                    onClick={() => setSidebarOpen(o => !o)}
                    aria-label={isSidebarOpen ? '收起属性侧边栏' : '打开属性侧边栏'}
                    className={`${
                    isSidebarOpen ? 'icon-sidebar-expand' : 'icon-sidebar-collapse'
                    } transition-colors duration-200 z-49 w-9 h-9`}
                />
            {/* <button onClick={() => handleSave()} className="btn-zelda-apple">
                测试保存
            </button> */}
        </div>

        <img src="/tears-of-kingdom.png" alt="Background" className="absolute top-0 left-0 w-full h-full object-fill z-10 pointer-events-none" />

        <header className="decorative-top py-5 w-full relative z-11 flex items-center justify-center gap-4">
            <input
                type="text"
                maxLength={100}
                placeholder="输入日记标题..."
                value={title}
                onChange={onTitleChange}
                className="input-zelda-apple-lite w-1/2"
            />
        </header>

        <main className="flex-grow w-full h-full relative">
            <ErrorBoundary>
                <div className="absolute inset-0 z-5">
                    <Excalidraw
                        excalidrawAPI={(api) => (excalidrawRef.current = api)}
                        onChange={() => markDirty()}
                        initialData={{
                            appState: { 
                                viewBackgroundColor: '#f8f1d5',
                                collaborators,
                            },
                        }}
                    />
                </div>
            </ErrorBoundary>
        </main>
        
        {/* --- 侧边栏和遮罩层的完整实现 (已采纳您的全部新要求) --- */}
        
        {/* 遮罩层 (Backdrop) */}
        <div
            className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${
                isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            onClick={() => setSidebarOpen(false)}
        />

        {/* 侧边栏本身 */}
        <aside 
            className={`fixed top-0 right-0 h-full p-6 z-41 transition-transform duration-300 ease-in-out flex flex-col
                        font-orbitron text-zeldaGreen 
                        bg-zeldaGold/80 border-l-2 border-l-zeldaGreen 
                        shadow-2xl shadow-black/50 backdrop-blur-lg
                        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
            style={{width: '350px'}}
        >
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-center text-zeldaGreen">日记属性</h2>
                {/* <button 
                    onClick={() => setSidebarOpen(false)}
                    className="icon-sidebar-collapse"
                    aria-label="收起侧边栏"
                >
                </button> */}
            </div>
            
            <div className="space-y-8 flex-grow overflow-y-auto pr-2">
                <div>
                    <label className="block text-zeldaGreen mb-2 font-semibold">心情</label>
                    <MoodSelector mood={mood} onChange={onMoodChange} />
                </div>
                
                <div>
                    <label className="block text-zeldaGreen mb-2 font-semibold">标签</label>
                    
                    {/* 1. 独立的、自动换行的标签展示区 */}
                    <div className="flex flex-wrap gap-2 p-3 mb-3 border border-zeldaGreen/30 rounded-lg min-h-[4rem] bg-black/10">
                        {tags.length > 0 ? tags.map(tag => (
                            <span key={tag} className="taginput-tag flex items-center gap-1 h-10">
                                {tag}
                                <button onClick={() => removeTag(tag)} className="icon-close"></button>
                            </span>
                        )) : (
                            <span className="text-zeldaGreen/60 italic self-center">暂无标签...</span>
                        )}
                    </div>

                    {/* 2. 独立的标签输入框 */}
                    <input
                        type="text"
                        value={tagInput}
                        onChange={e => setTagInput(e.target.value)}
                        onKeyDown={handleTagKeyDown}
                        placeholder="添加新标签后按回车"
                        className="input-zelda-apple-lite w-60"
                    />
                </div>
            </div>
        </aside>

        {/* 预览 Modal */}
        {previewImage && (
            <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center" onClick={() => setPreviewImage(null)}>
                <div className="bg-white border-4 border-sheikahBlue rounded-xl overflow-hidden shadow-2xl p-2" onClick={e => e.stopPropagation()}>
                    <img src={previewImage} alt="预览图" className="w-full h-auto object-contain max-h-[85vh] max-w-[85vw]" />
                </div>
            </div>
        )}
    </div>
);
}