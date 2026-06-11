// Compatibility shim that maps the subset of react-router-dom APIs used by
// the ported screens onto TanStack Router primitives.
import {
  Link as TSLink,
  Outlet as TSOutlet,
  useNavigate as useTSNavigate,
  useParams as useTSParams,
  useRouterState,
  useSearch,
} from "@tanstack/react-router";
import { forwardRef, type AnchorHTMLAttributes, type ReactNode } from "react";

export const Outlet = TSOutlet;

export function useNavigate() {
  const navigate = useTSNavigate();
  return (to: string | number, opts?: { replace?: boolean }) => {
    if (typeof to === "number") {
      if (typeof window !== "undefined") window.history.go(to);
      return;
    }
    const [pathname, search] = to.split("?");
    const searchObj = search
      ? Object.fromEntries(new URLSearchParams(search).entries())
      : undefined;
    navigate({
      to: pathname,
      search: searchObj as never,
      replace: opts?.replace,
    });
  };
}

export function useParams<T extends Record<string, string> = Record<string, string>>(): T {
  return (useTSParams as (opts: { strict: false }) => unknown)({ strict: false }) as T;
}

export function useLocation() {
  const location = useRouterState({ select: (s) => s.location });
  return {
    pathname: location.pathname,
    search: location.searchStr ?? "",
    hash: location.hash ?? "",
    state: null,
    key: location.pathname,
  };
}

export function useSearchParams(): [
  URLSearchParams,
  (next: URLSearchParams | Record<string, string>) => void,
] {
  const search = (useSearch({ strict: false }) ?? {}) as Record<string, unknown>;
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(search)) {
    if (v !== undefined && v !== null) params.set(k, String(v));
  }
  const navigate = useTSNavigate();
  const setSearchParams = (next: URLSearchParams | Record<string, string>) => {
    const obj =
      next instanceof URLSearchParams
        ? Object.fromEntries(next.entries())
        : next;
    navigate({ search: obj as never, replace: true });
  };
  return [params, setSearchParams];
}

type LinkCompatProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  to: string;
  replace?: boolean;
  children?: ReactNode;
};

export const Link = forwardRef<HTMLAnchorElement, LinkCompatProps>(function Link(
  { to, replace, ...rest },
  ref,
) {
  return (
    <TSLink
      ref={ref}
      to={to}
      replace={replace}
      {...(rest as Record<string, unknown>)}
    />
  );
});

export function BrowserRouter({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
export function Routes({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
export function Route(_props: unknown): null {
  return null;
}
