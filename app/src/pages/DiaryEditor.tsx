// // app/src/pages/DiaryEditor.tsx


// import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
// import { Excalidraw } from '@excalidraw/excalidraw'
// import '../styles/ExcalidrawCustom.css'
// import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types/types'
// import type { BinaryFileData, DataURL } from '@excalidraw/excalidraw/types/types'
// import type { FillStyle, StrokeStyle } from '@excalidraw/excalidraw/types/element/types'
// import { exportToBlob } from '@excalidraw/excalidraw'
// import { useDiarySave } from '../hooks/useSaveDiary'
// import type { Mood } from '../types/diary'
// import { blobToDataURL } from '../utils/image'
// import MoodSelector from '../components/MoodSelector'
// import { useParams, useNavigate } from 'react-router-dom'
// import { fetchDiaryById } from '../api/diaries'
// import type { AppState } from '@excalidraw/excalidraw/types/types'
// import type { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types'
// import { ErrorBoundary } from '../components/common/ErrorBoundary'
// import useUserStore from '../store/user'
// import type { Collaborator } from '@excalidraw/excalidraw/types/types'
// import { toast } from 'react-hot-toast'
// import type { NormalizedZoomValue } from '@excalidraw/excalidraw/types/types'
// import type { FileId } from '@excalidraw/excalidraw/types/element/types'


// export default function DiaryEdit() {
//   const { user } = useUserStore()
//   const { id: paramId } = useParams<{ id: string }>()
//   const navigate = useNavigate()

//   const [title, setTitle] = useState('')
//   const [mood, setMood] = useState<Mood>('happy' as Mood)
//   const [tags, setTags] = useState<string[]>([])
//   const [tagInput, setTagInput] = useState<string>("")
//   const [diaryId, setDiaryId] = useState<string | null>(null)
//   const excalidrawRef = useRef<ExcalidrawImperativeAPI>(null)
//   const { saveDiary } = useDiarySave(diaryId, setDiaryId)

//   const [previewImage, setPreviewImage] = useState<string | null>(null)

//   const dirtyRef = useRef(false)
//   const markDirty = () => {
//     dirtyRef.current = true
//   }

//   const collaborators = useMemo(
//     () =>
//       new Map<string, Collaborator>(
//         user._id
//           ? [
//               [
//                 user._id,
//                 {
//                   username: user.username || 'Anonymous',
//                   id: user._id,
//                 },
//               ],
//             ]
//           : []
//       ),
//     [user._id, user.username]
//   )

//   // // 加载日记
//   // useEffect(() => {
//   //   if (!paramId) return

//   //   const loadDiary = async () => {
//   //     try {
//   //       const data = await fetchDiaryById(paramId)

//   //       setTitle(data.title || '')
//   //       setMood(data.mood || 'happy')
//   //       setTags(data.tags || [])
//   //       setDiaryId(data._id)

//   //       // 安全解析 content
//   //       type Parsed = {
//   //         elements?: ExcalidrawElement[]
//   //         appState?: Partial<AppState>
//   //         files?: Record<string, { id: string; mimeType: string; url: string; created: number }>
//   //       }
//   //       let parsed: Parsed = {}
//   //       if (data.content) {
//   //         try {
//   //           parsed = JSON.parse(data.content)
//   //         } catch {
//   //           parsed = {}
//   //         }
//   //       }

//   //       // 恢复元素与状态
//   //       const elements = Array.isArray(parsed.elements) ? parsed.elements : []
//   //       const appState: Partial<AppState> = parsed.appState
//   //         ? {
//   //             ...parsed.appState,
//   //             collaborators,
//   //             viewBackgroundColor: '#f8f1d5',
//   //             contextMenu: null,
//   //           }
//   //         : {
//   //             collaborators,
//   //             viewBackgroundColor: '#f8f1d5',
//   //             contextMenu: null,
//   //           }

//   //       // 格式化 files 为 BinaryFileData
//   //       const filesArray: BinaryFileData[] = parsed.files
//   //         ? Object.entries(parsed.files).map(([key, file]) => {
//   //             const url = file.url ? `http://localhost:3000${file.url}` : null
//   //             if (!url) {
//   //               console.warn(`File ${key} has no URL`)
//   //             }
//   //             return {
//   //               id: file.id || key,
//   //               mimeType: file.mimeType || 'image/png',
//   //               created: file.created || Date.now(),
//   //               dataURL: url as DataURL,
//   //             }
//   //           })
//   //         : []

//   //       // 验证 elements 和 files 匹配
//   //       elements.forEach((el: any) => {
//   //         if (el.type === 'image' && el.fileId && !filesArray.find(f => f.id === el.fileId)) {
//   //           console.warn(`File ${el.fileId} not found in files`)
//   //         }
//   //       })

//   //       // 注入文件
//   //       if (filesArray.length && excalidrawRef.current) {
//   //         console.log('Adding files to Excalidraw:', filesArray)
//   //         excalidrawRef.current.addFiles(filesArray)
//   //       }

//   //       // 恢复场景
//   //       excalidrawRef.current?.updateScene({ elements, appState })
//   //     } catch (err) {
//   //       console.error('读取日记失败:', err)
//   //       toast.error(
//   //         `读取日记失败: ${err instanceof Error ? err.message : '未知错误'}，正在跳转列表页`
//   //       )
//   //       navigate('/diaries')
//   //     }
//   //   }

//   //   loadDiary()
//   // }, [paramId, navigate, collaborators])

//   // // 加载日记
//   // useEffect(() => {
//   //   if (!paramId) return;

//   //   const loadDiary = async () => {
//   //     try {
//   //       const data = await fetchDiaryById(paramId);

//   //       setTitle(data.title || '');
//   //       setMood(data.mood || 'happy');
//   //       setTags(data.tags || []);
//   //       setDiaryId(data._id);

//   //       type Parsed = {
//   //         elements?: ExcalidrawElement[];
//   //         appState?: Partial<AppState>;
//   //         files?: Record<string, { id: string; mimeType: string; url: string; created: number }>;
//   //       };
//   //       let parsed: Parsed = {};
//   //       if (data.content) {
//   //         try {
//   //           parsed = JSON.parse(data.content);
//   //         } catch {
//   //           parsed = {};
//   //         }
//   //       }

//   //       const elements = Array.isArray(parsed.elements) ? parsed.elements : [];
//   //       const appState: Partial<AppState> = parsed.appState
//   //         ? {
//   //             ...parsed.appState,
//   //             collaborators,
//   //             viewBackgroundColor: '#f8f1d5',
//   //             contextMenu: null,
//   //             zoom: parsed.appState.zoom ?? (1 as NormalizedZoomValue),
//   //           }
//   //         : {
//   //             collaborators,
//   //             viewBackgroundColor: '#f8f1d5',
//   //             contextMenu: null,
//   //             zoom: 1 as NormalizedZoomValue,
//   //           };

//   //       const filesArray: BinaryFileData[] = parsed.files
//   //         ? Object.entries(parsed.files).map(([key, file]) => {
//   //             const url = file.url ? `http://localhost:3000${file.url}` : null;
//   //             if (!url) {
//   //               console.warn(`File ${key} has no URL`);
//   //               return null;
//   //             }
//   //             // 预加载图片以设置 crossOrigin
//   //             const img = new Image();
//   //             img.crossOrigin = 'anonymous';
//   //             img.src = url;
//   //             return {
//   //               id: file.id || key,
//   //               mimeType: file.mimeType || 'image/png',
//   //               created: file.created || Date.now(),
//   //               dataURL: url as DataURL,
//   //             };
//   //           }).filter((file): file is BinaryFileData => file !== null)
//   //         : [];

//   //       elements.forEach((el: any) => {
//   //         if (el.type === 'image' && el.fileId && !filesArray.find((f) => f.id === el.fileId)) {
//   //           console.warn(`File ${el.fileId} not found in files`);
//   //         }
//   //       });

//   //       if (filesArray.length && excalidrawRef.current) {
//   //         console.log('Adding files to Excalidraw:', filesArray);
//   //         excalidrawRef.current.addFiles(filesArray);
//   //       }

//   //       if (excalidrawRef.current) {
//   //         excalidrawRef.current.updateScene({ elements, appState });
//   //       }
//   //     } catch (err) {
//   //       console.error('读取日记失败:', err);
//   //       toast.error(
//   //         `读取日记失败: ${err instanceof Error ? err.message : '未知错误'}，正在跳转列表页`
//   //       );
//   //       navigate('/diaries');
//   //     }
//   //   };

//   //   loadDiary();
//   // }, [paramId, navigate, collaborators]);

//   // 加载日记
//   // useEffect(() => {
//   //   if (!paramId) return;

//   //   const loadDiary = async () => {
//   //     try {
//   //       const data = await fetchDiaryById(paramId);

//   //       setTitle(data.title || '');
//   //       setMood(data.mood || 'happy');
//   //       setTags(data.tags || []);
//   //       setDiaryId(data._id);

//   //       type Parsed = {
//   //         elements?: ExcalidrawElement[];
//   //         appState?: Partial<AppState>;
//   //         files?: Record<string, { id: string; mimeType: string; url: string; created: number }>;
//   //       };
//   //       let parsed: Parsed = {};
//   //       if (data.content) {
//   //         try {
//   //           parsed = JSON.parse(data.content);
//   //         } catch {
//   //           parsed = {};
//   //         }
//   //       }

//   //       const elements = Array.isArray(parsed.elements) ? parsed.elements : [];
//   //       const appState: Partial<AppState> = parsed.appState
//   //         ? {
//   //             ...parsed.appState,
//   //             collaborators,
//   //             viewBackgroundColor: '#f8f1d5',
//   //             contextMenu: null,
//   //             zoom: typeof parsed.appState.zoom === 'number' 
//   //               ? { value: parsed.appState.zoom as NormalizedZoomValue } 
//   //               : parsed.appState.zoom ?? { value: 1 as NormalizedZoomValue },
//   //             width: parsed.appState.width ?? window.innerWidth,
//   //             height: parsed.appState.height ?? window.innerHeight,
//   //           }
//   //         : {
//   //             collaborators,
//   //             viewBackgroundColor: '#f8f1d5',
//   //             contextMenu: null,
//   //             zoom: {value: 1 as NormalizedZoomValue},
//   //             width: window.innerWidth,
//   //             height: window.innerHeight,
//   //           };

//   //       const fullAppState = {
//   //         ...appState,
//   //       } as Required<Pick<AppState, 'width' | 'height' | 'zoom' | 'viewBackgroundColor'| 'contextMenu' | 'collaborators'>>

//   //       // const filesArray: BinaryFileData[] = await Promise.all<BinaryFileData | null>(
//   //       //   (parsed.files
//   //       //     ? Object.entries(parsed.files).map(async ([key, file]) => {
//   //       //         const url = file.url ? `http://localhost:3000${file.url}` : null;
//   //       //         if (!url) {
//   //       //           console.warn(`File ${key} has no URL`);
//   //       //           return null;
//   //       //         }
//   //       //         try {
//   //       //           const img = new Image();
//   //       //           img.crossOrigin = 'anonymous';
//   //       //           img.src = url;
//   //       //           await new Promise<void>((resolve, reject) => {
//   //       //             img.onload = () => {
//   //       //               console.log(`Image loaded: ${url}`);
//   //       //               resolve();
//   //       //             };
//   //       //             img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
//   //       //           });
//   //       //           return {
//   //       //             id: file.id || key,
//   //       //             mimeType: file.mimeType || 'image/png',
//   //       //             created: file.created || Date.now(),
//   //       //             dataURL: url as DataURL,
//   //       //           };
//   //       //         } catch (err) {
//   //       //           console.error(`图片加载失败: ${url}`, err);
//   //       //           toast.error(`图片加载失败: ${url}`);
//   //       //           return null;
//   //       //         }
//   //       //       })
//   //       //     : []
//   //       //   ).filter((promise): promise is Promise<BinaryFileData | null> => true)
//   //       // ).then((results) => results.filter((file): file is BinaryFileData => file !== null));

//   //       const filesArray: BinaryFileData[] = (await Promise.all(
//   //         (parsed.files
//   //           ? Object.entries(parsed.files).map(async ([key, file]) => {
//   //               const url = file.url ? `http://localhost:3000${file.url}` : null;
//   //               if (!url) {
//   //                 console.warn(`File ${key} has no URL`);
//   //                 return null; // 对于无效文件返回 null
//   //               }
//   //               try {
//   //                 const img = new Image();
//   //                 img.crossOrigin = 'anonymous';
//   //                 img.src = url;
//   //                 await new Promise<void>((resolve, reject) => {
//   //                   img.onload = () => {
//   //                     console.log(`Image loaded: ${url}`);
//   //                     resolve();
//   //                   };
//   //                   img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
//   //                 });
//   //                 return {
//   //                   id: file.id || key,
//   //                   mimeType: file.mimeType || 'image/png',
//   //                   created: file.created || Date.now(),
//   //                   dataURL: url as DataURL,
//   //                 };
//   //               } catch (err) {
//   //                 console.error(`图片加载失败: ${url}`, err);
//   //                 toast.error(`图片加载失败: ${url}`);
//   //                 return null; // 如果图片加载失败返回 null
//   //               }
//   //             })
//   //           : [])
//   //       )).filter((file): file is BinaryFileData => file !== null); // 在这里过滤掉 null 值

