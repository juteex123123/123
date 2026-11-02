import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white text-black p-6 text-center select-none font-sans">
          <h1 className="text-xl font-medium tracking-tight mb-2">SLAVYAN13</h1>
          <p className="text-sm text-neutral-500 mb-4">Something went wrong while rendering the portfolio.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-1.5 text-xs bg-black text-white rounded-full cursor-pointer hover:bg-neutral-800 transition-colors"
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElem = document.getElementById('root');
if (rootElem) {
  createRoot(rootElem).render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}
