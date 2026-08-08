"use client";

/**
 * react-router-dom → Next App Router compatibility layer.
 *
 * 77 files in this codebase import routing primitives from react-router-dom.
 * Rewriting each call site by hand during the migration would be slow and a
 * rich source of subtle breakage, so instead every one of those imports is
 * repointed at this module, which reimplements the same API surface on top of
 * next/navigation and next/link.
 *
 * This is deliberately a transitional layer. Call sites can be migrated to
 * native Next APIs incrementally afterwards, and this file deleted once the
 * last one is gone. What it does NOT provide: <Routes>, <Route>, <Outlet> and
 * the data-router APIs — those are structural and are replaced by the app/
 * directory itself.
 */

import NextLink from "next/link";
import {
  useParams as useNextParams,
  usePathname,
  useRouter,
  useSearchParams as useNextSearchParams,
} from "next/navigation";
import { forwardRef, useEffect, useMemo } from "react";

/* -------------------------------------------------------------------------- */
/* Navigation                                                                 */
/* -------------------------------------------------------------------------- */

export interface NavigateOptions {
  replace?: boolean;
  /** react-router's location state. Next has no equivalent; see below. */
  state?: unknown;
}

export type NavigateFunction = {
  (to: string, options?: NavigateOptions): void;
  (delta: number): void;
};

/**
 * Drop-in for react-router's useNavigate.
 *
 * `state` has no Next equivalent — the App Router has no location state — so
 * it is stashed in sessionStorage under a well-known key and read back by
 * useLocation(). That keeps the handful of `navigate(path, { state })` call
 * sites working without rewriting them; it is intentionally simple and only
 * survives one navigation.
 */
export function useNavigate(): NavigateFunction {
  const router = useRouter();

  return useMemo(() => {
    const navigate = ((to: string | number, options?: NavigateOptions) => {
      if (typeof to === "number") {
        if (to < 0) router.back();
        else router.forward();
        return;
      }
      if (options?.state !== undefined) {
        try {
          sessionStorage.setItem(
            LOCATION_STATE_KEY,
            JSON.stringify({ path: to, state: options.state })
          );
        } catch {
          /* private mode — state is simply unavailable on arrival */
        }
      }
      if (options?.replace) router.replace(to);
      else router.push(to);
    }) as NavigateFunction;
    return navigate;
  }, [router]);
}

const LOCATION_STATE_KEY = "aparte_nav_state";

/* -------------------------------------------------------------------------- */
/* Location                                                                   */
/* -------------------------------------------------------------------------- */

export interface Location {
  pathname: string;
  search: string;
  hash: string;
  /**
   * Deliberately `any`, matching react-router's own typing. Call sites read
   * ad-hoc shapes off it (location.state?.bookingContext etc.); typing it as
   * `unknown` would force a cast at every one of them, which defeats the
   * point of a drop-in shim. Tighten per call site when they migrate to
   * native Next APIs.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  state: any;
  key: string;
}

export function useLocation(): Location {
  const pathname = usePathname() ?? "/";
  const searchParams = useNextSearchParams();
  const search = searchParams?.toString() ?? "";

  return useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let state: any = null;
    if (typeof window !== "undefined") {
      try {
        const raw = sessionStorage.getItem(LOCATION_STATE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as { path: string; state: unknown };
          if (parsed.path === pathname) state = parsed.state;
        }
      } catch {
        state = null;
      }
    }
    return {
      pathname,
      search: search ? `?${search}` : "",
      hash: typeof window !== "undefined" ? window.location.hash : "",
      state,
      key: `${pathname}?${search}`,
    };
  }, [pathname, search]);
}

/* -------------------------------------------------------------------------- */
/* Params                                                                     */
/* -------------------------------------------------------------------------- */

export function useParams<
  T extends Record<string, string | undefined> = Record<
    string,
    string | undefined
  >,
>(): T {
  return (useNextParams() ?? {}) as T;
}

/**
 * react-router returns [params, setParams]; Next returns a read-only object.
 * The setter is reimplemented as a router.replace with the new query string,
 * which is what every call site in this codebase was doing anyway.
 */
export function useSearchParams(): [
  URLSearchParams,
  (
    next: URLSearchParams | Record<string, string> | ((prev: URLSearchParams) => URLSearchParams),
    options?: { replace?: boolean }
  ) => void,
] {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const current = useNextSearchParams();

  const params = useMemo(
    () => new URLSearchParams(current?.toString() ?? ""),
    [current]
  );

  const setSearchParams = useMemo(
    () =>
      (
        next:
          | URLSearchParams
          | Record<string, string>
          | ((prev: URLSearchParams) => URLSearchParams),
        options?: { replace?: boolean }
      ) => {
        const resolved =
          typeof next === "function"
            ? next(new URLSearchParams(params))
            : next instanceof URLSearchParams
              ? next
              : new URLSearchParams(next);
        const qs = resolved.toString();
        const url = qs ? `${pathname}?${qs}` : pathname;
        if (options?.replace === false) router.push(url);
        else router.replace(url);
      },
    [params, pathname, router]
  );

  return [params, setSearchParams];
}

/* -------------------------------------------------------------------------- */
/* Link                                                                       */
/* -------------------------------------------------------------------------- */

export interface LinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  to: string;
  replace?: boolean;
  state?: unknown;
  prefetch?: boolean;
}

/** react-router <Link to=…> mapped onto next/link. */
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { to, replace, state, prefetch, children, ...rest },
  ref
) {
  return (
    <NextLink
      ref={ref}
      href={to}
      replace={replace}
      prefetch={prefetch}
      onClick={(event) => {
        if (state !== undefined) {
          try {
            sessionStorage.setItem(
              LOCATION_STATE_KEY,
              JSON.stringify({ path: to, state })
            );
          } catch {
            /* ignore */
          }
        }
        rest.onClick?.(event);
      }}
      {...rest}
    >
      {children}
    </NextLink>
  );
});

/** Alias — several files import NavLink for styling-aware links. */
export const NavLink = Link;

/* -------------------------------------------------------------------------- */
/* Declarative redirect                                                       */
/* -------------------------------------------------------------------------- */

export function Navigate({
  to,
  replace = true,
}: {
  to: string;
  replace?: boolean;
}): null {
  const router = useRouter();
  useEffect(() => {
    if (replace) router.replace(to);
    else router.push(to);
  }, [router, to, replace]);
  return null;
}

/** Present so `useNavigation`-style imports fail loudly rather than silently. */
export function useMatch(_pattern: string | { path: string }): null {
  throw new Error(
    "useMatch has no Next equivalent — restructure the route under app/ instead."
  );
}