//   //       console.log('Files to be added to Excalidraw:', filesArray.map(f => ({ id: f.id, dataURL: f.dataURL })));

//   //       elements.forEach((el: ExcalidrawElement) => {
//   //         if (el.type === 'image' && el.fileId && !filesArray.find((f) => f.id === el.fileId)) {
//   //           console.warn(`File ${el.fileId} not found in files`);
//   //         }
//   //       });

//   //       if (filesArray.length && excalidrawRef.current) {
//   //         excalidrawRef.current.addFiles(filesArray);
//   //       }

//   //       if (excalidrawRef.current) {
//   //         excalidrawRef.current.updateScene({ elements, appState: fullAppState });
//   //       }
//   //     } catch (err) {
//   //       console.error('读取日记失败:', err);
//   //       toast.error(
//   //         `读取日记失败: ${err instanceof Error ? err.message : '未知错误'}，正在跳转列表页`
//   //       );
//   //       navigate('/diaries');
//   //     }
//   //   };

//   //   loadDiary();
//   // }, [paramId, navigate, collaborators]);

//   // 更新 buildFormData
//   useEffect(() => {
//     if (!paramId) return;

//     const loadDiary = async () => {
//       try {
//         const data = await fetchDiaryById(paramId);

//         setTitle(data.title || '');
//         setMood(data.mood || 'happy');
//         setTags(data.tags || []);
//         setDiaryId(data._id);

//         let parsed = {};
//         if (data.content) {
//           try {
//             parsed = JSON.parse(data.content);
//           } catch {
//             parsed = {};
//           }
//         }

//         const { elements, appState: sceneAppState, files: sceneFiles } = parsed as any;

//         const appState = {
//           ...sceneAppState,
//           collaborators,
//           viewBackgroundColor: '#f8f1d5',
//           contextMenu: null
//         };
        
//         const filesArray = await Promise.all(
//           Object.values(sceneFiles || {}).map(async (file: any) => {
//             const res = await fetch(`http://localhost:3000${file.url}`);
//             const blob = await res.blob();
//             const dataURL = await blobToDataURL(blob);
//             return {
//               id: file.id,
//               mimeType: file.mimeType,
//               dataURL,
//               created: file.created
//             };
//           })
//         );
        
//         if (excalidrawRef.current) {
//           excalidrawRef.current.addFiles(filesArray);
//           excalidrawRef.current.updateScene({ elements, appState });
//         }
//       } catch (err) {
//         console.error('读取日记失败:', err);
//         toast.error(
//           `读取日记失败: ${err instanceof Error ? err.message : '未知错误'}，正在跳转列表页`
//         );
//         navigate('/diaries');
//       }
//     };

//     loadDiary();
//   }, [paramId, navigate, collaborators]);
  
//   const buildFormData = useCallback(async () => {
//     const blob = await generateBlob()
//     if (!blob) {
//       console.error('generateBlob 返回 null，无法生成预览图')
//       return null
//     }

//     const scene = excalidrawRef.current?.getSceneElements()
//     const appState = excalidrawRef.current?.getAppState()
//     const files = excalidrawRef.current?.getFiles() || {}
    

//     // 日志记录 FormData 内容
//     console.log('Building FormData:', {
//       sceneLength: scene?.length,
//       appState,
//       files,
//       contentSize: new TextEncoder().encode(
//         JSON.stringify({
//           elements: scene,
//           appState: { ...appState, collaborators, contextMenu: null },
//           files,
//         })
//       ).length,
//     })

//     // 清理 files，仅保留元数据
//     const cleanedFiles = files
//       ? Object.fromEntries(
//           Object.entries(files).map(([key, file]) => [
//             key,
//             {
//               id: file.id,
//               mimeType: file.mimeType,
//               created: file.created,
//             },
//           ])
//         )
//       : {}

//     const form = new FormData()
//     form.append('title', title)
//     form.append('mood', mood)
//     form.append(
//       'content',
//       JSON.stringify({
//         elements: scene,
//         appState: { ...appState, collaborators, contextMenu: null },
//         files: cleanedFiles,
//       })
//     )
//     tags.forEach(t => form.append('tags', t))
//     form.append('images', blob, 'snapshot.png')

//     // 添加内容图片到 contentImages
//     const contentImages: File[] = []
//     if (scene) {
//       scene.forEach(element => {
//         if (element.type === 'image' && element.customData?.originalFile instanceof File) {
//           const file = element.customData.originalFile as File
//           contentImages.push(file)
//           form.append('contentImages', file, `content-image-${element.fileId}.png`)
//           console.log(`添加 contentImages: ${element.fileId}`, file.name)
//         } else if (element.type === 'image' && !element.customData?.originalFile) {
//           console.warn(`Element ${element.id} has no originalFile`)
//         }
//       })
//     }

//     if(contentImages.length === 0){
//       console.log('没有 contentImages需要上传')
//     }

//     return form
//   }, [title, mood, tags, collaborators, excalidrawRef])

//   function toFileId(id: string): FileId {
//     return id as FileId;
//   }

//   // 用于在保存后处理后端返回的 files，确保图片 URL 加载时设置 crossOrigin="anonymous"
// //   const updateSceneWithFiles = async (
// //   files: Record<string, { id: string; mimeType: string; url?: string; created: number }>
// // ) => {
// //   if (!excalidrawRef.current) return;

// //   const processedFiles: BinaryFileData[] = [];
// //   for (const [id, file] of Object.entries(files)) {
// //     if (file.url) {
// //       const img = new Image();
// //       img.crossOrigin = 'anonymous';
// //       img.src = file.url;
// //       try {
// //         await new Promise((resolve, reject) => {
// //           img.onload = resolve;
// //           img.onerror = () => reject(new Error(`图片加载失败: ${file.url}`));
// //         });
// //         processedFiles.push({
// //           id: toFileId(file.id),
// //           mimeType: file.mimeType as BinaryFileData['mimeType'],
// //           dataURL: file.url as DataURL, // 使用 URL，但确保 crossOrigin
// //           created: file.created,
// //           // crossOrigin: 'anonymous',
// //         });
// //         console.log(`图片 ${id} 已加载，crossOrigin: ${img.crossOrigin}`);
// //       } catch (error) {
// //         console.error('加载图片失败:', error);
// //         toast.error(`图片加载失败: ${file.url}`);
// //         continue;
// //       }
// //     } 
// //   }
// //   excalidrawRef.current.addFiles(processedFiles);
// //   console.log('更新 Excalidraw 场景，文件数:', processedFiles.length);
// // };
//   const updateSceneWithFiles = useCallback(async (
//     files: Record<string, { id: string; mimeType: string; url?: string; created: number }>
//   ) => {
//     if (!excalidrawRef.current) return;

//     const processedFiles: BinaryFileData[] = [];
//     for (const [id, file] of Object.entries(files)) {
//       if (file.url) {
//         const img = new Image();
//         img.crossOrigin = 'anonymous';
//         img.src = file.url;
//         try {
//           await new Promise((resolve, reject) => {
//             img.onload = resolve;
//             img.onerror = () => reject(new Error(`图片加载失败: ${file.url}`));
//           });
//           processedFiles.push({
//             id: toFileId(file.id),
//             mimeType: file.mimeType as BinaryFileData['mimeType'],
//             dataURL: file.url as DataURL,
//             created: file.created,
//           });
//           console.log(`图片 ${id} 已加载，crossOrigin: ${img.crossOrigin}`);
//         } catch (error) {
//           console.error('加载图片失败:', error);
//           toast.error(`图片加载失败: ${file.url}`);
//           continue;
//         }
//       }
//     }
//     excalidrawRef.current.addFiles(processedFiles);
//     console.log('更新 Excalidraw 场景，文件数:', processedFiles.length);
//   }, [excalidrawRef]);

//   // 自动保存
//   useEffect(() => {
//     const id = setInterval(async () => {
//       if (!dirtyRef.current || !title.trim()) {
//         console.log('Auto-save skipped: not dirty or no title')
//         return
//       }

//       const form = await buildFormData()
//       if (!form) {
//         console.log('Auto-save skipped: no FormData')
//         return
//       }

//       console.log('Auto-saving with diaryId:', diaryId)
//       try {
//         const response = await saveDiary(form)
//         console.log('Auto-save response:', response)
//         // 更新 Excalidraw 场景
//         const parsedContent = JSON.parse(response.data.content);
//         await updateSceneWithFiles(parsedContent.files);
//         dirtyRef.current = false
//         toast.success('自动保存成功')
//       } catch (err) {
//         console.error('Auto-save failed:', err)
//         toast.error('自动保存失败')
//       }
//     }, 30_000)

//     return () => clearInterval(id)
//   }, [title, mood, tags, saveDiary, collaborators, diaryId, buildFormData, updateSceneWithFiles])

//   // 在任何改变 title / mood / tags / 画布操作 后都调用 markDirty()
//   const onTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setTitle(e.target.value)
//     markDirty()
//   }
//   const onMoodChange = (m: Mood) => {
//     setMood(m)
//     markDirty()
//   }

//   // const generatePreview = async (): Promise<string | null> => {
//   //   if (!excalidrawRef.current) return null

//   //   try {
//   //     const elements = excalidrawRef.current.getSceneElements()
//   //     const files = excalidrawRef.current.getFiles()
//   //     if (!elements.length) return null

//   //     const blob = await exportToBlob({
//   //       elements,
//   //       files,
//   //       mimeType: 'image/png',
//   //       // quality: 0.8,
//   //       appState: {
//   //         exportBackground: true,
//   //         viewBackgroundColor: '#f8f1d5',
//   //       },
//   //     })

//   //     const dataUrl = await blobToDataURL(blob)
//   //     setPreviewImage(dataUrl)
//   //     return dataUrl
//   //   } catch (error) {
//   //     console.error('截图生成失败:', error)
//   //     toast.error('截图生成失败')
//   //     return null
//   //   }
//   // }

//   const generatePreview = async (): Promise<string | null> => {
//     if (!excalidrawRef.current) return null;

//     try {
//       const elements = excalidrawRef.current.getSceneElements();
//       const files = excalidrawRef.current.getFiles() || {};

//       const safeFileIds = Object.entries(files)
//         .filter(([id]) => !id.startsWith("contentImg")) // 可自定义过滤条件
//         .map(([id]) => id);

//       const safeElements = elements.filter((el) => {
//         if (el.type !== "image") return true;
//         return safeFileIds.includes(el.fileId || "");
//       });

//       const safeFiles = Object.fromEntries(
//         Object.entries(files).filter(([id]) => safeFileIds.includes(id))
//       );

//       // if (!elements.length) return null;

//       if(!safeElements.length) return null;

//       console.log('Generating preview with files:', Object.entries(files).map(([id, file]) => ({ id, dataURL: file.dataURL })));

//       const blob = await exportToBlob({
//         elements: safeElements,
//         files: safeFiles,
//         mimeType: 'image/png',
//         appState: {
//           exportBackground: true,
//           viewBackgroundColor: '#f8f1d5',
//         },
//       });

//       const dataUrl = await blobToDataURL(blob);
//       setPreviewImage(dataUrl);
//       return dataUrl;
//     } catch (error) {
//       console.error('截图生成失败:', error);
//       const files = excalidrawRef.current?.getFiles() || {};
//       if (error instanceof DOMException && error.name === 'SecurityError') {
//         console.error('画布污染，可能由于以下图片:', Object.entries(files).map(([id, file]) => ({ id, dataURL: file.dataURL })));
//       }
//       toast.error('截图生成失败，请检查图片来源是否支持 CORS');
//       return null;
//     }
//   };

//   // const generateBlob = async (): Promise<Blob | null> => {
//   //   const api = excalidrawRef.current
//   //   if (!api) return null
//   //   const elements = api.getSceneElements()
//   //   const files = api.getFiles()
//   //   if (!elements.length) return null

//   //   try {
//   //     return await exportToBlob({
//   //       elements,
//   //       files,
//   //       mimeType: 'image/png',
//   //       // quality: 0.8,
//   //       appState: {
//   //         exportBackground: true,
//   //         viewBackgroundColor: '#f8f1d5',
//   //       },
//   //     })
//   //   } catch (e) {
//   //     console.error('导出 Blob 失败', e)
//   //     toast.error('导出 Blob 失败')
//   //     return null
//   //   }
//   // }

