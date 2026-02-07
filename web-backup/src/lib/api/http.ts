// HTTP utilities matching Expo app structure

export class HttpError extends Error {
  response?: Response;
  status?: number;

  constructor(message: string, response?: Response) {
    super(message);
    this.name = 'HttpError';
    this.response = response;
    this.status = response?.status;
  }
}

export interface FetchJsonOptions {
  timeoutMs?: number;
  headers?: Record<string, string>;
  method?: string;
  body?: string;
}

const DEFAULT_TIMEOUT_MS = 10000;

export async function fetchJson<T>(
  url: string,
  options: FetchJsonOptions = {}
): Promise<T> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, headers, method = 'GET', body } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Accept': 'application/json',
        ...headers,
      },
      body,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new HttpError(`HTTP ${response.status}: ${response.statusText}`, response);
    }

    return await response.json() as T;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    if (error instanceof Error && error.name === 'AbortError') {
      throw new HttpError(`Request timeout after ${timeoutMs}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
