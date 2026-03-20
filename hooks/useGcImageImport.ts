"use client";

import { useCallback, useRef, useState } from "react";
import type { GcExtractedData, ImportStep } from "@/types/gc-import";
import {
  startGcImageImport,
  saveExtractedGc,
  getJobStatus,
  createSseConnection,
} from "@/lib/api/gc-import";

export function useGcImageImport() {
  const [step, setStep] = useState<ImportStep>("input");
  const [extractionMessage, setExtractionMessage] = useState<string | null>(
    null
  );
  const [extractedData, setExtractedData] = useState<GcExtractedData | null>(
    null
  );
  const [isStartingJob, setIsStartingJob] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedGcId, setSavedGcId] = useState<string | null>(null);

  // Referência para o AbortController do SSE
  const sseControllerRef = useRef<AbortController | null>(null);

  // Inicia a extração de dados da imagem
  const handleExtract = useCallback(async (input: File | string) => {
    setIsStartingJob(true);
    setStartError(null);

    try {
      const job = await startGcImageImport(input);

      setStep("extracting");
      setExtractionMessage("Iniciando extração...");

      // Conecta ao SSE para acompanhar o progresso
      const controller = createSseConnection(job.events_url, {
        onStatus: (message) => {
          setExtractionMessage(message);
        },
        onDone: (data) => {
          setExtractedData(data);
          setStep("review");
          sseControllerRef.current = null;
        },
        onError: (message) => {
          // Tenta fallback via polling antes de reportar erro
          attemptFallback(job.job_id, message);
          sseControllerRef.current = null;
        },
      });

      sseControllerRef.current = controller;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao iniciar extração.";
      setStartError(message);
    } finally {
      setIsStartingJob(false);
    }
  }, []);

  // Fallback: consulta status do job quando o SSE falha
  const attemptFallback = useCallback(
    async (jobId: string, originalError: string) => {
      try {
        const status = await getJobStatus(jobId);

        if (status.status === "done" && status.result) {
          setExtractedData(status.result);
          setStep("review");
          return;
        }

        if (status.status === "error") {
          setStartError(status.error_message ?? originalError);
          setStep("input");
          return;
        }

        // Ainda processando — exibe o erro original
        setStartError(originalError);
        setStep("input");
      } catch {
        setStartError(originalError);
        setStep("input");
      }
    },
    []
  );

  // Salva os dados extraídos (editados ou não) no banco
  const handleSave = useCallback(async (data: GcExtractedData) => {
    setIsSaving(true);
    setSaveError(null);

    try {
      const result = await saveExtractedGc(data);
      setSavedGcId(result.id);
      setStep("success");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao cadastrar GC.";
      setSaveError(message);
    } finally {
      setIsSaving(false);
    }
  }, []);

  // Reseta o estado para o step inicial
  const resetImport = useCallback(() => {
    // Fecha a conexão SSE se estiver aberta
    if (sseControllerRef.current) {
      sseControllerRef.current.abort();
      sseControllerRef.current = null;
    }

    setStep("input");
    setExtractionMessage(null);
    setExtractedData(null);
    setIsStartingJob(false);
    setIsSaving(false);
    setStartError(null);
    setSaveError(null);
    setSavedGcId(null);
  }, []);

  return {
    step,
    extractionMessage,
    extractedData,
    isStartingJob,
    isSaving,
    startError,
    saveError,
    savedGcId,
    handleExtract,
    handleSave,
    resetImport,
  };
}