//   const generateBlob = async (): Promise<Blob | null> => {
//     const api = excalidrawRef.current;
//     if (!api) return null;
//     const elements = api.getSceneElements();
//     const files = api.getFiles() || {};

//     const safeFileIds = Object.entries(files)
//         // .filter(([id, file]) => !id.startsWith("contentImg")) // 可自定义过滤条件
//         .filter(([id]) => !id.startsWith("contentImg"))
//         .map(([id]) => id);

//       const safeElements = elements.filter((el) => {
//         if (el.type !== "image") return true;
//         return safeFileIds.includes(el.fileId || "");
//       });

//       const safeFiles = Object.fromEntries(
//         Object.entries(files).filter(([id]) => safeFileIds.includes(id))
//       );

//       // if (!elements.length) return null;

//       if(!safeElements.length) return null;

//     // if (!elements.length) return null;

//     console.log('Generating blob with files:', Object.entries(files).map(([id, file]) => ({ id, dataURL: file.dataURL })));

//     try {
//       return await exportToBlob({
//         elements: safeElements,
//         files: safeFiles,
//         mimeType: 'image/png',
//         appState: {
//           exportBackground: true,
//           viewBackgroundColor: '#f8f1d5',
//         },
//       });
//     } catch (e) {
//       console.error('导出 Blob 失败:', e);
//       if (e instanceof DOMException && e.name === 'SecurityError') {
//         console.error('画布污染，可能由于以下图片:', Object.entries(files).map(([id, file]) => ({ id, dataURL: file.dataURL })));
//       }
//       toast.error('导出 Blob 失败，请检查图片来源是否支持 CORS');
//       return null;
//     }
//   };

//   const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
//       e.preventDefault()
//       const newTag = tagInput.trim()
//       if (!tags.includes(newTag)) {
//         setTags([...tags, newTag])
//         markDirty()
//       }
//       setTagInput('')
//     }
//   }

//   const removeTag = (tagToRemove: string) => {
//     setTags(tags.filter(tag => tag !== tagToRemove))
//     markDirty()
//   }

//   // 手动保存
//   const handleSave = async () => {
//     if (!title.trim()) {
//       toast.error('标题不能为空！')
//       return
//     }

//     const form = await buildFormData()
//     if (!form) {
//       toast.error('没有内容可保存')
//       return
//     }

//     console.log('Manual saving with diaryId:', diaryId)
//     try {
//       const response = await saveDiary(form)
//       console.log('Manual save response:', response)
//       // 更新场景中的文件
//       const parsedContent = JSON.parse(response.data.content)
//       await updateSceneWithFiles(parsedContent.files)
//       toast.success('手动保存成功')
//     } catch (err) {
//       console.error('Manual save failed:', err)
//       toast.error('手动保存失败: ' + (err instanceof Error ? err.message : '未知错误'))
//     }
//   }

//   // const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//   //   const file = e.target.files?.[0]
//   //   if (!file || !excalidrawRef.current) return

//   //   const supportedMimeTypes = [
//   //     'image/png',
//   //     'image/jpeg',
//   //     'image/svg+xml',
//   //     'image/gif',
//   //     'image/webp',
//   //     'image/bmp',
//   //     'image/x-icon',
//   //     'application/octet-stream',
//   //   ]

//   //   if (!supportedMimeTypes.includes(file.type)) {
//   //     toast.error('不支持的图片类型！')
//   //     return
//   //   }

//   //   const reader = new FileReader()
//   //   reader.onload = async () => {
//   //     const dataUrl = reader.result as string
//   //     const img = new Image()
//   //     img.src = dataUrl

//   //     img.onload = () => {
//   //       const now = Date.now()
//   //       const id = `image-${now}` as string as BinaryFileData['id']
//   //       const files: BinaryFileData[] = [
//   //         {
//   //           id,
//   //           mimeType: file.type as BinaryFileData['mimeType'],
//   //           dataURL: dataUrl as DataURL,
//   //           created: now,
//   //         },
//   //       ]

//   //       const api = excalidrawRef.current!
//   //       api.addFiles(files)

//   //       const imageElement = {
//   //         id: `img-elem-${now}`,
//   //         type: 'image' as const,
//   //         x: 100,
//   //         y: 100,
//   //         width: img.naturalWidth,
//   //         height: img.naturalHeight,
//   //         angle: 0,
//   //         strokeColor: 'transparent',
//   //         backgroundColor: 'transparent',
//   //         fillStyle: 'solid' as FillStyle,
//   //         strokeWidth: 1,
//   //         roughness: 0,
//   //         opacity: 100,
//   //         groupIds: [],
//   //         boundElementIds: [],
//   //         seed: Math.floor(Math.random() * 100000),
//   //         version: 1,
//   //         versionNonce: Math.floor(Math.random() * 100000),
//   //         isDeleted: false,
//   //         updated: now,
//   //         locked: false,
//   //         status: 'pending' as const,
//   //         fileId: id,
//   //         strokeStyle: 'solid' as StrokeStyle,
//   //         roundness: null,
//   //         boundElements: [],
//   //         link: null,
//   //         customData: { originalFile: file },
//   //         scale: [1, 1],
//   //       }

//   //       console.log('Updating scene with image element:', imageElement)
//   //       api.updateScene({
//   //         elements: [...api.getSceneElements(), imageElement as any],
//   //       })
//   //       markDirty()
//   //     }
//   //   }
//   //   reader.readAsDataURL(file)
//   //   e.target.value = ''
//   // }
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   const generateFileId = (id: string): BinaryFileData['id'] => id as any

//   const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file || !excalidrawRef.current) return;

//     const supportedMimeTypes = [
//       'image/png',
//       'image/jpeg',
//       'image/svg+xml',
//       'image/gif',
//       'image/webp',
//       'image/bmp',
//       'image/x-icon',
//       'application/octet-stream',
//     ];

//     if (!supportedMimeTypes.includes(file.type)) {
//       toast.error('不支持的图片类型！');
//       return;
//     }

//     const reader = new FileReader();
//     reader.onload = async () => {
//       const dataUrl = reader.result as string;
//       const img = new Image();
//       img.crossOrigin = 'anonymous'; // 设置 crossOrigin
//       img.src = dataUrl;

//       img.onload = () => {
//         const now = Date.now();
//         // const id = `image-${now}` as string as BinaryFileData['id'];
//         const id = generateFileId(`image-${now}`); // 使用 generateFileId 函数生成 ID
//         const files: BinaryFileData[] = [
//           {
//             id,
//             mimeType: file.type as BinaryFileData['mimeType'],
//             dataURL: dataUrl as DataURL,
//             created: now,
//           },
//         ];

//         const api = excalidrawRef.current!;
//         api.addFiles(files);

//         const imageElement = {
//           id: `img-elem-${now}`,
//           type: 'image' as const,
//           x: 100,
//           y: 100,
//           width: img.naturalWidth,
//           height: img.naturalHeight,
//           angle: 0,
//           strokeColor: 'transparent',
//           backgroundColor: 'transparent',
//           fillStyle: 'solid' as FillStyle,
//           strokeWidth: 1,
//           roughness: 0,
//           opacity: 100,
//           groupIds: [],
//           boundElementIds: [],
//           seed: Math.floor(Math.random() * 100000),
//           version: 1,
//           versionNonce: Math.floor(Math.random() * 100000),
//           isDeleted: false,
//           updated: now,
//           locked: false,
//           status: 'pending' as const,
//           fileId: id,
//           strokeStyle: 'solid' as StrokeStyle,
//           roundness: null,
//           boundElements: [],
//           link: null,
//           customData: { originalFile: file },
//           scale: [1, 1],
//         };

//         console.log('Updating scene with image element:', imageElement);
//         api.updateScene({
//           // eslint-disable-next-line @typescript-eslint/no-explicit-any
//           elements: [...api.getSceneElements(), imageElement as any],
//         });
//         markDirty();
//       };
//       img.onerror = () => {
//         console.error('图片加载失败:', dataUrl);
//         toast.error('图片加载失败，请检查图片来源');
//       };
//     };
//     reader.readAsDataURL(file);
//     e.target.value = '';
//   };

//   return (
//     <div className="page-sheikah font-orbitron relative min-h-[1024px]">
//       <img
//         src="/tears-of-kingdom.png"
//         alt="Background"
//         className="absolute top-0 left-0 w-full h-full object-fill z-10 pointer-events-none"
//       />

//       <div className="decorative-top py-5 mx-40% relative z-11 flex items-center gap-4">
//         <div className="taginput-zelda">
//           {tags.map(tag => (
//             <span key={tag} className="taginput-tag flex items-center gap-1">
//               {tag}
//               <button
//                 onClick={() => removeTag(tag)}
//                 className="text-red-300 hover:text-red-500 font-bold bg-transparent"
//               >
//                 ×
//               </button>
//             </span>
//           ))}
//           <input
//             type="text"
//             value={tagInput}
//             onChange={e => setTagInput(e.target.value)}
//             onKeyDown={handleTagKeyDown}
//             placeholder="输入标签..."
//             className="taginput-input"
//           />
//         </div>

//         <input
//           type="text"
//           maxLength={100}
//           placeholder="输入日记标题..."
//           value={title}
//           onChange={onTitleChange}
//           className="input-zelda-apple-lite"
//         />
//       </div>

//       <input
//         id="image-upload"
//         type="file"
//         accept="image/*"
//         capture="environment"
//         className="hidden"
//         onChange={handleImageUpload}
//       />

//       <ErrorBoundary>
//         <div className="w-screen h-screen relative z-5">
//           <Excalidraw
//             ref={excalidrawRef}
//             onChange={() => {
//               markDirty()
//             }}
//             excalidrawAPIBaseUrl="/excalidraw-assets"
//             viewModeEnabled={false}
//             zenModeEnabled={false}
//             UIOptions={{
//               canvasActions: {
//                 loadScene: true,
//               },
//             }}
//             initialData={{
//               collaborators,
//               appState: {
//                 viewBackgroundColor: '#f8f1d5',
//                 collaborators,
//                 contextMenu: null,
//               },
//               elements: Array.from({ length: 50 }, (_, i) => {
//                 const y = 100 + i * 60
//                 return {
//                   id: `line-${i}`,
//                   type: 'line',
//                   x: 0,
//                   y,
//                   width: 5000,
//                   height: 0,
//                   points: [
//                     [0, 0],
//                     [2500, 0],
//                   ],
//                   angle: 0,
//                   strokeColor: '#3e6c4e',
//                   backgroundColor: 'transparent',
//                   strokeWidth: 2,
//                   roughness: 0,
//                   opacity: 50,
//                   seed: Math.floor(Math.random() * 100000),
//                   version: 1,
//                   versionNonce: Math.floor(Math.random() * 100000),
//                   isDeleted: false,
//                   groupIds: [],
//                   boundElementIds: [],
//                   updated: Date.now(),
//                   locked: true,
//                 }
//               }),
//             }}
//           >
//             <div className="absolute top-2 right-20% flex gap-2 z-4">
//               <MoodSelector mood={mood} onChange={onMoodChange} />
//               <button
//                 onClick={() => document.getElementById('image-upload')?.click()}
//                 className="btn-zelda-apple"
//               >
//                 插入图片
//               </button>
//               <button onClick={generatePreview} className="btn-zelda-apple">
//                 预览
//               </button>
//               <button onClick={handleSave} className="btn-zelda-apple">
//                 保存
//               </button>
//             </div>
//           </Excalidraw>
//         </div>
//       </ErrorBoundary>

//       {previewImage && (
//         <div className="absolute top-10 left-10 w-80% max-w-800px bg-white border-2 border-blue-500 rounded-xl overflow-hidden shadow-lg z-100 p-4">
//           <img src={previewImage} alt="预览图" className="w-full h-auto object-contain" />
//           <button
//             onClick={() => setPreviewImage(null)}
//             className="mt-2 p-2 bg-red-500 text-white rounded"
//           >
//             关闭预览
//           </button>
//         </div>
//       )}
//     </div>
//   )
// }


// // import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
// // import { Excalidraw } from '@excalidraw/excalidraw'
// // import '../styles/ExcalidrawCustom.css'
// // import type { ExcalidrawImperativeAPI, BinaryFileData, DataURL } from '@excalidraw/excalidraw/types/types'
// // import type { FillStyle, StrokeStyle } from '@excalidraw/excalidraw/types/element/types'
// // import { exportToBlob } from '@excalidraw/excalidraw'
// // import { useDiarySave } from '../hooks/useSaveDiary'
// // import type { Mood } from '../types/diary'
// // import { blobToDataURL } from '../utils/image'
// // import MoodSelector from '../components/MoodSelector'
// // import { useParams, useNavigate } from 'react-router-dom'
// // import { fetchDiaryById } from '../api/diaries'
// // import type { AppState, ExcalidrawElement } from '@excalidraw/excalidraw/types/types'
// // import { ErrorBoundary } from '../components/common/ErrorBoundary'
// // import useUserStore from '../store/user'
// // import type { Collaborator } from '@excalidraw/excalidraw/types/types'
// // import { toast } from 'react-hot-toast'

