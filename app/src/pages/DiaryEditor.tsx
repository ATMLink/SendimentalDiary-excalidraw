// // app/src/pages/DiaryEditor.tsx

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';
import '../styles/ExcalidrawCustom.css';
import type { ExcalidrawImperativeAPI, BinaryFileData, DataURL, Collaborator } from '@excalidraw/excalidraw/types/types';
import type { FillStyle, StrokeStyle, ExcalidrawElement, FileId } from '@excalidraw/excalidraw/types/element/types';
import { exportToBlob } from '@excalidraw/excalidraw';
import { useDiarySave } from '../hooks/useSaveDiary';
import type { Mood } from '../types/diary';
import { blobToDataURL } from '../utils/image';
import MoodSelector from '../components/MoodSelector';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchDiaryById } from '../api/diaries';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import useUserStore from '../store/user';
import { toast } from 'react-hot-toast';

// 解析后的日记内容类型定义
// Type for parsed diary content from backend
type ParsedDiaryContent = {
  elements?: ExcalidrawElement[];
  appState?: Record<string, unknown>;
  files?: Record<string, { id: string; mimeType: string; url?: string; created: number }>;
};

// // @ts-expect-error - We need to set this global for Excalidraw to work locally.
// window.EXCALIDRAW_ASSET_PATH = '/excalidraw-assets/';

