import { api, httpClient, getAccessToken } from "@/lib/api";
import type { ApiResponse } from "@/types";
import type {
  ImportJobStarted,
  GcExtractedData,
  GcSavedResponse,
  OcrServiceName,
  SseStatusEvent,
} from "@/types/gc-import";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

// URL base sem o path /api/v1, para endpoints cujo path já vem completo do backend
const API_ORIGIN = API_BASE_URL.replace(/\/api\/v\d+\/?$/, "");

// Dispara o job de extração e retorna job_id + stream_url
export async function startGcImageImport(
  images: File[],
  imageUrls: string[],
  ocrService: OcrServiceName
): Promise<ImportJobStarted> {
  const formData = new FormData();

  // Múltiplos arquivos com o mesmo nome de campo
  images.forEach((file) => formData.append("images", file));

  // Múltiplas URLs com o mesmo nome de campo
  imageUrls.forEach((url) => formData.append("images_urls", url));

  formData.append("ocr_service", ocrService);

  // Usa o httpClient (axios) para passar pelo interceptor de auth/refresh
  const response = await httpClient.post<ApiResponse<ImportJobStarted>>(
    "/gcs/import/image",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
        "X-Authenticated": "true",
      },
    }
  );

  if (!response.data.data) throw new Error("Resposta inesperada do servidor.");
  return response.data.data;
}

// Salva UM GC (extraído ou editado) no banco — chamar uma vez por GC
export async function saveExtractedGc(
  data: GcExtractedData
): Promise<GcSavedResponse> {
  const response = await api<ApiResponse<GcSavedResponse>>(
    "/gcs/import/save",
    {
      method: "POST",
      body: JSON.stringify(data),
      authenticated: true,
    }
  );
  if (!response.data) throw new Error("Falha ao salvar GC.");
  return response.data;
}

// Cria conexão SSE usando fetch + ReadableStream para suportar Authorization header
export function createSseConnection(
  streamUrl: string,
  handlers: {
    onProgress: (progress: string) => void;
    onDone: (data: GcExtractedData[]) => void;
    onError: (message: string) => void;
  }
): AbortController {
  const controller = new AbortController();
  const token = getAccessToken();

  // stream_url já vem com /api/v1/... do backend, usar apenas a origin
  const url = `${API_ORIGIN}${streamUrl}`;

  fetch(url, {
    headers: {
      Accept: "text/event-stream",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
    signal: controller.signal,
  })
    .then(async (response) => {
      if (!response.ok || !response.body) {
        handlers.onError("Falha ao conectar ao stream de eventos.");
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");

        // Mantém a última linha incompleta no buffer
        buffer = lines.pop() ?? "";

        let currentEvent = "";

        for (const line of lines) {
          if (line.startsWith("event: ")) {
            currentEvent = line.slice(7).trim();
          } else if (line.startsWith("data: ") && currentEvent) {
            const jsonStr = line.slice(6);
            try {
              // Ignora heartbeats silenciosamente
              if (currentEvent === "heartbeat") {
                currentEvent = "";
                continue;
              }

              if (currentEvent === "status") {
                const parsed = JSON.parse(jsonStr) as SseStatusEvent;

                if (parsed.status === "done" && parsed.result) {
                  handlers.onDone(parsed.result);
                  controller.abort();
                  return;
                }

                if (parsed.status === "failed") {
                  handlers.onError(parsed.error ?? "Erro desconhecido na extração.");
                  controller.abort();
                  return;
                }

                // Progresso (processing ou pending)
                if (parsed.progress) {
                  handlers.onProgress(parsed.progress);
                }
              }
            } catch {
              // Ignora linhas de dados inválidas
            }
            currentEvent = "";
          } else if (line.trim() === "") {
            currentEvent = "";
          }
        }
      }
    })
    .catch((err: Error) => {
      if (err.name !== "AbortError") {
        handlers.onError("Conexão com o servidor perdida.");
      }
    });

  return controller;
}
