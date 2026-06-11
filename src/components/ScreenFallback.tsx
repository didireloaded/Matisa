import { useRouter } from "@tanstack/react-router";

export function ScreenLoader() {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#C8521A] border-t-transparent" />
    </div>
  );
}

export function ScreenError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const router = useRouter();
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#C8521A]/15 text-[#E8A055]">
        !
      </div>
      <h2 className="font-display text-lg font-bold text-[#F5F0EA]">
        Something went wrong
      </h2>
      <p className="mt-1 max-w-xs text-sm text-[#8A7F74]">
        {error.message || "We couldn't load this screen. Please try again."}
      </p>
      <div className="mt-5 flex gap-2">
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="rounded-full bg-[#C8521A] px-4 py-2 text-sm font-semibold text-white"
        >
          Try again
        </button>
        <button
          onClick={() => router.navigate({ to: "/" })}
          className="rounded-full border border-[#2E2822] bg-[#1C1814] px-4 py-2 text-sm font-semibold text-[#F5F0EA]"
        >
          Go home
        </button>
      </div>
    </div>
  );
}

export function ScreenNotFound({ message = "We couldn't find that." }: { message?: string }) {
  const router = useRouter();
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <h2 className="font-display text-lg font-bold text-[#F5F0EA]">Not found</h2>
      <p className="mt-1 max-w-xs text-sm text-[#8A7F74]">{message}</p>
      <button
        onClick={() => router.navigate({ to: "/" })}
        className="mt-5 rounded-full bg-[#C8521A] px-4 py-2 text-sm font-semibold text-white"
      >
        Back home
      </button>
    </div>
  );
}
