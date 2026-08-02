import { Suspense } from "react";
import { BrowserRouter } from "react-router-dom";
import { ErrorBoundary, type FallbackProps } from "react-error-boundary";
import { Analytics } from "@vercel/analytics/react";
import { Loader2 } from "lucide-react";
import { Providers } from "./components/providers";
import { AppRoutes } from "./app/routes";

function PageLoader() {
  return (
    <div
      role="status"
      aria-label="Loading Matisa"
      className="flex min-h-[50dvh] items-center justify-center"
    >
      <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
    </div>
  );
}

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-[var(--color-background)] p-6 text-center text-white">
      <h1 className="text-xl font-bold">Matisa could not open this screen</h1>
      <p className="mt-3 text-sm text-[var(--color-text-muted)]">
        {error instanceof Error ? error.message : "Something went wrong"}
      </p>
      <button
        type="button"
        onClick={resetErrorBoundary}
        className="mt-6 min-h-11 rounded-full bg-[var(--color-primary)] px-6 font-semibold text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        Try again
      </button>
    </main>
  );
}

export default function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Providers>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <AppRoutes />
          </Suspense>
        </BrowserRouter>
      </Providers>
      <Analytics />
    </ErrorBoundary>
  );
}
