import { createFileRoute } from "@tanstack/react-router";
import { MainLayout } from "@/components/layout/MainLayout";
import { ClientOnly } from "@/components/ClientOnly";
import { ScreenLoader } from "@/components/ScreenFallback";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  return (
    <ClientOnly fallback={<ScreenLoader />}>
      <MainLayout />
    </ClientOnly>
  );
}