// // export default function DiaryEdit() {
// //   const { user } = useUserStore()
// //   const { id: paramId } = useParams<{ id: string }>()
// //   const navigate = useNavigate()

// //   const [title, setTitle] = useState('')
// //   const [mood, setMood] = useState<Mood>('happy')
// //   const [tags, setTags] = useState<string[]>([])
// //   const [tagInput, setTagInput] = useState<string>("")
// //   const [diaryId, setDiaryId] = useState<string | null>(null)
// //   const excalidrawRef = useRef<ExcalidrawImperativeAPI>(null)
// //   const { saveDiary } = useDiarySave(diaryId, setDiaryId)

// //   const [previewImage, setPreviewImage] = useState<string | null>(null)

// //   const dirtyRef = useRef(false)
// //   const markDirty = () => {
// //     dirtyRef.current = true
// //   }

// //   const collaborators = useMemo(
// //     () =>
// //       new Map<string, Collaborator>(
// //         user._id
// //           ? [
// //               [
// //                 user._id,
// //                 {
// //                   username: user.username || 'Anonymous',
// //                   id: user._id,
// //                 },
// //               ],
// //             ]
// //           : []
// //       ),
// //     [user._id, user.username]
// //   )

// //   // 预加载字体
// //   // useEffect(() => {
// //   //   const loadFonts = async () => {
// //   //     const fontUrls = [
// //   //       '/excalidraw-assets/Assistant-Medium.woff2',
// //   //       '/excalidraw-assets/Assistant-Bold.woff2',
// //   //       '/excalidraw-assets/Assistant-Regular.woff2',
// //   //     ]
// //   //     for (const url of fontUrls) {
// //   //       try {
// //   //         const font = new FontFace('Assistant', `url(${url})`)
// //   //         await font.load()
// //   //         document.fonts.add(font)
// //   //       } catch (err) {
// //   //         console.error(`Failed to load font ${url}:`, err)
// //   //       }
// //   //     }
// //   //   }
// //   //   loadFonts()
// //   // }, [])

// //   // 加载日记
// //   // useEffect(() => {
// //   //   if (!paramId) return

// //   //   const loadDiary = async () => {
// //   //     try {
// //   //       const data = await fetchDiaryById(paramId)

// //   //       setTitle(data.title || '')
// //   //       setMood(data.mood || 'happy')
// //   //       setTags(data.tags || [])
// //   //       setDiaryId(data._id)

// //   //       // 安全解析 content
// //   //       type Parsed = {
// //   //         elements?: ExcalidrawElement[]
// //   //         appState?: Partial<AppState>
// //   //         files?: Record<string, { id: string; mimeType: string; url: string; created: number }>
// //   //       }
// //   //       let parsed: Parsed = {}
// //   //       if (data.content) {
// //   //         try {
// //   //           parsed = JSON.parse(data.content)
// //   //         } catch {
// //   //           parsed = {}
// //   //         }
// //   //       }

// //   //       // 恢复元素与状态
// //   //       const elements = Array.isArray(parsed.elements) ? parsed.elements : []
// //   //       const defaultAppState: Partial<AppState> = {
// //   //         collaborators,
// //   //         viewBackgroundColor: '#f8f1d5',
// //   //         contextMenu: null,
// //   //         width: window.innerWidth,
// //   //         height: window.innerHeight,
// //   //         offsetLeft: 0,
// //   //         offsetTop: 0,
// //   //         scrollX: 0,
// //   //         scrollY: 0,
// //   //         zoom: { value: 1 },
// //   //       }
// //   //       const appState: Partial<AppState> = parsed.appState
// //   //         ? {
// //   //             ...defaultAppState,
// //   //             ...parsed.appState,
// //   //             collaborators,
// //   //             contextMenu: null,
// //   //           }
// //   //         : defaultAppState

// //   //       // 格式化 files 为 BinaryFileData
// //   //       const filesArray: BinaryFileData[] = parsed.files
// //   //         ? Object.entries(parsed.files).map(([key, file]) => {
// //   //             const url = file.url ? `http://localhost:3000${file.url}` : null
// //   //             if (!url) {
// //   //               console.warn(`File ${key} has no URL`)
// //   //             }
// //   //             return {
// //   //               id: file.id || key,
// //   //               mimeType: (file.mimeType || 'image/png') as BinaryFileData['mimeType'],
// //   //               created: file.created || Date.now(),
// //   //               dataURL: url as DataURL,
// //   //             }
// //   //           })
// //   //         : []

// //   //       // 验证 elements 和 files 匹配
// //   //       elements.forEach((el: ExcalidrawElement) => {
// //   //         if (el.type === 'image' && el.fileId && !filesArray.find(f => f.id === el.fileId)) {
// //   //           console.warn(`File ${el.fileId} not found in files`)
// //   //         }
// //   //       })

// //   //       // 注入文件
// //   //       if (filesArray.length && excalidrawRef.current) {
// //   //         console.log('Adding files to Excalidraw:', filesArray)
// //   //         excalidrawRef.current.addFiles(filesArray)
// //   //       }

// //   //       // 恢复场景
// //   //       excalidrawRef.current?.updateScene({ elements, appState })
// //   //     } catch (err) {
// //   //       console.error('读取日记失败:', err)
// //   //       toast.error(
// //   //         `读取日记失败: ${err instanceof Error ? err.message : '未知错误'}，正在跳转列表页`
// //   //       )
// //   //       navigate('/diaries')
// //   //     }
// //   //   }

// //   //   loadDiary()
// //   // }, [paramId, navigate, collaborators])

// //   useEffect(() => {
// //   if (!paramId) return

// //   const loadDiary = async () => {
// //     try {
// //       const data = await fetchDiaryById(paramId)

// //       setTitle(data.title || '')
// //       setMood(data.mood || 'happy')
// //       setTags(data.tags || [])
// //       setDiaryId(data._id)

// //       // 安全解析 content
// //       type Parsed = {
// //         elements?: ExcalidrawElement[]
// //         appState?: Partial<AppState>
// //         files?: Record<string, { id: string; mimeType: string; url: string; created: number }>
// //       }
// //       let parsed: Parsed = {}
// //       if (data.content) {
// //         try {
// //           parsed = JSON.parse(data.content)
// //         } catch {
// //           parsed = {}
// //         }
// //       }

// //       // 恢复元素与状态
// //       const elements = Array.isArray(parsed.elements) ? parsed.elements : []
// //       const defaultAppState: Partial<AppState> = {
// //         collaborators,
// //         viewBackgroundColor: '#f8f1d5',
// //         contextMenu: null,
// //         width: window.innerWidth,
// //         height: window.innerHeight,
// //         offsetLeft: 0,
// //         offsetTop: 0,
// //         scrollX: 0,
// //         scrollY: 0,
// //         zoom: { value: 1 },
// //       }
// //       const appState: Partial<AppState> = parsed.appState
// //         ? {
// //             ...defaultAppState,
// //             ...parsed.appState,
// //             collaborators,
// //             contextMenu: null,
// //           }
// //         : defaultAppState

// //       // 格式化 files 为 BinaryFileData
// //       const filesArray: BinaryFileData[] = parsed.files
// //         ? await Promise.all(
// //             Object.entries(parsed.files).map(async ([key, file]) => {
// //               const url = file.url ? `http://localhost:3000${file.url}` : null
// //               if (!url) {
// //                 console.warn(`File ${key} has no URL`)
// //                 return null
// //               }
// //               try {
// //                 const response = await fetch(url, { method: 'GET' })
// //                 if (!response.ok) throw new Error(`Failed to fetch ${url}`)
// //                 const blob = await response.blob()
// //                 const dataURL = await blobToDataURL(blob)
// //                 return {
// //                   id: file.id || key,
// //                   mimeType: (file.mimeType || 'image/png') as BinaryFileData['mimeType'],
// //                   created: file.created || Date.now(),
// //                   dataURL: dataURL as DataURL,
// //                 }
// //               } catch (err) {
// //                 console.error(`Failed to load file ${url}:`, err)
// //                 return null
// //               }
// //             })
// //           ).then(files => files.filter((f): f is BinaryFileData => f !== null))
// //         : []

// //       // 验证 elements 和 files 匹配
// //       elements.forEach((el: ExcalidrawElement) => {
// //         if (el.type === 'image' && el.fileId && !filesArray.find(f => f.id === el.fileId)) {
// //           console.warn(`File ${el.fileId} not found in files`)
// //         }
// //       })

// //       // 注入文件
// //       if (filesArray.length && excalidrawRef.current) {
// //         console.log('Adding files to Excalidraw:', filesArray)
// //         excalidrawRef.current.addFiles(filesArray)
// //       }

// //       // 恢复场景
// //       excalidrawRef.current?.updateScene({ elements, appState })
// //     } catch (err) {
// //       console.error('读取日记失败:', err)
// //       toast.error(
// //         `读取日记失败: ${err instanceof Error ? err.message : '未知错误'}，正在跳转列表页`
// //       )
// //       navigate('/diaries')
// //     }
// //   }

// //   loadDiary()
// // }, [paramId, navigate, collaborators])

// //   // 更新 buildFormData
// //   const buildFormData = useCallback(async () => {
// //     const blob = await generateBlob()
// //     if (!blob) return null

// //     const scene = excalidrawRef.current?.getSceneElements()
// //     const appState = excalidrawRef.current?.getAppState()
// //     const files = excalidrawRef.current?.getFiles() || {}

// //     // 日志记录 FormData 内容
// //     // console.log('Building FormData:', {
// //     //   sceneLength: scene?.length,
// //     //   appState,
// //     //   files,
// //     //   contentSize: new TextEncoder().encode(
// //     //     JSON.stringify({
// //     //       elements: scene,
// //     //       appState: { ...appState, collaborators, contextMenu: null },
// //     //       files,
// //     //     })
// //     //   ).length,
// //     // })

// //     // 清理 files，仅保留元数据
// //     const cleanedFiles = files
// //       ? Object.fromEntries(
// //           Object.entries(files).map(([key, file]) => [
// //             key,
// //             {
// //               id: file.id,
// //               mimeType: file.mimeType,
// //               created: file.created,
// //             },
// //           ])
// //         )
// //       : {}

// //     const form = new FormData()
// //     form.append('title', title)
// //     form.append('mood', mood)
// //     form.append(
// //       'content',
// //       JSON.stringify({
// //         elements: scene,
// //         appState: { ...appState, collaborators, contextMenu: null },
// //         files: cleanedFiles,
// //       })
// //     )
// //     tags.forEach(t => form.append('tags', t))
// //     form.append('images', blob, 'snapshot.png')

// //     // 添加内容图片到 contentImages
// //     if (scene) {
// //       scene.forEach(element => {
// //         if (element.type === 'image' && element.customData?.originalFile instanceof File) {
// //           const file = element.customData.originalFile as File
// //           form.append('contentImages', file, `content-image-${element.fileId}.png`)
// //         } else if (element.type === 'image' && !element.customData?.originalFile) {
// //           console.warn(`Element ${element.id} has no originalFile`)
// //         }
// //       })
// //     }

// //     return form
// //   }, [title, mood, tags, collaborators])

// //   // 自动保存
// //   useEffect(() => {
// //     const id = setInterval(async () => {
// //       if (!dirtyRef.current || !title.trim()) {
// //         console.log('Auto-save skipped: not dirty or no title')
// //         return
// //       }

// //       const form = await buildFormData()
// //       if (!form) {
// //         console.log('Auto-save skipped: no FormData')
// //         return
// //       }

// //       console.log('Auto-saving with diaryId:', diaryId)
// //       try {
// //         const response = await saveDiary(form)
// //         console.log('Auto-save response:', response)
// //         dirtyRef.current = false
// //         toast.success('自动保存成功')
// //       } catch (err) {
// //         console.error('Auto-save failed:', err)
// //         toast.error('自动保存失败')
// //       }
// //     }, 30_000)

// //     return () => clearInterval(id)
// //   }, [buildFormData, saveDiary, diaryId])

// //   // 在任何改变 title / mood / tags / 画布操作 后都调用 markDirty()
// //   const onTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
// //     setTitle(e.target.value)
// //     markDirty()
// //   }
// //   const onMoodChange = (m: Mood) => {
// //     setMood(m)
// //     markDirty()
// //   }

// //   const generatePreview = async (): Promise<string | null> => {
// //     if (!excalidrawRef.current) return null

// //     try {
// //       const elements = excalidrawRef.current.getSceneElements()
// //       const files = excalidrawRef.current.getFiles()
// //       if (!elements.length) return null

