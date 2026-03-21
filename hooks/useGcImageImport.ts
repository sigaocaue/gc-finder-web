"use client";

import { useCallback, useRef, useState } from "react";
import type {
  GcExtractedData,
  ImportStep,
  OcrServiceName,
} from "@/types/gc-import";
import {
  startGcImageImport,
  saveExtractedGc,
  createSseConnection,
} from "@/lib/api/gc-import";

export function useGcImageImport() {
  const [step, setStep] = useState<ImportStep>("input");
  const [ocrService, setOcrService] = useState<OcrServiceName>("easyocr");
  const [extractionProgress, setExtractionProgress] = useState<string | null>(
    null
  );
  const [extractedDataList, setExtractedDataList] = useState<
    GcExtractedData[]
  >([]);
  const [isStartingJob, setIsStartingJob] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedGcIds, setSavedGcIds] = useState<string[]>([]);
  const [savingProgress, setSavingProgress] = useState<string | null>(null);

  // Referência para o AbortController do SSE
  const sseControllerRef = useRef<AbortController | null>(null);

  // Inicia a extração de dados das imagens
  const handleExtract = useCallback(
    async (images: File[], urls: string[]) => {
      setIsStartingJob(true);
      setStartError(null);

      try {
        const job = await startGcImageImport(images, urls, ocrService);

        setStep("extracting");
        setExtractionProgress("Iniciando extração...");

        // Conecta ao SSE para acompanhar o progresso
        const controller = createSseConnection(job.stream_url, {
          onProgress: (progress) => {
            setExtractionProgress(progress);
          },
          onDone: (data) => {
            setExtractedDataList(data);
            setStep("review");
            sseControllerRef.current = null;
          },
          onError: (message) => {
            setStartError(message);
            setStep("input");
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
    },
    [ocrService]
  );

  // Salva um único GC extraído (editado ou não) no banco
  const handleSave = useCallback(async (data: GcExtractedData) => {
    setIsSaving(true);
    setSaveError(null);

    try {
      const result = await saveExtractedGc(data);
      setSavedGcIds((prev) => [...prev, result.id]);
      setStep("success");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao cadastrar GC.";
      setSaveError(message);
    } finally {
      setIsSaving(false);
    }
  }, []);

  // Salva todos os GCs selecionados sequencialmente
  const handleSaveAll = useCallback(
    async (selectedData: GcExtractedData[]) => {
      setIsSaving(true);
      setSaveError(null);
      const ids: string[] = [];

      try {
        for (let i = 0; i < selectedData.length; i++) {
          setSavingProgress(
            `Salvando ${i + 1} de ${selectedData.length}...`
          );
          const result = await saveExtractedGc(selectedData[i]);
          ids.push(result.id);
        }

        setSavedGcIds(ids);
        setStep("success");
      } catch (err) {
        // Salva os IDs que já foram salvos com sucesso
        setSavedGcIds(ids);
        const message =
          err instanceof Error ? err.message : "Erro ao cadastrar GC.";
        setSaveError(message);
      } finally {
        setIsSaving(false);
        setSavingProgress(null);
      }
    },
    []
  );

  // Reseta o estado para o step inicial
  const resetImport = useCallback(() => {
    // Fecha a conexão SSE se estiver aberta
    if (sseControllerRef.current) {
      sseControllerRef.current.abort();
      sseControllerRef.current = null;
    }

    setStep("input");
    setOcrService("easyocr");
    setExtractionProgress(null);
    setExtractedDataList([]);
    setIsStartingJob(false);
    setIsSaving(false);
    setStartError(null);
    setSaveError(null);
    setSavedGcIds([]);
    setSavingProgress(null);
  }, []);

  return {
    step,
    ocrService,
    setOcrService,
    extractionProgress,
    extractedDataList,
    isStartingJob,
    isSaving,
    savingProgress,
    startError,
    saveError,
    savedGcIds,
    handleExtract,
    handleSave,
    handleSaveAll,
    resetImport,
  };
}
