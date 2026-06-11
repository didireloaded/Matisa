import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { ScreenError, ScreenLoader, ScreenNotFound } from "./components/ScreenFallback";

export const getRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        staleTime: 30_000,
        retry: 1,
      },
    },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultPendingComponent: ScreenLoader,
    defaultErrorComponent: ScreenError,
    defaultNotFoundComponent: () => <ScreenNotFound />,
  });

  return router;
};