// //       const blob = await exportToBlob({
// //         elements,
// //         files,
// //         mimeType: 'image/png',
// //         quality: 0.8,
// //         appState: {
// //           exportBackground: true,
// //           viewBackgroundColor: '#f8f1d5',
// //         },
// //       })

// //       const dataUrl = await blobToDataURL(blob)
// //       setPreviewImage(dataUrl)
// //       return dataUrl
// //     } catch (error) {
// //       console.error('截图生成失败:', error)
// //       toast.error('截图生成失败')
// //       return null
// //     }
// //   }

// //   const generateBlob = async (): Promise<Blob | null> => {
// //     const api = excalidrawRef.current
// //     if (!api) return null
// //     const elements = api.getSceneElements()
// //     const files = api.getFiles()
// //     if (!elements.length) return null

// //     try {
// //       return await exportToBlob({
// //         elements,
// //         files,
// //         mimeType: 'image/png',
// //         quality: 0.8,
// //         appState: {
// //           exportBackground: true,
// //           viewBackgroundColor: '#f8f1d5',
// //         },
// //       })
// //     } catch (e) {
// //       console.error('导出 Blob 失败', e)
// //       toast.error('导出 Blob 失败')
// //       return null
// //     }
// //   }

// //   const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
// //     if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
// //       e.preventDefault()
// //       const newTag = tagInput.trim()
// //       if (!tags.includes(newTag)) {
// //         setTags([...tags, newTag])
// //         markDirty()
// //       }
// //       setTagInput('')
// //     }
// //   }

// //   const removeTag = (tagToRemove: string) => {
// //     setTags(tags.filter(tag => tag !== tagToRemove))
// //     markDirty()
// //   }

// //   // 手动保存
// //   const handleSave = async () => {
// //     if (!title.trim()) {
// //       toast.error('标题不能为空！')
// //       return
// //     }

// //     const form = await buildFormData()
// //     if (!form) {
// //       toast.error('没有内容可保存')
// //       return
// //     }

// //     console.log('Manual saving with diaryId:', diaryId)
// //     try {
// //       const response = await saveDiary(form)
// //       console.log('Manual save response:', response)
// //       toast.success('手动保存成功')
// //     } catch (err) {
// //       console.error('Manual save failed:', err)
// //       toast.error('手动保存失败: ' + (err instanceof Error ? err.message : '未知错误'))
// //     }
// //   }

// //   const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
// //     const file = e.target.files?.[0]
// //     if (!file || !excalidrawRef.current) return

// //     const supportedMimeTypes: BinaryFileData['mimeType'][] = [
// //       'image/png',
// //       'image/jpeg',
// //       'image/svg+xml',
// //       'image/gif',
// //       'image/webp',
// //       'image/bmp',
// //       'image/x-icon',
// //       'application/octet-stream',
// //     ]

// //     if (!supportedMimeTypes.includes(file.type as BinaryFileData['mimeType'])) {
// //       toast.error('不支持的图片类型！')
// //       return
// //     }

// //     const reader = new FileReader()
// //     reader.onload = async () => {
// //       const dataUrl = reader.result as string
// //       const img = new Image()
// //       img.crossOrigin = 'anonymous' // 确保图片加载时支持 CORS
// //       img.src = dataUrl

// //       img.onload = () => {
// //         const now = Date.now()
// //         const id = `image-${now}` as BinaryFileData['id']
// //         const files: BinaryFileData[] = [
// //           {
// //             id,
// //             mimeType: file.type as BinaryFileData['mimeType'],
// //             dataURL: dataUrl as DataURL,
// //             created: now,
// //           },
// //         ]

// //         const api = excalidrawRef.current!
// //         api.addFiles(files)

// //         const imageElement: ExcalidrawElement = {
// //           id: `img-elem-${now}`,
// //           type: 'image',
// //           x: 100,
// //           y: 100,
// //           width: img.naturalWidth,
// //           height: img.naturalHeight,
// //           angle: 0,
// //           strokeColor: 'transparent',
// //           backgroundColor: 'transparent',
// //           fillStyle: 'solid' as FillStyle,
// //           strokeWidth: 1,
// //           roughness: 0,
// //           opacity: 100,
// //           groupIds: [],
// //           boundElementIds: [],
// //           seed: Math.floor(Math.random() * 100000),
// //           version: 1,
// //           versionNonce: Math.floor(Math.random() * 100000),
// //           isDeleted: false,
// //           updated: now,
// //           locked: false,
// //           status: 'pending',
// //           fileId: id,
// //           strokeStyle: 'solid' as StrokeStyle,
// //           roundness: null,
// //           boundElements: [],
// //           link: null,
// //           customData: { originalFile: file },
// //           scale: [1, 1],
// //         }

// //         console.log('Updating scene with image element:', imageElement)
// //         api.updateScene({
// //           elements: [...api.getSceneElements(), imageElement],
// //         })
// //         markDirty()
// //       }
// //     }
// //     reader.readAsDataURL(file)
// //     e.target.value = ''
// //   }

// //   return (
// //     <div className="page-sheikah font-orbitron relative min-h-[1024px]">
// //       <img
// //         src="/tears-of-kingdom.png"
// //         alt="Background"
// //         className="absolute top-0 left-0 w-full h-full object-fill z-10 pointer-events-none"
// //       />

// //       <div className="decorative-top py-5 mx-40% relative z-11 flex items-center gap-4">
// //         <div className="taginput-zelda">
// //           {tags.map(tag => (
// //             <span key={tag} className="taginput-tag flex items-center gap-1">
// //               {tag}
// //               <button
// //                 onClick={() => removeTag(tag)}
// //                 className="text-red-300 hover:text-red-500 font-bold bg-transparent"
// //               >
// //                 ×
// //               </button>
// //             </span>
// //           ))}
// //           <input
// //             type="text"
// //             value={tagInput}
// //             onChange={e => setTagInput(e.target.value)}
// //             onKeyDown={handleTagKeyDown}
// //             placeholder="输入标签..."
// //             className="taginput-input"
// //           />
// //         </div>

// //         <input
// //           type="text"
// //           maxLength={100}
// //           placeholder="输入日记标题..."
// //           value={title}
// //           onChange={onTitleChange}
// //           className="input-zelda-apple-lite"
// //         />
// //       </div>

// //       <input
// //         id="image-upload"
// //         type="file"
// //         accept="image/*"
// //         capture="environment"
// //         className="hidden"
// //         onChange={handleImageUpload}
// //       />

// //       <ErrorBoundary>
// //         <div className="w-screen h-screen relative z-5">
// //           <Excalidraw
// //             ref={excalidrawRef}
// //             onChange={() => {
// //               markDirty()
// //             }}
// //             viewModeEnabled={false}
// //             zenModeEnabled={false}
// //             UIOptions={{
// //               canvasActions: {
// //                 loadScene: true,
// //               },
// //             }}
// //             initialData={{
// //               collaborators,
// //               appState: {
// //                 viewBackgroundColor: '#f8f1d5',
// //                 collaborators,
// //                 contextMenu: null,
// //                 width: window.innerWidth,
// //                 height: window.innerHeight,
// //                 offsetLeft: 0,
// //                 offsetTop: 0,
// //                 scrollX: 0,
// //                 scrollY: 0,
// //                 zoom: { value: 1 },
// //               },
// //               elements: Array.from({ length: 50 }, (_, i) => {
// //                 const y = 100 + i * 60
// //                 return {
// //                   id: `line-${i}`,
// //                   type: 'line',
// //                   x: 0,
// //                   y,
// //                   width: 5000,
// //                   height: 0,
// //                   points: [
// //                     [0, 0],
// //                     [2500, 0],
// //                   ],
// //                   angle: 0,
// //                   strokeColor: '#3e6c4e',
// //                   backgroundColor: 'transparent',
// //                   strokeWidth: 2,
// //                   roughness: 0,
// //                   opacity: 50,
// //                   seed: Math.floor(Math.random() * 100000),
// //                   version: 1,
// //                   versionNonce: Math.floor(Math.random() * 100000),
// //                   isDeleted: false,
// //                   groupIds: [],
// //                   boundElementIds: [],
// //                   updated: Date.now(),
// //                   locked: true,
// //                 } as ExcalidrawElement
// //               }),
// //             }}
// //           >
// //             <div className="absolute top-2 right-20% flex gap-2 z-4">
// //               <MoodSelector mood={mood} onChange={onMoodChange} />
// //               <button
// //                 onClick={() => document.getElementById('image-upload')?.click()}
// //                 className="btn-zelda-apple"
// //               >
// //                 插入图片
// //               </button>
// //               <button onClick={generatePreview} className="btn-zelda-apple">
// //                 预览
// //               </button>
// //               <button onClick={handleSave} className="btn-zelda-apple">
// //                 保存
// //               </button>
// //             </div>
// //           </Excalidraw>
// //         </div>
// //       </ErrorBoundary>

// //       {previewImage && (
// //         <div className="absolute top-10 left-10 w-80% max-w-800px bg-white border-2 border-blue-500 rounded-xl overflow-hidden shadow-lg z-100 p-4">
// //           <img src={previewImage} alt="预览图" className="w-full h-auto object-contain" />
// //           <button
// //             onClick={() => setPreviewImage(null)}
// //             className="mt-2 p-2 bg-red-500 text-white rounded"
// //           >
// //             关闭预览
// //           </button>
// //         </div>
// //       )}
// //     </div>
// //   )
// // }



// // import { useState, useRef, useEffect, useMemo } from 'react'
// // import {Excalidraw} from '@excalidraw/excalidraw'
// // // import { useNavigate } from 'react-router-dom'
// // import '../styles/ExcalidrawCustom.css'
// // import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types/types'
// // import type { BinaryFileData, DataURL } from '@excalidraw/excalidraw/types/types'
// // import type { FillStyle, StrokeStyle } from '@excalidraw/excalidraw/types/element/types'
// // import { exportToBlob } from '@excalidraw/excalidraw'
// // import {useDiarySave} from '../hooks/useSaveDiary'
// // import type {Mood} from '../types/diary'
// // import {blobToDataURL} from '../utils/image'
// // import MoodSelector from '../components/MoodSelector'
// // import { useParams, useNavigate } from 'react-router-dom'
// // import { fetchDiaryById } from '../api/diaries'
// // import type {AppState} from '@excalidraw/excalidraw/types/types'
// // import type { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types'
// // import { ErrorBoundary } from '../components/common/ErrorBoundary'
// // import useUserStore from '../store/user'
// // import type { Collaborator } from '@excalidraw/excalidraw/types/types'
// // import { toast } from 'react-hot-toast'

// // export default function DiaryEdit() {

// //   const { user } = useUserStore()

// //   const {id: paramId} = useParams<{id: string}>()
// //   const navigate = useNavigate()

// //   const [title, setTitle] = useState('')
// //   const [mood, setMood] = useState<Mood>('happy' as Mood)
// //   const [tags, setTags] = useState<string[]>([])
// //   const [tagInput, setTagInput] = useState<string>("")
// //   const [diaryId, setDiaryId] = useState<string | null>(null)
// //   // const navigate = useNavigate()
// //   const excalidrawRef = useRef<ExcalidrawImperativeAPI>(null)
// //   const { saveDiary } = useDiarySave(diaryId, setDiaryId)

// //   const [previewImage, setPreviewImage] = useState<string | null>(null)

// //   const dirtyRef = useRef(false)
// //   const markDirty = () => {
// //     dirtyRef.current = true
// //   }

// //   const collaborators = useMemo(
// //     () =>
// //       new Map<string, Collaborator>(
// //         user._id
// //           ? [
// //               [
// //                 user._id,
// //                 {
// //                   username: user.username || 'Anonymous',
// //                   id: user._id,
// //                 },
// //               ],
// //             ]
// //           : []
// //       ),
// //     [user._id, user.username]
// //   );

// //   // 加载日记
// //   useEffect(() => {
// //   if (!paramId) return;

// //   (async () => {
// //     try {
// //       const data = await fetchDiaryById(paramId);

// //       // 保持原有字段恢复
// //       setTitle(data.title || '');
// //       setMood(data.mood || 'happy');
// //       setTags(data.tags || []);
// //       setDiaryId(data._id);

// //       // 安全解析 content
// //       type Parsed = {
// //         elements?: ExcalidrawElement[];
// //         appState?: Partial<AppState>;
// //         files?: { url: string }[];
// //       };
// //       let parsed: Parsed = {};
// //       if (data.content) {
// //         try {
// //           parsed = JSON.parse(data.content);
// //         } catch {
// //           parsed = {};
// //         }
// //       }

