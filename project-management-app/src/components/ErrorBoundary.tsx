import React, { Component, ErrorInfo, ReactNode } from 'react';
import { FeatureFlag, isFeatureEnabled } from '@/lib/feature-flags';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundaryComponent extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="p-4 border border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800 rounded-lg">
          <h2 className="text-lg font-semibold text-red-800 dark:text-red-400">Something went wrong</h2>
          <p className="text-sm text-red-600 dark:text-red-300 mt-1">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            className="mt-2 px-3 py-1 text-sm bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 rounded hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper component that conditionally applies the ErrorBoundary based on feature flag
export function ErrorBoundary({ children, fallback, onError }: ErrorBoundaryProps): JSX.Element {
  const useErrorBoundaries = isFeatureEnabled(FeatureFlag.USE_ERROR_BOUNDARIES);

  if (useErrorBoundaries) {
    return (
      <ErrorBoundaryComponent fallback={fallback} onError={onError}>
        {children}
      </ErrorBoundaryComponent>
    );
  }

  return <>{children}</>;
}

// Component-specific error boundary for data fetching errors
export function QueryErrorBoundary({ 
  children, 
  fallback 
}: { 
  children: ReactNode;
  fallback?: ReactNode;
}): JSX.Element {
  const defaultFallback = (
    <div className="p-4 border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800 rounded-lg">
      <h2 className="text-lg font-semibold text-yellow-800 dark:text-yellow-400">Data loading error</h2>
      <p className="text-sm text-yellow-600 dark:text-yellow-300 mt-1">
        There was a problem loading the data. Please try again later.
      </p>
    </div>
  );

  return (
    <ErrorBoundary fallback={fallback || defaultFallback}>
      {children}
    </ErrorBoundary>
  );
}
