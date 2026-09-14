import React, { Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: 30,
          background: '#0b1021',
          color: '#f8fafc',
          minHeight: '100vh',
          fontFamily: 'sans-serif'
        }}>
          <h2 style={{ color: '#ef4444' }}>⚠️ Platform UI Exception Encountered</h2>
          <p style={{ color: '#94a3b8' }}>{this.state.error?.toString()}</p>
          <pre style={{
            background: '#16233a',
            padding: 15,
            borderRadius: 8,
            overflow: 'auto',
            maxHeight: 400,
            fontSize: 12,
            color: '#fca5a5'
          }}>
            {this.state.errorInfo?.componentStack || this.state.error?.stack}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: 20,
              padding: '10px 20px',
              background: '#08b5e5',
              color: '#000',
              border: 'none',
              borderRadius: 6,
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
