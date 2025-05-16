// app/src/types/excalidraw.d.ts
import 'excalidraw';

declare module '@excalidraw/excalidraw/types/types' {
  interface UIOptions {
    collaboration?: {
      enabled?: boolean;
    };
  }
}