// //       // 恢复元素与状态
// //       const elements = Array.isArray(parsed.elements) ? parsed.elements : [];
// //       // const appState = parsed.appState
// //       //   ? (parsed.appState as AppState)
// //       //   : ({} as AppState);
// //       // 合并 appState，确保 collaborators 存在
// //       // const appState = parsed.appState
// //       //   ? { ...parsed.appState, collaborators, viewBackgroundColor: '#f8f1d5' }
// //       //   : { collaborators, viewBackgroundColor: '#f8f1d5' };
// //       const appState: Partial<AppState> = parsed.appState
// //             ? {
// //                 ...parsed.appState,
// //                 collaborators,
// //                 viewBackgroundColor: '#f8f1d5',
// //                 contextMenu: null, // ADDED: 确保 contextMenu 不为 undefined
// //               }
// //             : {
// //                 collaborators,
// //                 viewBackgroundColor: '#f8f1d5',
// //                 contextMenu: null, // ADDED: 确保 contextMenu 不为 undefined
// //               };

// //       // CHANGED: 转成 BinaryFileData，使用 url 作为 id 和 dataURL，以满足类型
// //       const filesArray: BinaryFileData[] = Array.isArray(parsed.files)
// //         ? parsed.files.map(f => ({
// //             id: f.url as unknown as BinaryFileData['id'],
// //             mimeType: 'image/png',
// //             created: Date.now(),
// //             dataURL: f.url as unknown as DataURL,
// //           }))
// //         : [];

// //       // 注入文件
// //       if (filesArray.length && excalidrawRef.current) {
// //         console.log('Adding files to Excalidraw:', filesArray); // ADDED: 调试日志
// //         excalidrawRef.current.addFiles(filesArray);
// //       }

// //       // 恢复场景
// //       excalidrawRef.current?.updateScene({ elements, appState });
// //     } catch (err) {
// //       console.error('读取日记失败:', err);
// //       alert(
// //         `读取日记失败: ${((err as Error).message) || '未知错误'}，正在跳转列表页`
// //       );
// //       navigate('/diaries');
// //     }
// //   })();
// // }, [paramId, navigate, collaborators]);


  

// //   // MODIFIED: 更新 buildFormData，区分 images（截图）和 contentImages（内容图片）
// //   const buildFormData = async () => {
// //     const blob = await generateBlob();
// //     if (!blob) return null;

// //     const scene = excalidrawRef.current?.getSceneElements();
// //     const appState = excalidrawRef.current?.getAppState();
// //     const files = excalidrawRef.current?.getFiles() || {};

// //     // ADDED: 日志记录 FormData 内容，方便调试
// //     console.log('Building FormData:', {
// //       sceneLength: scene?.length,
// //       appState,
// //       files,
// //       contentSize: new TextEncoder().encode(
// //         JSON.stringify({
// //           elements: scene,
// //           appState: { ...appState, collaborators, contextMenu: null },
// //           files,
// //         })
// //       ).length,
// //     });

// //     // ADDED: 清理 files，仅保留元数据（id、mimeType、created）
// //     const cleanedFiles = files
// //       ? Object.fromEntries(
// //           Object.entries(files).map(([key, file]) => [
// //             key,
// //             {
// //               id: file.id,
// //               mimeType: file.mimeType,
// //               created: file.created,
// //             },
// //           ])
// //         )
// //       : {};

// //     const form = new FormData();
// //     form.append('title', title);
// //     form.append('mood', mood);
// //     // MODIFIED: content 包含清理后的 files，实际图片通过 contentImages 上传
// //     form.append(
// //       'content',
// //       JSON.stringify({
// //         elements: scene,
// //         appState: { ...appState, collaborators, contextMenu: null },
// //         files: cleanedFiles,
// //       })
// //     );
// //     tags.forEach(t => form.append('tags', t));
// //     // ADDED: 添加画布截图
// //     form.append('images', blob, 'snapshot.png');

// //     // ADDED: 添加内容图片到 contentImages
// //     if (scene) {
// //       scene.forEach(element => {
// //         if (element.type === 'image' && element.customData?.originalFile) {
// //           const file = element.customData.originalFile as File;
// //           form.append('contentImages', file, `content-image-${element.fileId}.png`);
// //         }
// //       });
// //     }

// //     return form;
// //   };

// //   // 自动保存
// //   useEffect(() => {
// //     const id = setInterval(async () => {
// //       if (!dirtyRef.current || !title.trim()) {
// //         console.log('Auto-save skipped: not dirty or no title');
// //         return;
// //       }

// //       const form = await buildFormData();
// //       if (!form) {
// //         console.log('Auto-save skipped: no FormData');
// //         return;
// //       }

// //       console.log('Auto-saving with diaryId:', diaryId);
// //       try {
// //         const response = await saveDiary(form);
// //         console.log('Auto-save response:', response);
// //         dirtyRef.current = false;
// //       } catch (err) {
// //         console.error('Auto-save failed:', err);
// //         toast.error('自动保存失败');
// //       }
// //     }, 30_000);

// //     return () => clearInterval(id);
// //   }, [title, mood, tags, saveDiary, collaborators, diaryId]);

// //   // 在任何改变 title / mood / tags / 画布操作 后都调用 markDirty()
// //   const onTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
// //     setTitle(e.target.value)
// //     markDirty()
// //   }
// //   const onMoodChange = (m: Mood) => {
// //     setMood(m)
// //     markDirty()
// //   }

// //   const generatePreview = async (): Promise<string | null> => {
// //     if (!excalidrawRef.current) return null

// //     try {
// //       const elements = excalidrawRef.current.getSceneElements()
// //       const files = excalidrawRef.current.getFiles()
// //       if (!elements.length) return null

// //       const blob = await exportToBlob({
// //         elements,
// //         files,
// //         mimeType: 'image/png',
// //         quality: 0.8,
// //         appState: {
// //           exportBackground: true,
// //           viewBackgroundColor: '#f8f1d5',
// //         },
// //       })

// //       const dataUrl = await blobToDataURL(blob)
// //       setPreviewImage(dataUrl)
// //       return dataUrl
// //     } catch (error) {
// //       console.error('截图生成失败:', error)
// //       return null
// //     }
// //   }

// //   const generateBlob = async (): Promise<Blob | null> => {
// //     const api = excalidrawRef.current
// //     if (!api) return null
// //     const elements = api.getSceneElements()
// //     const files = api.getFiles()
// //     if (!elements.length) return null

// //     try {
// //       return await exportToBlob({
// //         elements,
// //         files,
// //         mimeType: 'image/png',
// //         quality: 0.8,
// //         appState: {
// //           exportBackground: true,
// //           viewBackgroundColor: '#f8f1d5',
// //         },
// //       })
// //     } catch (e) {
// //       console.error('导出 Blob 失败', e)
// //       return null
// //     }
// //   }

// //   const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
// //     if((e.key === "Enter" || e.key === ",") && tagInput.trim()){
// //       e.preventDefault()
// //       const newTag = tagInput.trim()
// //       if(!tags.includes(newTag)){
// //         setTags([...tags, newTag])
// //         markDirty()
// //       }
// //       setTagInput("")
// //     }
// //   }

// //   const removeTag = (tagToRemove: string) => {
// //     setTags(tags.filter((tag) => tag !== tagToRemove))
// //     markDirty()
// //   }

// //   // const handleSave = async () => {
// //   //   if (!title.trim()) {
// //   //     alert('标题不能为空！')
// //   //     return
// //   //   }
// //   //   const blob = await generateBlob()
// //   //   if (!blob) {
// //   //     alert('没有内容可保存')
// //   //     return
// //   //   }

// //   //   const scene = excalidrawRef.current?.getSceneElements()
// //   //   const appState = excalidrawRef.current?.getAppState()
// //   //   const files = excalidrawRef.current?.getFiles()

// //   //   console.log('Manual save data:', { sceneLength: scene?.length, appState, files });

// //   //   // 清理 files 中的 dataURL
// //   //     const cleanedFiles = files
// //   //       ? Object.fromEntries(
// //   //           Object.entries(files).map(([key, file]) => [
// //   //             key,
// //   //             {
// //   //               id: file.id,
// //   //               mimeType: file.mimeType,
// //   //               created: file.created,
// //   //             } as BinaryFileData,
// //   //           ])
// //   //         )
// //   //       : {};
// //   //   // 构造 FormData
// //   //   const form = new FormData()
// //   //   form.append('title', title)
// //   //   form.append('mood', mood)
// //   //   // form.append('content', JSON.stringify({elements: scene, appState, files: cleanedFiles}))        // 如果你有文本内容，也 append
// //   //   form.append(
// //   //     'content',
// //   //     JSON.stringify({
// //   //       elements: scene,
// //   //       appState: { ...appState, collaborators, contextMenu: null }, // ADDED: 统一 content 构造
// //   //       files: cleanedFiles,
// //   //     })
// //   //   );
    
// //   //   // 如果有标签，多次 append
// //   //   tags.forEach(tag => form.append('tags', tag))

// //   //   // key 要和后端 upload.array('images') 里的一致
// //   //   form.append('images', blob, 'snapshot.png')

// //   //   if(scene){
// //   //     scene.forEach(element => {
// //   //       if(element.type === 'image' && element.customData?.originalFile){
// //   //         const file = element.customData.originalFile as File
// //   //         form.append('images', file, `content-image-${element.fileId}.png`)
// //   //       }
// //   //     })
// //   //   }

// //   //   await saveDiary(form)
// //   // }

// //   // 手动保存
// //   const handleSave = async () => {
// //     if (!title.trim()) {
// //       toast.error('标题不能为空！');
// //       return;
// //     }

// //     const form = await buildFormData();
// //     if (!form) {
// //       toast.error('没有内容可保存');
// //       return;
// //     }

// //     console.log('Manual saving with diaryId:', diaryId);
// //     try {
// //       const response = await saveDiary(form);
// //       console.log('Manual save response:', response);
// //       toast.success('手动保存成功');
// //     } catch (err) {
// //       console.error('Manual save failed:', err);
// //       toast.error('手动保存失败: ' + (err instanceof Error ? err.message : '未知错误'));
// //     }
// //   };

// //   const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
// //   const file = e.target.files?.[0];
// //   if (!file || !excalidrawRef.current) return;

// //   const supportedMimeTypes = [
// //     "image/png",
// //     "image/jpeg",
// //     "image/svg+xml",
// //     "image/gif",
// //     "image/webp",
// //     "image/bmp",
// //     "image/x-icon",
// //     "application/octet-stream",
// //   ];

// //   if (!supportedMimeTypes.includes(file.type)) {
// //     alert("不支持的图片类型！");
// //     return;
// //   }

// //   const reader = new FileReader();
// //   reader.onload = async () => {
// //     const dataUrl = reader.result as string;
// //     const img = new Image();
// //     img.src = dataUrl;

// //     img.onload = () => {
// //       const now = Date.now();
// //       const id = `image-${now}` as string as BinaryFileData["id"]
// //       const files: BinaryFileData[] = [
// //         {
// //           id,
// //           mimeType: file.type as BinaryFileData["mimeType"],
// //           dataURL: dataUrl as DataURL,
// //           created: now,
// //         },
// //       ];

// //       const api = excalidrawRef.current!;
// //       api.addFiles(files);

// //       const imageElement = {
// //         id: `img-elem-${now}`,
// //         type: "image" as const,
// //         x: 100,
// //         y: 100,
// //         width: img.naturalWidth,
// //         height: img.naturalHeight,
// //         angle: 0,
// //         strokeColor: "transparent",
// //         backgroundColor: "transparent",
// //         fillStyle: "solid" as FillStyle,
// //         strokeWidth: 1,
// //         roughness: 0,
// //         opacity: 100,
// //         groupIds: [],
// //         boundElementIds: [],
// //         seed: Math.floor(Math.random() * 100000),
// //         version: 1,
// //         versionNonce: Math.floor(Math.random() * 100000),
// //         isDeleted: false,
// //         updated: now,
// //         locked: false,
// //         status: "pending" as const,
// //         fileId: id,
// //         strokeStyle: "solid" as StrokeStyle, // 你也可以设置为 "dashed" 或 "dotted"
// //         roundness: null,
// //         boundElements: [],
// //         link: null,
// //         customData: { originalFile: file },
// //         scale: [1, 1],
// //       };

// //       console.log('Updating scene with image element:', imageElement); // ADDED: 调试日志

// //       api.updateScene({
// //         // eslint-disable-next-line @typescript-eslint/no-explicit-any
// //         elements: [...api.getSceneElements(), imageElement as any],
// //       });
// //       markDirty()
// //     };
// //   };
// //   reader.readAsDataURL(file);
// //   e.target.value = '';
  
// // };
  

// //   return (
// //     <div className="page-sheikah font-orbitron relative min-h-[1024px]">
// //       <img
// //         src="/tears-of-kingdom.png"
// //         alt="Background"
// //         className="absolute top-0 left-0 w-full h-full object-fill z-10 pointer-events-none"
// //       />

// //       <div className="decorative-top py-5 mx-40% relative z-11 flex items-center gap-4">
        
