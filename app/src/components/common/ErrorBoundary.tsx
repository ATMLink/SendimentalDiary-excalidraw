// src/components/ErrorBoundary.tsx
import React, { Component } from 'react';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <h2>发生错误</h2>
          <p>{this.state.error?.message || '未知错误'}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 p-2 bg-red-500 text-white rounded"
          >
            刷新页面
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}