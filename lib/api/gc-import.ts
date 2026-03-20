import { api, getAccessToken } from "@/lib/api";
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

  const token = getAccessToken();
  const res = await fetch(`${API_BASE_URL}/gcs/import/image`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: "include",
    body: formData,
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(err?.message ?? "Falha ao iniciar importação.");
  }

  const json = (await res.json()) as ApiResponse<ImportJobStarted>;
  if (!json.data) throw new Error("Resposta inesperada do servidor.");
  return json.data;
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

  const url = `${API_BASE_URL}${streamUrl}`;

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