// //         <div className="taginput-zelda">
// //           {tags.map((tag) => (
// //             <span key={tag} className="taginput-tag flex items-center gap-1">
// //               {tag}
// //               <button
// //                 onClick={() => removeTag(tag)}
// //                 className="text-red-300 hover:text-red-500 font-bold bg-transparent"
// //               >
// //                 ×
// //               </button>
// //             </span>
// //           ))}
// //           <input
// //             type="text"
// //             value={tagInput}
// //             onChange={(e) => setTagInput(e.target.value)}
// //             onKeyDown={handleTagKeyDown}
// //             placeholder="输入标签..."
// //             className="taginput-input"
// //           />
// //         </div>
        
// //         <input
// //           type="text"
// //            maxLength={100}
// //            placeholder="输入日记标题..."
// //            value={title}
// //            onChange={onTitleChange}
// //            className="input-zelda-apple-lite"
// //          />
// //       </div>

// //       <input
// //         id="image-upload"
// //         type="file"
// //         accept="image/*"
// //         capture="environment"
// //         className="hidden"
// //         onChange={handleImageUpload}
// //       />

// //       {/* Excalidraw 区域 */}
// //       <ErrorBoundary>
// //         <div className="w-screen h-screen relative z-5">
// //           <Excalidraw
// //             ref={excalidrawRef}
// //             onChange={() => {
// //               // console.log('Excalidraw collaborators:', appState.collaborators);
// //               markDirty();
// //             }}
// //             viewModeEnabled={false}
// //             zenModeEnabled={false}
// //             UIOptions={{
// //               canvasActions: {
// //                 loadScene: true,
// //               },
// //               // collaboration: { enable: false } as any,
// //             }}
// //             initialData={{
// //               collaborators,
// //               appState: {
// //                 viewBackgroundColor: "#f8f1d5",
// //                 collaborators,
// //                 contextMenu: null,
// //               },
// //               elements: Array.from({ length: 50 }, (_, i) => {
// //                 const y = 100 + i * 60
// //                 return {
// //                   id: `line-${i}`,
// //                   type: "line",
// //                   x: 0,
// //                   y,
// //                   width: 5000,
// //                   height: 0,
// //                   points: [[0, 0], [2500, 0]],
// //                   angle: 0,
// //                   strokeColor: "#3e6c4e",
// //                   backgroundColor: "transparent",
// //                   strokeWidth: 2,
// //                   roughness: 0,
// //                   opacity: 50,
// //                   seed: Math.floor(Math.random() * 100000),
// //                   version: 1,
// //                   versionNonce: Math.floor(Math.random() * 100000),
// //                   isDeleted: false,
// //                   groupIds: [],
// //                   boundElementIds: [],
// //                   updated: Date.now(),
// //                   locked: true,
// //                 }
// //               }),
// //             }}
// //           >

// //             {/* 工具栏右侧：情绪选择 + 保存按钮 */}
// //             <div className="absolute top-2 right-20% flex gap-2 z-4">

// //               <MoodSelector mood={mood} onChange = {onMoodChange}/>
// //               <button
// //                 onClick={() => document.getElementById('image-upload')?.click()}
// //                 className="btn-zelda-apple"
// //               >
// //                 插入图片
// //               </button>
// //               <button onClick={generatePreview} className="btn-zelda-apple">
// //                 预览
// //               </button>
// //               {/* <button onClick={handleSave} className="btn-zelda-apple"> */}
// //               <button onClick={handleSave} className="btn-zelda-apple">
// //                 保存
// //               </button>
              
// //             </div>
// //           </Excalidraw>
// //         </div>
// //       </ErrorBoundary>
// //       {/* 预览图展示 */}
// //             {previewImage && (
// //               <div className="absolute top-10 left-10 w-80% max-w-800px bg-white border-2 border-blue-500 rounded-xl overflow-hidden shadow-lg z-100 p-4">
// //                 <img src={previewImage} alt="预览图" className="w-full h-auto object-contain" />
// //                 <button
// //                   onClick={() => setPreviewImage(null)}
// //                   className="mt-2 p-2 bg-red-500 text-white rounded"
// //                 >
// //                   关闭预览
// //                 </button>
// //               </div>
// //             )}
// //     </div>
// //   )
// // }
// app/src/pages/DiaryEditor.tsx

// import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
// import { Excalidraw } from '@excalidraw/excalidraw';
// import '../styles/ExcalidrawCustom.css';
// import type { ExcalidrawImperativeAPI, BinaryFileData, DataURL, Collaborator } from '@excalidraw/excalidraw/types/types';
// import type { FillStyle, StrokeStyle, ExcalidrawElement, FileId } from '@excalidraw/excalidraw/types/element/types';
// import { exportToBlob } from '@excalidraw/excalidraw';
// import { useDiarySave } from '../hooks/useSaveDiary';
// import type { Mood } from '../types/diary';
// import { blobToDataURL } from '../utils/image';
// import MoodSelector from '../components/MoodSelector';
// import { useParams, useNavigate } from 'react-router-dom';
// import { fetchDiaryById } from '../api/diaries';
// import { ErrorBoundary } from '../components/common/ErrorBoundary';
// import useUserStore from '../store/user';
// import { toast } from 'react-hot-toast';

// type ParsedDiaryContent = {
//   elements?: ExcalidrawElement[];
//   appState?: Record<string, unknown>;
//   files?: Record<string, { id: string; mimeType: string; url?: string; created: number }>;
// };

// export default function DiaryEdit() {
//   const { user } = useUserStore();
//   const { id: paramId } = useParams<{ id: string }>();
//   const navigate = useNavigate();

//   const [title, setTitle] = useState('');
//   const [mood, setMood] = useState<Mood>('happy' as Mood);
//   const [tags, setTags] = useState<string[]>([]);
//   const [tagInput, setTagInput] = useState<string>('');
//   const [diaryId, setDiaryId] = useState<string | null>(null);
//   const excalidrawRef = useRef<ExcalidrawImperativeAPI>(null);
//   const { saveDiary } = useDiarySave(diaryId, setDiaryId);

//   const [previewImage, setPreviewImage] = useState<string | null>(null);

//   const dirtyRef = useRef(false);
//   const markDirty = () => {
//     dirtyRef.current = true;
//   };

//   const collaborators = useMemo(
//     () =>
//       new Map<string, Collaborator>(
//         user._id
//           ? [
//               [
//                 user._id,
//                 {
//                   username: user.username || 'Anonymous',
//                   id: user._id,
//                 },
//               ],
//             ]
//           : []
//       ),
//     [user._id, user.username]
//   );

//   useEffect(() => {
//     if (!paramId) return;

//     const loadDiary = async () => {
//       try {
//         const data = await fetchDiaryById(paramId);

//         setTitle(data.title || '');
//         setMood(data.mood || 'happy');
//         setTags(data.tags || []);
//         setDiaryId(data._id);

//         let parsed: ParsedDiaryContent = {};
//         if (data.content) {
//           try {
//             parsed = JSON.parse(data.content);
//           } catch {
//             parsed = {};
//           }
//         }

//         const { elements = [], appState: sceneAppState = {}, files: sceneFiles = {} } = parsed;

//         const appState = {
//           ...sceneAppState,
//           collaborators,
//           viewBackgroundColor: '#f8f1d5',
//           contextMenu: null,
//         };
        
//         const filesArray: BinaryFileData[] = await Promise.all(
//           Object.values(sceneFiles).map(async (file) => {
//             if (!file || !file.url) {
//               console.warn('File object or file.url is missing, skipping file:', file);
//               return null;
//             }
//             const res = await fetch(`http://localhost:3000${file.url}`);
//             const blob = await res.blob();
//             const dataURL = await blobToDataURL(blob);
//             return {
//               id: file.id as FileId,
//               mimeType: file.mimeType as BinaryFileData['mimeType'],
//               dataURL: dataURL as DataURL,
//               created: file.created,
//             };
//           })
//         ).then(results => results.filter((file): file is BinaryFileData => file !== null));
        
//         if (excalidrawRef.current) {
//           excalidrawRef.current.addFiles(filesArray);
//           excalidrawRef.current.updateScene({ elements, appState });
//         }
//       } catch (err) {
//         console.error('读取日记失败:', err);
//         toast.error(`读取日记失败: ${err instanceof Error ? err.message : '未知错误'}，正在跳转列表页`);
//         navigate('/diaries');
//       }
//     };

//     loadDiary();
//   }, [paramId, navigate, collaborators]);
  

//   const buildFormData = useCallback(async () => {
//     const blob = await generateBlob();
//     if (!blob) {
//       console.error('generateBlob 返回 null，无法生成预览图');
//       return null;
//     }

//     const scene = excalidrawRef.current?.getSceneElements();
//     const appState = excalidrawRef.current?.getAppState();
//     const files = excalidrawRef.current?.getFiles() || {};
    
//     // --- 最终修复: 替换 'any' 为 'BinaryFileData' ---
//     const cleanedFiles = files
//       ? Object.fromEntries(
//           Object.entries(files).map(([key, file]: [string, BinaryFileData]) => [
//             key,
//             {
//               id: file.id,
//               mimeType: file.mimeType,
//               created: file.created,
//               // eslint-disable-next-line @typescript-eslint/no-explicit-any
//               url: (file as any).url || undefined,
//             },
//           ])
//         )
//       : {};

//     const form = new FormData();
//     form.append('title', title);
//     form.append('mood', mood);
//     form.append(
//       'content',
//       JSON.stringify({
//         elements: scene,
//         appState: { ...appState, collaborators, contextMenu: null },
//         files: cleanedFiles,
//       })
//     );
//     tags.forEach(t => form.append('tags', t));
//     form.append('images', blob, 'snapshot.png');

//     if (scene) {
//       scene.forEach(element => {
//         if (element.type === 'image' && element.customData?.originalFile instanceof File) {
//           const file = element.customData.originalFile as File;
//           form.append('contentImages', file, `content-image-${element.fileId}.png`);
//         }
//       });
//     }

//     return form;
//   }, [title, mood, tags, collaborators, excalidrawRef]);
  
//   function toFileId(id: string): FileId {
//     return id as FileId;
//   }

//   const updateSceneWithFiles = useCallback(async (
//     files: Record<string, { id: string; mimeType: string; url?: string; created: number }>
//   ) => {
//     if (!excalidrawRef.current || !files) return;

//     const processedFiles: BinaryFileData[] = [];
//     for (const file of Object.values(files)) {
//       if (file.url) {
//         try {
//           const res = await fetch(`http://localhost:3000${file.url}`);
//           const blob = await res.blob();
//           const dataURL = await blobToDataURL(blob);

//           processedFiles.push({
//             id: toFileId(file.id),
//             mimeType: file.mimeType as BinaryFileData['mimeType'],
//             dataURL: dataURL as DataURL,
//             created: file.created,
//           });
//         } catch (error) {
//           console.error('加载图片失败:', error);
//           toast.error(`图片加载失败: ${file.url}`);
//           continue;
//         }
//       }
//     }
//     excalidrawRef.current.addFiles(processedFiles);
//   }, [excalidrawRef]);

//   useEffect(() => {
//     const id = setInterval(async () => {
//       if (!dirtyRef.current || !title.trim()) {
//         return;
//       }

//       const form = await buildFormData();
//       if (!form) {
//         return;
//       }

//       try {
//         const response = await saveDiary(form);
//         const parsedContent = JSON.parse(response.data.content);
//         await updateSceneWithFiles(parsedContent.files);
//         dirtyRef.current = false;
//         toast.success('自动保存成功');
//       } catch (err) {
//         console.error('Auto-save failed:', err);
//         toast.error('自动保存失败');
//       }
//     }, 30_000);

//     return () => clearInterval(id);
//   }, [title, mood, tags, saveDiary, collaborators, diaryId, buildFormData, updateSceneWithFiles]);

//   const onTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setTitle(e.target.value);
//     markDirty();
//   };
//   const onMoodChange = (m: Mood) => {
//     setMood(m);
//     markDirty();
//   };

//   const generatePreview = async (): Promise<string | null> => {
//     if (!excalidrawRef.current) return null;

//     try {
//       const elements = excalidrawRef.current.getSceneElements();
//       const files = excalidrawRef.current.getFiles() || {};

//       if (!elements.length) return null;

//       const blob = await exportToBlob({
//         elements,
//         files,
//         mimeType: 'image/png',
//         appState: {
//           exportBackground: true,
//           viewBackgroundColor: '#f8f1d5',
//         },
//       });

//       const dataUrl = await blobToDataURL(blob);
//       setPreviewImage(dataUrl);
//       return dataUrl;
//     } catch (error) {
//       console.error('截图生成失败:', error);
//       if (error instanceof DOMException && error.name === 'SecurityError') {
//         toast.error('截图生成失败，请检查图片来源是否支持 CORS');
//       } else {
//         toast.error('截图生成失败');
//       }
//       return null;
//     }
//   };
  
