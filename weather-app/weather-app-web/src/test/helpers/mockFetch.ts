export type MockFetchRoute = {
  url: string | RegExp | ((value: string) => boolean);
  response?: unknown;
  status?: number;
  ok?: boolean;
  headers?: HeadersInit;
  error?: Error;
  delay?: number;
};

export type MockFetchCall = {
  url: string;
  init?: RequestInit;
};

export type MockFetchResult = {
  fetch: typeof fetch;
  calls: MockFetchCall[];
  reset: () => void;
};

export type DeferredResponse = {
  promise: Promise<Response>;
  resolve: (value: Response) => void;
  reject: (reason?: unknown) => void;
};

export function createDeferredResponse(): DeferredResponse {
  let resolve!: (value: Response) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<Response>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

const normalizeUrl = (input: RequestInfo | URL): string => {
  if (typeof input === 'string') return input;
  if (input instanceof URL) return input.toString();
  return String(input);
};

export function mockFetch(routes: MockFetchRoute[] = []): MockFetchResult {
  const calls: MockFetchCall[] = [];

  const fetchMock: typeof fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    const url = normalizeUrl(input);
    calls.push({ url, init });

    const route = routes.find((candidate) => {
      if (typeof candidate.url === 'function') {
        return candidate.url(url);
      }
      if (candidate.url instanceof RegExp) {
        return candidate.url.test(url);
      }
      return candidate.url === url;
    });

    if (!route) {
      return Promise.reject(new Error(`No mock for URL: ${url}`));
    }

    if (route.error) {
      return Promise.reject(route.error);
    }

    const status = route.status ?? 200;
    const ok = route.ok ?? ((status >= 200 && status < 300));
    const delay = route.delay ?? 0;

    const buildResponse = (payload: unknown) => {
      const body = typeof payload === 'string' ? payload : JSON.stringify(payload);
      return new Response(body, {
        status,
        statusText: ok ? 'OK' : 'Error',
        headers: route.headers ?? { 'Content-Type': 'application/json' },
      });
    };

    return new Promise<Response>((resolve, reject) => {
      const signal = init?.signal;

      if (signal?.aborted) {
        reject(new DOMException('The operation was aborted', 'AbortError'));
        return;
      }

      const abortHandler = () => {
        clearTimeout(timerId);
        reject(new DOMException('The operation was aborted', 'AbortError'));
      };

      signal?.addEventListener('abort', abortHandler, { once: true });

      const timerId = setTimeout(() => {
        signal?.removeEventListener('abort', abortHandler);
        try {
          const payload = route.response;
          if (payload instanceof Promise) {
            void payload.then((value) => resolve(buildResponse(value))).catch(reject);
            return;
          }
          resolve(buildResponse(payload));
        } catch (error) {
          reject(error);
        }
      }, delay);
    });
  };

  return {
    fetch: fetchMock,
    calls,
    reset: () => {
      calls.length = 0;
    },
  };
}