export default function DiaryEdit() {
  // 获取当前用户信息
  const { user } = useUserStore();
  // 获取路由参数中的日记ID
  const { id: paramId } = useParams<{ id: string }>();
  // 路由跳转
  const navigate = useNavigate();

  // 日记标题
  const [title, setTitle] = useState('');
  // 心情选择
  const [mood, setMood] = useState<Mood>('happy' as Mood);
  // 标签列表
  const [tags, setTags] = useState<string[]>([]);
  // 标签输入框内容
  const [tagInput, setTagInput] = useState<string>('');
  // 当前日记ID（新建时为null，保存后获得）
  const [diaryId, setDiaryId] = useState<string | null>(null);
  // Excalidraw画布引用
  const excalidrawRef = useRef<ExcalidrawImperativeAPI>(null);
  // 保存日记的自定义hook
  const { saveDiary } = useDiarySave(diaryId, setDiaryId);

  // 预览图片的base64
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  // 标记内容是否有未保存的更改
  const dirtyRef = useRef(false);
  // 服务器已保存的文件映射
  const serverFileMap = useRef<Record<string, { url?: string }>>({});

  // 标记内容已更改
  const markDirty = () => {
    dirtyRef.current = true;
  };

  // 协作用户，仅当前用户
  const collaborators = useMemo(
    () =>
      new Map<string, Collaborator>(
        user._id
          ? [[user._id, { username: user.username || 'Anonymous', id: user._id }]]
          : []
      ),
    [user._id, user.username]
  );

  // 加载日记内容（编辑模式）
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
        if (data.content) {
          try {
            parsed = JSON.parse(data.content);
          } catch {
            parsed = {};
          }
        }

        // 解析画布元素、状态、文件
        const { elements = [], appState: sceneAppState = {}, files: sceneFiles = {} } = parsed;
        serverFileMap.current = sceneFiles || {};
        const appState = { ...sceneAppState, collaborators, viewBackgroundColor: '#f8f1d5', contextMenu: null };

        // 加载图片文件到Excalidraw
        const filesArray = await Promise.all(
          Object.values(sceneFiles).map(async (file) => {
            if (!file || !file.url) {
              return null;
            }
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
            excalidrawRef.current?.updateScene({ elements, appState });
          }, 0);
        }
      } catch (err) {
        // 读取失败跳转列表页
        console.error('读取日记失败:', err);
        toast.error(`读取日记失败: ${err instanceof Error ? err.message : '未知错误'}，正在跳转列表页`);
        navigate('/diaries');
      }
    };

    loadDiary();
  }, [paramId, navigate, collaborators]);
  

  // 构建用于提交的FormData对象，包含画布快照、内容、标签等
  const buildFormData = useCallback(async () => {
    const blob = await generateBlob(); // 生成画布快照图片
    if (!blob) {
      return null;
    }

    // 获取当前画布元素、状态、文件
    const scene = excalidrawRef.current?.getSceneElements();
    const appState = excalidrawRef.current?.getAppState();
    const files = excalidrawRef.current?.getFiles() || {};
    // 清理文件信息，合并服务器已保存的url
    const cleanedFiles = files
      ? Object.fromEntries(
          Object.entries(files).map(([key, file]: [string, BinaryFileData & { url?: string }]) => {
            const serverFile = serverFileMap.current[file.id];
            return [
              key,
              {
                id: file.id,
                mimeType: file.mimeType,
                created: file.created,
                url: serverFile ? serverFile.url : undefined,
              },
            ];
          })
        )
      : {};

    const form = new FormData();
    form.append('title', title);
    form.append('mood', mood);
    form.append(
      'content',
      JSON.stringify({
        elements: scene,
        appState: { ...appState, collaborators, contextMenu: null },
        files: cleanedFiles,
      })
    );
    tags.forEach(t => form.append('tags', t));
    form.append('images', blob, 'snapshot.png');

    // 附加内容图片（如有）
    if (scene) {
      scene.forEach(element => {
        if (element.type === 'image' && element.customData?.originalFile instanceof File) {
          const file = element.customData.originalFile as File;
          form.append('contentImages', file, `content-image-${element.fileId}.png`);
        }
      });
    }

    return form;
  }, [title, mood, tags, collaborators]);
  
  // 字符串转FileId类型
  function toFileId(id: string): FileId {
    return id as FileId;
  }

  // 根据文件信息批量加载图片到Excalidraw画布
  const updateSceneWithFiles = useCallback(async (
    files: Record<string, { id: string; mimeType: string; url?: string; created: number }>
  ) => {
    if (!excalidrawRef.current || !files) return;

    const processedFiles: BinaryFileData[] = [];
    for (const file of Object.values(files)) {
      if (file.url) {
        try {
          const res = await fetch(`http://localhost:3000${file.url}`);
          const blob = await res.blob();
          const dataURL = await blobToDataURL(blob);

          processedFiles.push({
            id: toFileId(file.id),
            mimeType: file.mimeType as BinaryFileData['mimeType'],
            dataURL: dataURL as DataURL,
            created: file.created,
          });
        } catch (error) {
          console.error('加载图片失败:', error);
          toast.error(`图片加载失败: ${file.url}`);
          continue;
        }
      }
    }
    excalidrawRef.current.addFiles(processedFiles);
  }, []);

  // 保存成功后处理：同步服务器文件映射，刷新画布文件，重置脏标记
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSuccessfulSave = useCallback(async (response: any) => {
    const parsedContent = JSON.parse(response.data.content);
    serverFileMap.current = parsedContent.files || {};
    await updateSceneWithFiles(parsedContent.files);
    dirtyRef.current = false;
  }, [updateSceneWithFiles]);

  // 自动保存定时器，每30秒检测内容变更并自动保存
  useEffect(() => {
    const id = setInterval(async () => {
      if (!dirtyRef.current || !title.trim()) {
        return;
      }

      const form = await buildFormData();
      if (!form) {
        return;
      }

      try {
        const response = await saveDiary(form);
        await handleSuccessfulSave(response);
        toast.success('自动保存成功');
      } catch (err) {
        console.error('Auto-save failed:', err);
        toast.error('自动保存失败');
      }
    }, 30_000);

    return () => clearInterval(id);
  }, [title, mood, tags, saveDiary, collaborators, diaryId, buildFormData, handleSuccessfulSave]);

  // 标题输入框变更事件
  const onTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    markDirty();
  };
  // 心情选择变更事件
  const onMoodChange = (m: Mood) => {
    setMood(m);
    markDirty();
  };

  // 生成画布预览图（base64）
  const generatePreview = async (): Promise<string | null> => {
    if (!excalidrawRef.current) return null;

    try {
      const elements = excalidrawRef.current.getSceneElements();
      const files = excalidrawRef.current.getFiles() || {};

      if (!elements.length) return null;

      const blob = await exportToBlob({
        elements,
        files,
        mimeType: 'image/png',
        appState: {
          exportBackground: true,
          viewBackgroundColor: '#f8f1d5',
        },
      });

      const dataUrl = await blobToDataURL(blob);
      setPreviewImage(dataUrl);
      return dataUrl;
    } catch (error) {
      console.error('截图生成失败:', error);
      if (error instanceof DOMException && error.name === 'SecurityError') {
        toast.error('截图生成失败，请检查图片来源是否支持 CORS');
      } else {
        toast.error('截图生成失败');
      }
      return null;
    }
  };
  
  // 生成画布快照Blob对象
  const generateBlob = async (): Promise<Blob | null> => {
    const api = excalidrawRef.current;
    if (!api) return null;
    const elements = api.getSceneElements();
    const files = api.getFiles() || {};

    if (!elements.length) return null;

    try {
      return await exportToBlob({
        elements: elements,
        files: files,
        mimeType: 'image/png',
        appState: {
          exportBackground: true,
          viewBackgroundColor: '#f8f1d5',
        },
      });
    } catch (e) {
      console.error('导出 Blob 失败:', e);
      if (e instanceof DOMException && e.name === 'SecurityError') {
        toast.error('导出 Blob 失败，请检查图片来源是否支持 CORS');
      } else {
        toast.error('导出 Blob 失败');
      }
      return null;
    }
  };

  // 标签输入框按键事件，支持回车/逗号添加标签
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

  // 删除标签
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
    markDirty();
  };

  // 手动保存按钮事件
  const handleSave = useCallback(async () => {
    if (!title.trim()) {
      toast.error('标题不能为空！');
      return {success: false};
    }

    const form = await buildFormData();
    if (!form) {
      return {success: true};
    }

    try {
      const response = await saveDiary(form);
      await handleSuccessfulSave(response);
      toast.success('手动保存成功');
      return {success: true}
    } catch (err) {
      console.error('Manual save failed:', err);
      toast.error('手动保存失败: ' + (err instanceof Error ? err.message : '未知错误'));
      return {success: false}
    }
  },[title, buildFormData, saveDiary, handleSuccessfulSave])

  // 返回按钮的点击处理函数
  const handleBack = async () => {
    if(!dirtyRef.current || !title.trim()) {
      navigate('/diaries');
      return;
    }

    const result = await handleSave();

    if( result.success) {
      navigate('/diaries');
    }
  }

  // 图片上传处理，读取图片并插入到Excalidraw画布
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !excalidrawRef.current) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = dataUrl;

      img.onload = () => {
        const now = Date.now();
        const id = toFileId(`image-${now}`);
        const files: BinaryFileData[] = [
          {
            id,
            mimeType: file.type as BinaryFileData['mimeType'],
            dataURL: dataUrl as DataURL,
            created: now,
          },
        ];

        const api = excalidrawRef.current!;
        api.addFiles(files);

        // 构造图片元素并插入画布
        const imageElement: ExcalidrawElement = {
          id: `img-elem-${now}` as ExcalidrawElement['id'],
          type: 'image' as const,
          x: 100,
          y: 100,
          width: img.naturalWidth,
          height: img.naturalHeight,
          angle: 0,
          strokeColor: 'transparent',
          backgroundColor: 'transparent',
          fillStyle: 'solid' as FillStyle,
          strokeWidth: 1,
          roughness: 0,
          opacity: 100,
          groupIds: [],
          boundElements: null,
          seed: Math.floor(Math.random() * 100000),
          version: 1,
          versionNonce: Math.floor(Math.random() * 100000),
          isDeleted: false,
          updated: now,
          locked: false,
          status: 'pending' as const,
          fileId: id,
          strokeStyle: 'solid' as StrokeStyle,
          roundness: null,
          link: null,
          customData: { originalFile: file },
          scale: [1, 1],
        };

        api.updateScene({
          elements: [...api.getSceneElements(), imageElement],
        });
        markDirty();
      };
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // return (
  //   <div className="page-sheikah font-orbitron relative min-h-[1024px]">
  //     <div className="absolute top-5 left-5 z-20">
  //         <button onClick={handleBack} className="btn-zelda-apple">
  //           返回
  //         </button>
  //     </div>
  //     <img
  //       src="/tears-of-kingdom.png"
  //       alt="Background"
  //       className="absolute top-0 left-0 w-full h-full object-fill z-10 pointer-events-none"
  //     />

  //     <div className="decorative-top py-5 mx-40% relative z-11 flex items-center gap-4">
  //       <div className="taginput-zelda">
  //         {tags.map(tag => (
  //           <span key={tag} className="taginput-tag flex items-center gap-1">
  //             {tag}
  //             <button
  //               onClick={() => removeTag(tag)}
  //               className="text-red-300 hover:text-red-500 font-bold bg-transparent"
  //             >
  //               x
  //             </button>
  //           </span>
  //         ))}
  //         <input
  //           type="text"
  //           value={tagInput}
  //           onChange={e => setTagInput(e.target.value)}
  //           onKeyDown={handleTagKeyDown}
  //           placeholder="输入标签..."
  //           className="taginput-input"
  //         />
  //       </div>

  //       <input
  //         type="text"
  //         maxLength={100}
  //         placeholder="输入日记标题..."
  //         value={title}
  //         onChange={onTitleChange}
  //         className="input-zelda-apple-lite"
  //       />
  //     </div>

  //     <input
  //       id="image-upload"
  //       type="file"
  //       accept="image/*"
  //       capture="environment"
  //       className="hidden"
  //       onChange={handleImageUpload}
  //     />

  //     <ErrorBoundary>
  //       <div className="w-screen h-screen relative z-5">
  //         <Excalidraw
  //           ref={excalidrawRef}
  //           onChange={() => {
  //             markDirty()
  //           }}
  //           viewModeEnabled={false}
  //           zenModeEnabled={false}
  //           UIOptions={{
  //             canvasActions: {
  //               loadScene: true,
  //             },
  //           }}
  //           initialData={{
  //             collaborators,
  //             appState: {
  //               viewBackgroundColor: '#f8f1d5',
  //               collaborators,
  //               contextMenu: null,
  //             },
  //             elements: Array.from({ length: 50 }, (_, i) => {
  //               const y = 100 + i * 60
  //               return {
  //                 id: `line-${i}`,
  //                 type: "line",
  //                 x: 0,
  //                 y,
  //                 width: 5000,
  //                 height: 0,
  //                 angle: 0,
  //                 strokeColor: "#3e6c4e",
  //                 backgroundColor: "transparent",
  //                 fillStyle: "hachure",
  //                 strokeWidth: 2,
  //                 strokeStyle: "solid",
  //                 roughness: 0,
  //                 opacity: 50,
  //                 groupIds: [],
  //                 roundness: null,
  //                 seed: Math.floor(Math.random() * 100000),
  //                 version: 1,
  //                 versionNonce: Math.floor(Math.random() * 100000),
  //                 isDeleted: false,
  //                 boundElements: null,
  //                 updated: Date.now(),
  //                 link: null,
  //                 locked: true,
  //                 points: [
  //                   [0, 0],
  //                   [2500, 0],
  //                 ],
  //                 lastCommittedPoint: null,
  //                 startBinding: null,
  //                 endBinding: null,
  //                 startArrowhead: null,
  //                 endArrowhead: null,
  //               } as ExcalidrawElement
  //             }),
  //           }}
  //         >
  //           <div className="absolute top-2 right-20% flex gap-2 z-4">
  //             {/* <MoodSelector mood={mood} onChange={onMoodChange} /> */}
  //             <button
  //               onClick={() => document.getElementById('image-upload')?.click()}
  //               className="btn-zelda-apple"
  //             >
  //               插入图片
  //             </button>
  //             {/* <button onClick={generatePreview} className="btn-zelda-apple">
  //               预览
  //             </button> */}
  //             {/* <button onClick={handleSave} className="btn-zelda-apple">
  //               保存
  //             </button> */}
  //           </div>
  //         </Excalidraw>
  //       </div>
  //     </ErrorBoundary>

  //     {previewImage && (
  //       <div className="absolute top-10 left-10 w-80% max-w-800px bg-white border-2 border-blue-500 rounded-xl overflow-hidden shadow-lg z-100 p-4">
  //         <img src={previewImage} alt="预览图" className="w-full h-auto object-contain" />
  //         <button
  //           onClick={() => setPreviewImage(null)}
  //           className="mt-2 p-2 bg-red-500 text-white rounded"
  //         >
  //           关闭预览
  //         </button>
  //       </div>
  //     )}
  //   </div>
  // )
  return (
    <div className="page-sheikah font-orbitron relative min-h-[1024px] flex flex-col">
      <div className="absolute top-5 left-5 z-20">
          <button onClick={handleBack} className="btn-zelda-apple">
            返回
          </button>
      </div>

      <img
        src="/tears-of-kingdom.png"
        alt="Background"
        className="absolute top-0 left-0 w-full h-full object-fill z-10 pointer-events-none"
      />

      <header className="decorative-top py-5 w-full relative z-11 flex items-center justify-center gap-4">
        {/* Mood选择器 */}
        <MoodSelector mood={mood} onChange={onMoodChange} />

        {/* 标题输入 */}
        <input
          type="text"
          maxLength={100}
          placeholder="输入日记标题..."
          value={title}
          onChange={onTitleChange}
          className="input-zelda-apple-lite w-1/3" // 增加宽度
        />

        {/* 预览和插入图片按钮 */}
        <button onClick={generatePreview} className="btn-zelda-apple">
          预览
        </button>
        <button
          onClick={() => document.getElementById('image-upload')?.click()}
          className="btn-zelda-apple"
        >
          插入图片
        </button>
      </header>

      <input
        id="image-upload"
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleImageUpload}
      />

      <main className="flex-grow w-full h-full relative">
        <ErrorBoundary>
          <div className="absolute inset-0 z-5">
            <Excalidraw
              ref={excalidrawRef}
              onChange={() => {
                markDirty()
              }}
              viewModeEnabled={false}
              zenModeEnabled={false}
              UIOptions={{
                canvasActions: {
                  loadScene: true,
                },
              }}
              initialData={{
                collaborators,
                appState: {
                  viewBackgroundColor: '#f8f1d5',
                  collaborators,
                  contextMenu: null,
                },
                elements: Array.from({ length: 50 }, (_, i) => {
                  const y = 100 + i * 60
                  return {
                    id: `line-${i}`, type: "line", x: 0, y, width: 5000, height: 0, angle: 0,
                    strokeColor: "#3e6c4e", backgroundColor: "transparent", fillStyle: "hachure",
                    strokeWidth: 2, strokeStyle: "solid", roughness: 0, opacity: 50, groupIds: [],
                    roundness: null, seed: Math.floor(Math.random() * 100000), version: 1,
                    versionNonce: Math.floor(Math.random() * 100000), isDeleted: false,
                    boundElements: null, updated: Date.now(), link: null, locked: true,
                    points: [[0, 0], [2500, 0]], lastCommittedPoint: null, startBinding: null,
                    endBinding: null, startArrowhead: null, endArrowhead: null,
                  } as ExcalidrawElement
                }),
              }}
            />
          </div>
        </ErrorBoundary>
      </main>
      
      {/* --- 新增: 标签输入移动到底部 --- */}
      <footer className="w-full py-3 flex justify-center items-center relative z-11">
        <div className="taginput-zelda">
          {tags.map(tag => (
            <span key={tag} className="taginput-tag flex items-center gap-1">
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="text-red-300 hover:text-red-500 font-bold bg-transparent"
              >
                ×
              </button>
            </span>
          ))}
          <input
            type="text"
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder="输入标签..."
            className="taginput-input"
          />
        </div>
      </footer>


      {previewImage && (
        <div className="absolute top-10 left-10 w-80% max-w-800px bg-white border-2 border-blue-500 rounded-xl overflow-hidden shadow-lg z-100 p-4">
          <img src={previewImage} alt="预览图" className="w-full h-auto object-contain" />
          <button
            onClick={() => setPreviewImage(null)}
            className="mt-2 p-2 bg-red-500 text-white rounded"
          >
            关闭预览
          </button>
        </div>
      )}
    </div>
  )

}