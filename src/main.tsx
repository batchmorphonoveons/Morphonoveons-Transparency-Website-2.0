import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

const errorStyle: React.CSSProperties = {
  color: '#b91c1c',
  padding: 16,
  whiteSpace: 'pre-wrap',
  fontSize: 14,
};

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: any }
> {
  state = { error: null as any };
  static getDerivedStateFromError(error: any) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return <pre style={errorStyle}>{String(this.state.error?.stack || this.state.error)}</pre>;
    }
    return this.props.children;
  }
}

const root = createRoot(document.getElementById('root')!);

import('./App.tsx')
  .then(({ default: App }) => {
    root.render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    );
  })
  .catch((err) => {
    root.render(<pre style={errorStyle}>{String(err?.stack || err)}</pre>);
  });
