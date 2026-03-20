import { api, getAccessToken } from "@/lib/api";
import type { ApiResponse } from "@/types";
import type {
  ImportJobStarted,
  ImportJobStatus,
  GcExtractedData,
  GcSavedResponse,
} from "@/types/gc-import";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

// Dispara o job de extração e retorna job_id + urls
export async function startGcImageImport(
  input: File | string
): Promise<ImportJobStarted> {
  if (typeof input === "string") {
    // Envio por URL
    const response = await api<ApiResponse<ImportJobStarted>>(
      "/gcs/import/image",
      {
        method: "POST",
        body: JSON.stringify({ image_url: input }),
        authenticated: true,
      }
    );
    if (!response.data) throw new Error("Falha ao iniciar importação.");
    return response.data;
  }

  // Envio por arquivo — usa FormData
  const formData = new FormData();
  formData.append("image", input);

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

// Salva os dados (extraídos ou editados) no banco
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

// Consulta o status atual do job (fallback de reconexão)
export async function getJobStatus(
  jobId: string
): Promise<ImportJobStatus> {
  const response = await api<ApiResponse<ImportJobStatus>>(
    `/gcs/import/image/${jobId}`,
    { authenticated: true }
  );
  if (!response.data) throw new Error("Falha ao consultar status do job.");
  return response.data;
}

// Cria conexão SSE usando fetch + ReadableStream para suportar Authorization header
export function createSseConnection(
  eventsUrl: string,
  handlers: {
    onStatus: (message: string) => void;
    onDone: (data: GcExtractedData) => void;
    onError: (message: string) => void;
  }
): AbortController {
  const controller = new AbortController();
  const token = getAccessToken();

  const url = `${API_BASE_URL}${eventsUrl}`;

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
              if (currentEvent === "status") {
                const parsed = JSON.parse(jsonStr) as { message: string };
                handlers.onStatus(parsed.message);
              } else if (currentEvent === "done") {
                const parsed = JSON.parse(jsonStr) as GcExtractedData;
                handlers.onDone(parsed);
                controller.abort();
                return;
              } else if (currentEvent === "error") {
                const parsed = JSON.parse(jsonStr) as { message: string };
                handlers.onError(parsed.message);
                controller.abort();
                return;
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
