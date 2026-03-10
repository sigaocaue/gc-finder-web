import axios, { type AxiosRequestConfig } from "axios";

const httpClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Armazena o access token em memória (nunca em localStorage)
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

// Injeta o Authorization header quando autenticado
httpClient.interceptors.request.use((config) => {
  if (config.headers.get("X-Authenticated") && accessToken) {
    config.headers.set("Authorization", `Bearer ${accessToken}`);
  }
  config.headers.delete("X-Authenticated");
  return config;
});

// Interceptor de resposta: renova o token ao receber 401
httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retried?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retried) {
      originalRequest._retried = true;
      const refreshed = await refreshAccessToken();

      if (refreshed && originalRequest.headers) {
        (originalRequest.headers as Record<string, string>)["Authorization"] =
          `Bearer ${accessToken}`;
        return httpClient(originalRequest);
      }
    }

    const message =
      (error.response?.data as { message?: string })?.message ??
      "Erro na requisição";
    const status = error.response?.status ?? 500;

    return Promise.reject(new ApiError(message, status));
  }
);

function getRefreshTokenFromCookie(): string | null {
  const match = document.cookie.match(/(?:^|; )refresh_token=([^;]*)/);
  return match ? match[1] : null;
}

async function refreshAccessToken(): Promise<boolean> {
  try {
    const refreshToken = getRefreshTokenFromCookie();
    if (!refreshToken) return false;

    const { data } = await axios.post<{ data: { access_token: string } | null }>(
      `${httpClient.defaults.baseURL}/auth/refresh`,
      { refresh_token: refreshToken },
      { withCredentials: true }
    );

    if (!data.data) return false;

    accessToken = data.data.access_token;
    return true;
  } catch {
    return false;
  }
}

interface ApiOptions extends AxiosRequestConfig {
  authenticated?: boolean;
  body?: string;
}

// Wrapper que mantém a mesma interface para os consumidores
export async function api<T>(
  path: string,
  options: ApiOptions = {}
): Promise<T> {
  const { authenticated = false, ...config } = options;

  if (authenticated) {
    config.headers = {
      ...config.headers,
      "X-Authenticated": "true",
    };
  }

  // Converte body (padrão fetch) para data (padrão axios)
  if ("body" in config) {
    const { body, ...rest } = config as ApiOptions & { body?: string };
    const response = await httpClient.request<T>({
      url: path,
      data: body ? JSON.parse(body) : undefined,
      ...rest,
    });
    return response.data;
  }

  const response = await httpClient.request<T>({ url: path, ...config });
  return response.data;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}