//   const generateBlob = async (): Promise<Blob | null> => {
//     const api = excalidrawRef.current;
//     if (!api) return null;
//     const elements = api.getSceneElements();
//     const files = api.getFiles() || {};

//     if (!elements.length) return null;

//     try {
//       return await exportToBlob({
//         elements: elements,
//         files: files,
//         mimeType: 'image/png',
//         appState: {
//           exportBackground: true,
//           viewBackgroundColor: '#f8f1d5',
//         },
//       });
//     } catch (e) {
//       console.error('导出 Blob 失败:', e);
//       if (e instanceof DOMException && e.name === 'SecurityError') {
//         toast.error('导出 Blob 失败，请检查图片来源是否支持 CORS');
//       } else {
//         toast.error('导出 Blob 失败');
//       }
//       return null;
//     }
//   };

//   const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
//       e.preventDefault();
//       const newTag = tagInput.trim();
//       if (!tags.includes(newTag)) {
//         setTags([...tags, newTag]);
//         markDirty();
//       }
//       setTagInput('');
//     }
//   };

//   const removeTag = (tagToRemove: string) => {
//     setTags(tags.filter(tag => tag !== tagToRemove));
//     markDirty();
//   };

//   const handleSave = async () => {
//     if (!title.trim()) {
//       toast.error('标题不能为空！');
//       return;
//     }

//     const form = await buildFormData();
//     if (!form) {
//       toast.error('没有内容可保存');
//       return;
//     }

//     try {
//       const response = await saveDiary(form);
//       const parsedContent = JSON.parse(response.data.content);
//       await updateSceneWithFiles(parsedContent.files);
//       toast.success('手动保存成功');
//     } catch (err) {
//       console.error('Manual save failed:', err);
//       toast.error('手动保存失败: ' + (err instanceof Error ? err.message : '未知错误'));
//     }
//   };

//   const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file || !excalidrawRef.current) return;

//     const reader = new FileReader();
//     reader.onload = async () => {
//       const dataUrl = reader.result as string;
//       const img = new Image();
//       img.crossOrigin = 'anonymous';
//       img.src = dataUrl;

//       img.onload = () => {
//         const now = Date.now();
//         const id = toFileId(`image-${now}`);
//         const files: BinaryFileData[] = [
//           {
//             id,
//             mimeType: file.type as BinaryFileData['mimeType'],
//             dataURL: dataUrl as DataURL,
//             created: now,
//           },
//         ];

//         const api = excalidrawRef.current!;
//         api.addFiles(files);

//         const imageElement: ExcalidrawElement = {
//           id: `img-elem-${now}` as ExcalidrawElement['id'],
//           type: 'image' as const,
//           x: 100,
//           y: 100,
//           width: img.naturalWidth,
//           height: img.naturalHeight,
//           angle: 0,
//           strokeColor: 'transparent',
//           backgroundColor: 'transparent',
//           fillStyle: 'solid' as FillStyle,
//           strokeWidth: 1,
//           roughness: 0,
//           opacity: 100,
//           groupIds: [],
//           boundElements: null,
//           seed: Math.floor(Math.random() * 100000),
//           version: 1,
//           versionNonce: Math.floor(Math.random() * 100000),
//           isDeleted: false,
//           updated: now,
//           locked: false,
//           status: 'pending' as const,
//           fileId: id,
//           strokeStyle: 'solid' as StrokeStyle,
//           roundness: null,
//           link: null,
//           customData: { originalFile: file },
//           scale: [1, 1],
//         };

//         api.updateScene({
//           elements: [...api.getSceneElements(), imageElement],
//         });
//         markDirty();
//       };
//     };
//     reader.readAsDataURL(file);
//     e.target.value = '';
//   };

//   return (
//     <div className="page-sheikah font-orbitron relative min-h-[1024px]">
//       <img
//         src="/tears-of-kingdom.png"
//         alt="Background"
//         className="absolute top-0 left-0 w-full h-full object-fill z-10 pointer-events-none"
//       />

//       <div className="decorative-top py-5 mx-40% relative z-11 flex items-center gap-4">
//         <div className="taginput-zelda">
//           {tags.map(tag => (
//             <span key={tag} className="taginput-tag flex items-center gap-1">
//               {tag}
//               <button
//                 onClick={() => removeTag(tag)}
//                 className="text-red-300 hover:text-red-500 font-bold bg-transparent"
//               >
//                 ×
//               </button>
//             </span>
//           ))}
//           <input
//             type="text"
//             value={tagInput}
//             onChange={e => setTagInput(e.target.value)}
//             onKeyDown={handleTagKeyDown}
//             placeholder="输入标签..."
//             className="taginput-input"
//           />
//         </div>

//         <input
//           type="text"
//           maxLength={100}
//           placeholder="输入日记标题..."
//           value={title}
//           onChange={onTitleChange}
//           className="input-zelda-apple-lite"
//         />
//       </div>

//       <input
//         id="image-upload"
//         type="file"
//         accept="image/*"
//         capture="environment"
//         className="hidden"
//         onChange={handleImageUpload}
//       />

//       <ErrorBoundary>
//         <div className="w-screen h-screen relative z-5">
//           <Excalidraw
//             ref={excalidrawRef}
//             onChange={() => {
//               markDirty()
//             }}
//             viewModeEnabled={false}
//             zenModeEnabled={false}
//             UIOptions={{
//               canvasActions: {
//                 loadScene: true,
//               },
//             }}
//             initialData={{
//               collaborators,
//               appState: {
//                 viewBackgroundColor: '#f8f1d5',
//                 collaborators,
//                 contextMenu: null,
//               },
//               elements: Array.from({ length: 50 }, (_, i) => {
//                 const y = 100 + i * 60
//                 return {
//                   id: `line-${i}`,
//                   type: "line",
//                   x: 0,
//                   y,
//                   width: 5000,
//                   height: 0,
//                   angle: 0,
//                   strokeColor: "#3e6c4e",
//                   backgroundColor: "transparent",
//                   fillStyle: "hachure",
//                   strokeWidth: 2,
//                   strokeStyle: "solid",
//                   roughness: 0,
//                   opacity: 50,
//                   groupIds: [],
//                   roundness: null,
//                   seed: Math.floor(Math.random() * 100000),
//                   version: 1,
//                   versionNonce: Math.floor(Math.random() * 100000),
//                   isDeleted: false,
//                   boundElements: null,
//                   updated: Date.now(),
//                   link: null,
//                   locked: true,
//                   points: [
//                     [0, 0],
//                     [2500, 0],
//                   ],
//                   lastCommittedPoint: null,
//                   startBinding: null,
//                   endBinding: null,
//                   startArrowhead: null,
//                   endArrowhead: null,
//                 } as ExcalidrawElement
//               }),
//             }}
//           >
//             <div className="absolute top-2 right-20% flex gap-2 z-4">
//               <MoodSelector mood={mood} onChange={onMoodChange} />
//               <button
//                 onClick={() => document.getElementById('image-upload')?.click()}
//                 className="btn-zelda-apple"
//               >
//                 插入图片
//               </button>
//               <button onClick={generatePreview} className="btn-zelda-apple">
//                 预览
//               </button>
//               <button onClick={handleSave} className="btn-zelda-apple">
//                 保存
//               </button>
//             </div>
//           </Excalidraw>
//         </div>
//       </ErrorBoundary>

//       {previewImage && (
//         <div className="absolute top-10 left-10 w-80% max-w-800px bg-white border-2 border-blue-500 rounded-xl overflow-hidden shadow-lg z-100 p-4">
//           <img src={previewImage} alt="预览图" className="w-full h-auto object-contain" />
//           <button
//             onClick={() => setPreviewImage(null)}
//             className="mt-2 p-2 bg-red-500 text-white rounded"
//           >
//             关闭预览
//           </button>
//         </div>
//       )}
//     </div>
//   )
// }
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

type ParsedDiaryContent = {
  elements?: ExcalidrawElement[];
  appState?: Record<string, unknown>;
  files?: Record<string, { id: string; mimeType: string; url?: string; created: number }>;
};

// @ts-expect-error - We need to set this global for Excalidraw to work locally.
window.EXCALIDRAW_ASSET_PATH = '/excalidraw-assets/';

export default function DiaryEdit() {
  const { user } = useUserStore();
  const { id: paramId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [mood, setMood] = useState<Mood>('happy' as Mood);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState<string>('');
  const [diaryId, setDiaryId] = useState<string | null>(null);
  const excalidrawRef = useRef<ExcalidrawImperativeAPI>(null);
  const { saveDiary } = useDiarySave(diaryId, setDiaryId);

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const dirtyRef = useRef(false);
  
  // --- 关键修复: 修正 ref 的类型定义，以匹配实际的数据结构 ---
  const serverFileMap = useRef<Record<string, { url?: string }>>({});

  const markDirty = () => {
    dirtyRef.current = true;
  };

  const collaborators = useMemo(
    () =>
      new Map<string, Collaborator>(
        user._id
          ? [[user._id, { username: user.username || 'Anonymous', id: user._id }]]
          : []
      ),
    [user._id, user.username]
  );

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

        const { elements = [], appState: sceneAppState = {}, files: sceneFiles = {} } = parsed;
        
        serverFileMap.current = sceneFiles || {};

        const appState = { ...sceneAppState, collaborators, viewBackgroundColor: '#f8f1d5', contextMenu: null };
        
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
        console.error('读取日记失败:', err);
        toast.error(`读取日记失败: ${err instanceof Error ? err.message : '未知错误'}，正在跳转列表页`);
        navigate('/diaries');
      }
    };

    loadDiary();
  }, [paramId, navigate, collaborators]);
  

  const buildFormData = useCallback(async () => {
    const blob = await generateBlob();
    if (!blob) {
      return null;
    }

    const scene = excalidrawRef.current?.getSceneElements();
    const appState = excalidrawRef.current?.getAppState();
    const files = excalidrawRef.current?.getFiles() || {};
    
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
  
  function toFileId(id: string): FileId {
    return id as FileId;
  }

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
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSuccessfulSave = useCallback(async (response: any) => {
    const parsedContent = JSON.parse(response.data.content);
    serverFileMap.current = parsedContent.files || {};
    await updateSceneWithFiles(parsedContent.files);
    dirtyRef.current = false;
  }, [updateSceneWithFiles]);

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

  const onTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    markDirty();
  };
  const onMoodChange = (m: Mood) => {
    setMood(m);
    markDirty();
  };

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

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('标题不能为空！');
      return;
    }

    const form = await buildFormData();
    if (!form) {
      toast.error('没有内容可保存');
      return;
    }

    try {
      const response = await saveDiary(form);
      await handleSuccessfulSave(response);
      toast.success('手动保存成功');
    } catch (err) {
      console.error('Manual save failed:', err);
      toast.error('手动保存失败: ' + (err instanceof Error ? err.message : '未知错误'));
    }
  };

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

  return (
    <div className="page-sheikah font-orbitron relative min-h-[1024px]">
      <img
        src="/tears-of-kingdom.png"
        alt="Background"
        className="absolute top-0 left-0 w-full h-full object-fill z-10 pointer-events-none"
      />

      <div className="decorative-top py-5 mx-40% relative z-11 flex items-center gap-4">
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

      <ErrorBoundary>
        <div className="w-screen h-screen relative z-5">
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
                  id: `line-${i}`,
                  type: "line",
                  x: 0,
                  y,
                  width: 5000,
                  height: 0,
                  angle: 0,
                  strokeColor: "#3e6c4e",
                  backgroundColor: "transparent",
                  fillStyle: "hachure",
                  strokeWidth: 2,
                  strokeStyle: "solid",
                  roughness: 0,
                  opacity: 50,
                  groupIds: [],
                  roundness: null,
                  seed: Math.floor(Math.random() * 100000),
                  version: 1,
                  versionNonce: Math.floor(Math.random() * 100000),
                  isDeleted: false,
                  boundElements: null,
                  updated: Date.now(),
                  link: null,
                  locked: true,
                  points: [
                    [0, 0],
                    [2500, 0],
                  ],
                  lastCommittedPoint: null,
                  startBinding: null,
                  endBinding: null,
                  startArrowhead: null,
                  endArrowhead: null,
                } as ExcalidrawElement
              }),
            }}
          >
            <div className="absolute top-2 right-20% flex gap-2 z-4">
              <MoodSelector mood={mood} onChange={onMoodChange} />
              <button
                onClick={() => document.getElementById('image-upload')?.click()}
                className="btn-zelda-apple"
              >
                插入图片
              </button>
              <button onClick={generatePreview} className="btn-zelda-apple">
                预览
              </button>
              <button onClick={handleSave} className="btn-zelda-apple">
                保存
              </button>
            </div>
          </Excalidraw>
        </div>
      </ErrorBoundary>

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