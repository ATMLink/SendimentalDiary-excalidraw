// // app/src/pages/DiaryEditor.tsx

import { useState, useRef, useEffect } from 'react'
import {Excalidraw} from '@excalidraw/excalidraw'
// import { useNavigate } from 'react-router-dom'
import '../styles/ExcalidrawCustom.css'
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types/types'
import type { BinaryFileData, DataURL } from '@excalidraw/excalidraw/types/types'
import type { FillStyle, StrokeStyle } from '@excalidraw/excalidraw/types/element/types'
import { exportToBlob } from '@excalidraw/excalidraw'
import {useDiarySave} from '../hooks/useSaveDiary'
import type {Mood} from '../types/diary'
import {blobToDataURL} from '../utils/image'
import MoodSelector from '../components/MoodSelector'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchDiaryById } from '../api/diaries'
import type {AppState} from '@excalidraw/excalidraw/types/types'
import type { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types'
import { ErrorBoundary } from '../components/common/ErrorBoundary'

export default function DiaryEdit() {

  const {id: paramId} = useParams<{id: string}>()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [mood, setMood] = useState<Mood>('happy' as Mood)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState<string>("")
  const [diaryId, setDiaryId] = useState<string | null>(null)
  // const navigate = useNavigate()
  const excalidrawRef = useRef<ExcalidrawImperativeAPI>(null)
  const { saveDiary } = useDiarySave(diaryId, setDiaryId)

  const [previewImage, setPreviewImage] = useState<string | null>(null)

  const dirtyRef = useRef(false)
  const markDirty = () => {
    dirtyRef.current = true
  }

  // 加载日记
  useEffect(() => {
  if (!paramId) return;

  (async () => {
    try {
      const data = await fetchDiaryById(paramId);

      // 保持原有字段恢复
      setTitle(data.title || '');
      setMood(data.mood || 'happy');
      setTags(data.tags || []);
      setDiaryId(data._id);

      // 安全解析 content
      type Parsed = {
        elements?: ExcalidrawElement[];
        appState?: Partial<AppState>;
        files?: { url: string }[];
      };
      let parsed: Parsed = {};
      if (data.content) {
        try {
          parsed = JSON.parse(data.content);
        } catch {
          parsed = {};
        }
      }

      // 恢复元素与状态
      const elements = Array.isArray(parsed.elements) ? parsed.elements : [];
      const appState = parsed.appState
        ? (parsed.appState as AppState)
        : ({} as AppState);

      // CHANGED: 转成 BinaryFileData，使用 url 作为 id 和 dataURL，以满足类型
      const filesArray: BinaryFileData[] = Array.isArray(parsed.files)
        ? parsed.files.map(f => ({
            id: f.url as unknown as BinaryFileData['id'],
            mimeType: 'image/png',
            created: Date.now(),
            dataURL: f.url as unknown as DataURL,
          }))
        : [];

      // 注入文件
      if (filesArray.length && excalidrawRef.current) {
        excalidrawRef.current.addFiles(filesArray);
      }

      // 恢复场景
      excalidrawRef.current?.updateScene({ elements, appState });
    } catch (err) {
      console.error('读取日记失败:', err);
      alert(
        `读取日记失败: ${((err as Error).message) || '未知错误'}，正在跳转列表页`
      );
      navigate('/diaries');
    }
  })();
}, [paramId, navigate]);

  // useEffect(() => {
  //   // 30 秒定时自动保存
  //   const id = setInterval(async () => {
  //     if (!dirtyRef.current) return
  //     // 调用跟点击保存同样的逻辑
  //     if (!title.trim()) return
  //     const blob = await generateBlob()
  //     if (!blob) return
  //     const form = new FormData()
  //     form.append('title', title)
  //     form.append('mood', mood)
  //     form.append('content', '')
  //     tags.forEach(t => form.append('tags', t))
  //     form.append('images', blob, 'snapshot.png')
  //     saveDiary(form)
  //     dirtyRef.current = false // 重置改动标记
  //   }, 30_000)

  //   return () => clearInterval(id)  // 卸载时清理
  // }, [title, mood, tags, saveDiary]) 

  // 自动保存
  useEffect(() => {
    const id = setInterval(async () => {
      if (!dirtyRef.current) return;
      if (!title.trim()) return;
      const blob = await generateBlob();
      if (!blob) return;

      const scene = excalidrawRef.current?.getSceneElements();
      const appState = excalidrawRef.current?.getAppState();
      const files = excalidrawRef.current?.getFiles() || {};

      // 清理 files 中的 dataURL
      const cleanedFiles = files
        ? Object.fromEntries(
            Object.entries(files).map(([key, file]) => [
              key,
              {
                id: file.id,
                mimeType: file.mimeType,
                created: file.created,
              } as BinaryFileData,
            ])
          )
        : {};

      const form = new FormData();
      form.append('title', title);
      form.append('mood', mood);
      form.append('content', JSON.stringify({ elements: scene, appState, files: cleanedFiles }));
      tags.forEach(t => form.append('tags', t));
      form.append('images', blob, 'snapshot.png');

      // 上传 content 中的图片
      if (scene) {
        scene.forEach(element => {
          if (element.type === 'image' && element.customData?.originalFile) {
            const file = element.customData.originalFile as File;
            form.append('images', file, `content-image-${element.fileId}.png`);
          }
        });
      }

      console.log('Auto-saving content size (bytes):', new TextEncoder().encode(JSON.stringify({ elements: scene, appState, files: cleanedFiles })).length);
      saveDiary(form);
      dirtyRef.current = false;
    }, 30_000);

    return () => clearInterval(id);
  }, [title, mood, tags, saveDiary]);

  // 在任何改变 title / mood / tags / 画布操作 后都调用 markDirty()
  const onTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
    markDirty()
  }
  const onMoodChange = (m: Mood) => {
    setMood(m)
    markDirty()
  }

  const generatePreview = async (): Promise<string | null> => {
    if (!excalidrawRef.current) return null

    try {
      const elements = excalidrawRef.current.getSceneElements()
      const files = excalidrawRef.current.getFiles()
      if (!elements.length) return null

      const blob = await exportToBlob({
        elements,
        files,
        mimeType: 'image/png',
        quality: 0.8,
        appState: {
          exportBackground: true,
          viewBackgroundColor: '#f8f1d5',
        },
      })

      const dataUrl = await blobToDataURL(blob)
      setPreviewImage(dataUrl)
      return dataUrl
    } catch (error) {
      console.error('截图生成失败:', error)
      return null
    }
  }

  const generateBlob = async (): Promise<Blob | null> => {
    const api = excalidrawRef.current
    if (!api) return null
    const elements = api.getSceneElements()
    const files = api.getFiles()
    if (!elements.length) return null

    try {
      return await exportToBlob({
        elements,
        files,
        mimeType: 'image/png',
        quality: 0.8,
        appState: {
          exportBackground: true,
          viewBackgroundColor: '#f8f1d5',
        },
      })
    } catch (e) {
      console.error('导出 Blob 失败', e)
      return null
    }
  }

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if((e.key === "Enter" || e.key === ",") && tagInput.trim()){
      e.preventDefault()
      const newTag = tagInput.trim()
      if(!tags.includes(newTag)){
        setTags([...tags, newTag])
        markDirty()
      }
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
    markDirty()
  }

  const handleSave = async () => {
    if (!title.trim()) {
      alert('标题不能为空！')
      return
    }
    const blob = await generateBlob()
    if (!blob) {
      alert('没有内容可保存')
      return
    }

    const scene = excalidrawRef.current?.getSceneElements()
    const appState = excalidrawRef.current?.getAppState()
    const files = excalidrawRef.current?.getFiles()

    // 清理 files 中的 dataURL
      const cleanedFiles = files
        ? Object.fromEntries(
            Object.entries(files).map(([key, file]) => [
              key,
              {
                id: file.id,
                mimeType: file.mimeType,
                created: file.created,
              } as BinaryFileData,
            ])
          )
        : {};
    // 构造 FormData
    const form = new FormData()
    form.append('title', title)
    form.append('mood', mood)
    form.append('content', JSON.stringify({elements: scene, appState, files: cleanedFiles}))        // 如果你有文本内容，也 append
    // 如果有标签，多次 append
    tags.forEach(tag => form.append('tags', tag))

    // key 要和后端 upload.array('images') 里的一致
    form.append('images', blob, 'snapshot.png')

    saveDiary(form)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file || !excalidrawRef.current) return;

  const supportedMimeTypes = [
    "image/png",
    "image/jpeg",
    "image/svg+xml",
    "image/gif",
    "image/webp",
    "image/bmp",
    "image/x-icon",
    "application/octet-stream",
  ];

  if (!supportedMimeTypes.includes(file.type)) {
    alert("不支持的图片类型！");
    return;
  }

  const reader = new FileReader();
  reader.onload = async () => {
    const dataUrl = reader.result as string;
    const img = new Image();
    img.src = dataUrl;

    img.onload = () => {
      const now = Date.now();
      const id = `image-${now}` as string as BinaryFileData["id"]
      const files: BinaryFileData[] = [
        {
          id,
          mimeType: file.type as BinaryFileData["mimeType"],
          dataURL: dataUrl as DataURL,
          created: now,
        },
      ];

      const api = excalidrawRef.current!;
      api.addFiles(files);

      const imageElement = {
        id: `img-elem-${now}`,
        type: "image" as const,
        x: 100,
        y: 100,
        width: img.naturalWidth,
        height: img.naturalHeight,
        angle: 0,
        strokeColor: "transparent",
        backgroundColor: "transparent",
        fillStyle: "solid" as FillStyle,
        strokeWidth: 1,
        roughness: 0,
        opacity: 100,
        groupIds: [],
        boundElementIds: [],
        seed: Math.floor(Math.random() * 100000),
        version: 1,
        versionNonce: Math.floor(Math.random() * 100000),
        isDeleted: false,
        updated: now,
        locked: false,
        status: "pending" as const,
        fileId: id,
        strokeStyle: "solid" as StrokeStyle, // 你也可以设置为 "dashed" 或 "dotted"
        roundness: null,
        boundElements: [],
        link: null,
        customData: {},
        scale: [1, 1],
      };


      api.updateScene({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        elements: [...api.getSceneElements(), imageElement as any],
      });
      markDirty()
    };
  };
  reader.readAsDataURL(file);
  e.target.value = '';
  
};
  

  return (
    <div className="page-sheikah font-orbitron relative min-h-[1024px]">
      <img
        src="/tears-of-kingdom.png"
        alt="Background"
        className="absolute top-0 left-0 w-full h-full object-fill z-10 pointer-events-none"
      />

      <div className="decorative-top py-5 mx-40% relative z-11 flex items-center gap-4">
        
        <div className="taginput-zelda">
          {tags.map((tag) => (
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
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder="输入标签..."
            className="taginput-input"
          />
        </div>
        
        <input
          type="text"
           maxLength={100}
           placeholder="输入日记标题..."
           value={title}
           onChange={onTitleChange}
           className="input-zelda-apple-lite"
         />
      </div>

      <input
        id="image-upload"
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleImageUpload}
      />

      {/* Excalidraw 区域 */}
      <ErrorBoundary>
        <div className="w-screen h-screen relative z-5">
          <Excalidraw
            ref={excalidrawRef}
            onChange={(elements, appState) => {
              console.log('Excalidraw collaborators:', appState.collaborators);
              markDirty();
            }}
            viewModeEnabled={false}
            zenModeEnabled={false}
            UIOptions={{
              canvasActions: {
                loadScene: true,
              },
            }}
            initialData={{
              collaborators: new Map(),
              appState: {
                viewBackgroundColor: "#f8f1d5",
              },
              elements: Array.from({ length: 50 }, (_, i) => {
                const y = 100 + i * 60
                return {
                  id: `line-${i}`,
                  type: "line",
                  x: 0,
                  y,
                  width: 5000,
                  height: 0,
                  points: [[0, 0], [2500, 0]],
                  angle: 0,
                  strokeColor: "#3e6c4e",
                  backgroundColor: "transparent",
                  strokeWidth: 2,
                  roughness: 0,
                  opacity: 50,
                  seed: Math.floor(Math.random() * 100000),
                  version: 1,
                  versionNonce: Math.floor(Math.random() * 100000),
                  isDeleted: false,
                  groupIds: [],
                  boundElementIds: [],
                  updated: Date.now(),
                  locked: true,
                }
              }),
            }}
          >

            {/* 工具栏右侧：情绪选择 + 保存按钮 */}
            <div className="absolute top-2 right-20% flex gap-2 z-4">

              <MoodSelector mood={mood} onChange = {onMoodChange}/>
              <button
                onClick={() => document.getElementById('image-upload')?.click()}
                className="btn-zelda-apple"
              >
                插入图片
              </button>
              <button onClick={generatePreview} className="btn-zelda-apple">
                预览
              </button>
              {/* <button onClick={handleSave} className="btn-zelda-apple"> */}
              <button onClick={handleSave} className="btn-zelda-apple">
                保存
              </button>
              
            </div>
          </Excalidraw>
        </div>
      </ErrorBoundary>
      {/* 预览图展示 */}
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
