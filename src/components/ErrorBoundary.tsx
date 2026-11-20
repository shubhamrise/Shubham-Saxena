import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    let friendly = error.message || 'An unexpected application error occurred.';
    try {
      const parsed = JSON.parse(error.message);
      if (parsed && typeof parsed.error === 'string') {
        if (parsed.error.toLowerCase().includes('quota exceeded')) {
          friendly =
            'Daily database quota has been reached. Quota resets tomorrow, or the database plan can be upgraded in the Firebase console.';
        } else if (parsed.error.toLowerCase().includes('permission')) {
          friendly =
            'You do not have permission to access this cloud resource. Please sign in with an authorized account.';
        } else {
          friendly = parsed.error;
        }
      }
    } catch {
      // Plain error message
    }
    return { hasError: true, errorMessage: friendly };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('Application ErrorBoundary caught:', error, info.componentStack);
  }

  handleReload = () => {
    this.setState({ hasError: false, errorMessage: '' });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-6 shadow-lg text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-lg font-bold text-slate-900">Something went wrong</h2>
              <p className="text-xs text-slate-600 leading-relaxed">{this.state.errorMessage}</p>
            </div>
            <button
              type="button"
              onClick={this.handleReload}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#102a4e] hover:bg-[#163a6b] text-white text-xs font-semibold cursor-pointer transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reload Application</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
