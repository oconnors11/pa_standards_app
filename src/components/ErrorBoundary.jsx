import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px 24px',
          margin: '20px auto',
          maxWidth: '600px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          boxShadow: 'var(--shadow-md)'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'var(--accent-crimson-bg)',
            border: '1px solid var(--accent-crimson-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ff5c7a'
          }}>
            <AlertCircle size={24} />
          </div>

          <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
            Unable to Load View
          </h2>

          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.5' }}>
            An unexpected error occurred while rendering this section. You can reload this view or return to the home screen.
          </p>

          <button
            onClick={this.handleReset}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-crimson)',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: '700',
              fontSize: '0.88rem',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
          >
            <RotateCcw size={16} />
            <span>Reload View</span>
          </button>

          {this.state.error && (
            <details style={{
              width: '100%',
              textAlign: 'left',
              marginTop: '12px',
              padding: '10px 14px',
              background: 'var(--bg-primary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.78rem',
              color: 'var(--text-dim)'
            }}>
              <summary style={{ cursor: 'pointer', fontWeight: '600', color: 'var(--text-silver)' }}>
                Technical Details ({this.state.error.message || 'Error'})
              </summary>
              <pre style={{
                marginTop: '8px',
                padding: '8px',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-sm)',
                overflowX: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontFamily: 'monospace',
                fontSize: '0.74rem',
                color: '#ff7b72'
              }}>
                {this.state.error.stack || this.state.error.message}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
