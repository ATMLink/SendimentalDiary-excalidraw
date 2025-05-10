// // app/src/pages/DiaryNew.tsx

import { useState, useRef } from 'react'
import { Excalidraw } from '@excalidraw/excalidraw'
// import { useNavigate } from 'react-router-dom'
import '../styles/ExcalidrawCustom.css'
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types/types'
// import { FileId, DataURL, BinaryFileData } from "@excalidraw/excalidraw";
import type { BinaryFileData, DataURL } from '@excalidraw/excalidraw/types/types'
// import type { BinaryFileData } from '@excalidraw/excalidraw/types/types'
// import {convertToExcalidrawElements} from '@excalidraw/excalidraw/types/element/types'
// import { convertToExcalidrawElements } from '@excalidraw/excalidraw/types/element/types'
// import {convertToExcalidrawElements} from '@excalidraw/excalidraw/types/element/types'
// import type { convertToExcalidrawElements } from '@excalidraw/excalidraw/types/element/types'
import type { FillStyle, StrokeStyle } from '@excalidraw/excalidraw/types/element/types'
import { exportToBlob } from '@excalidraw/excalidraw'
import {useDiarySave} from '../hooks/useSaveDiary'
import type {Mood} from '../types/diary'
import {blobToDataURL} from '../utils/image'
import MoodSelector from '../components/MoodSelector'
// import { data } from 'react-router-dom'


export default function DiaryNew() {
  const [title, setTitle] = useState('')
  const [mood, setMood] = useState<Mood>('happy' as Mood)
  // const [tags, setTags] = useState<string[]>([])
  // const navigate = useNavigate()
  const excalidrawRef = useRef<ExcalidrawImperativeAPI>(null)
  const { saveDiary } = useDiarySave()

  const [previewImage, setPreviewImage] = useState<string | null>(null)

  
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

  // const handleSave = async () => {
  //   const dataUrl = await generatePreview()
  //   if(!dataUrl) return;

  //   saveDiary({ title, mood, image: dataUrl, content: '', tags:[] })
  // }
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

    // 构造 FormData
    const form = new FormData()
    form.append('title', title)
    form.append('mood', mood)
    form.append('content', '')        // 如果你有文本内容，也 append
    // 如果有标签，多次 append
    // tags.forEach(t => form.append('tags', t))

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

      <div className="decorative-top py-6 mx-40% relative z-11 flex items-center gap-4">
        <input
          type="text"
           maxLength={100}
           placeholder="输入日记标题..."
           value={title}
           onChange={e => setTitle(e.target.value)}
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
      <div className="w-screen h-screen relative z-5">
        <Excalidraw
          ref={excalidrawRef}
          viewModeEnabled={false}
          zenModeEnabled={false}
          UIOptions={{
            canvasActions: {
              loadScene: true,
            },
          }}
          initialData={{
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
            {/* <select
              value={mood}
              onChange={e => setMood(e.target.value as typeof mood)}
              className="select-zelda-apple"
            >
              <option value="happy">开心</option>
              <option value="calm">平静</option>
              <option value="sad">难过</option>
              <option value="excited">兴奋</option>
              <option value="anxious">焦虑</option>
            </select> */}
            <MoodSelector mood={mood} onChange = {setMood}/>
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
