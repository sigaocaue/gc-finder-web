const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

// Armazena o access token em memória (nunca em localStorage)
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

interface FetchOptions extends RequestInit {
  authenticated?: boolean;
}

// Wrapper do fetch com suporte a autenticação e refresh automático
export async function api<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { authenticated = false, headers: customHeaders, ...rest } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(customHeaders as Record<string, string>),
  };

  if (authenticated && accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  let response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers,
    credentials: "include",
  });

  // Tenta renovar o token se receber 401
  if (response.status === 401 && authenticated) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      headers["Authorization"] = `Bearer ${accessToken}`;
      response = await fetch(`${API_URL}${path}`, {
        ...rest,
        headers,
        credentials: "include",
      });
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new ApiError(
      (error as { message?: string }).message ?? "Erro na requisição",
      response.status
    );
  }

  return response.json() as Promise<T>;
}

async function refreshAccessToken(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) return false;

    const data = (await response.json()) as { accessToken: string };
    accessToken = data.accessToken;
    return true;
  } catch {
    return false;
  }
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
