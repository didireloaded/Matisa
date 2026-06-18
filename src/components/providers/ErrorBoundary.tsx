/**
 * Enhanced error boundary with proper error logging
 * and user-friendly error display
 */

import { ReactNode, ErrorInfo } from "react";
import { ErrorBoundary as ReactErrorBoundary, FallbackProps } from "react-error-boundary";
import { AlertCircle } from "lucide-react";

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const ErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
  const isProduction = process.env.NODE_ENV === "production";

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-[#0F0D0B] p-6 text-center text-[#F5F0EA]">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
        <AlertCircle className="h-8 w-8 text-red-500" />
      </div>

      <h2 className="mb-2 text-2xl font-bold text-red-500">Something Went Wrong</h2>
      <p className="mb-6 text-sm text-[#8A7F74] max-w-md">
        We encountered an unexpected error. Please try again or contact support if the problem
        persists.
      </p>

      {!isProduction && (
        <details className="mb-6 w-full max-w-lg text-left">
          <summary className="cursor-pointer text-xs text-[#6B6159] hover:text-[#8A7F74]">
            Technical Details (Development Only)
          </summary>
          <pre className="mt-2 overflow-auto bg-[#1C1814] p-3 rounded text-xs text-red-400 border border-[#222222]">
            {(error as any).message}
            {(error as any).stack}
          </pre>
        </details>
      )}

      <div className="flex gap-3">
        <button
          onClick={resetErrorBoundary}
          className="rounded-full bg-[#C8521A] px-6 py-2 font-bold text-white transition hover:bg-[#E8A055]"
        >
          Try Again
        </button>
        <button
          onClick={() => (window.location.href = "/")}
          className="rounded-full border border-[#C8521A] px-6 py-2 font-bold text-[#C8521A] transition hover:bg-[#C8521A]/10"
        >
          Go Home
        </button>
      </div>
    </div>
  );
};

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<FallbackProps>;
  onError?: (error: any, info: React.ErrorInfo) => void;
}

export function AppErrorBoundary({
  children,
  fallback = ErrorFallback,
  onError,
}: ErrorBoundaryProps) {
  const handleError = (error: any, info: ErrorInfo) => {
    // Log to error tracking service (Sentry, LogRocket, etc.)
    console.error("ErrorBoundary caught:", error, info);

    // Send to external service in production
    if (process.env.NODE_ENV === "production") {
      // Example: Sentry.captureException(error, { contexts: info });
    }

    onError?.(error, info);
  };

  const handleReset = () => {
    // Clear app state if needed
    window.location.href = "/";
  };

  return (
    <ReactErrorBoundary FallbackComponent={fallback} onReset={handleReset} onError={handleError}>
      {children}
    </ReactErrorBoundary>
  );
}
