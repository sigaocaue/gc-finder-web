"use client";

import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useGcImageImport } from "@/hooks/useGcImageImport";
import { ImageInputStep } from "@/components/admin/gc-import/ImageInputStep";
import { ExtractionProgressStep } from "@/components/admin/gc-import/ExtractionProgressStep";
import { ExtractedDataReview } from "@/components/admin/gc-import/ExtractedDataReview";
import { ExtractedDataForm } from "@/components/admin/gc-import/ExtractedDataForm";
import { ImportSuccessFeedback } from "@/components/admin/gc-import/ImportSuccessFeedback";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { GcExtractedData } from "@/types/gc-import";

export default function GcImportPage() {
  const {
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
  } = useGcImageImport();

  // Índice do GC em edição (null = exibir lista de review)
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Quando o resultado tem apenas 1 GC, vai direto para o formulário de edição
  const showDirectForm =
    step === "review" && extractedDataList.length === 1 && editingIndex === null;

  const handleEditSave = useCallback(
    async (data: GcExtractedData) => {
      if (editingIndex !== null) {
        // Atualiza os dados na lista e volta para o review
        extractedDataList[editingIndex] = data;
        setEditingIndex(null);
        return;
      }
      // Se é formulário direto (1 GC), salva diretamente
      await handleSave(data);
    },
    [editingIndex, extractedDataList, handleSave]
  );

  return (
    <div className="space-y-6">
      {/* Cabeçalho com breadcrumb */}
      <div className="flex items-center gap-3">
        <Link href="/admin/gcs">
          <Button type="button" variant="ghost" size="icon" aria-label="Voltar">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div>
          <p className="text-xs text-muted-foreground">
            Admin &gt; GCs &gt; Importar por imagem
          </p>
          <h1 className="text-xl font-bold sm:text-2xl">
            Importar GC por imagem
          </h1>
        </div>
      </div>

      {/* Steps com animação de fade */}
      <AnimatePresence mode="wait">
        {step === "input" && (
          <motion.div
            key="input"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <ImageInputStep
              onExtract={handleExtract}
              isStartingJob={isStartingJob}
              startError={startError}
              ocrService={ocrService}
              onOcrServiceChange={setOcrService}
            />
          </motion.div>
        )}

        {step === "extracting" && (
          <motion.div
            key="extracting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <ExtractionProgressStep
              message={extractionProgress}
              onCancel={resetImport}
            />
          </motion.div>
        )}

        {step === "review" && editingIndex !== null && (
          <motion.div
            key={`edit-${editingIndex}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <ExtractedDataForm
              data={extractedDataList[editingIndex]}
              onSave={handleEditSave}
              onBack={() => setEditingIndex(null)}
              backLabel="Voltar para a lista"
              isSaving={false}
              saveError={null}
            />
          </motion.div>
        )}

        {step === "review" && editingIndex === null && !showDirectForm && (
          <motion.div
            key="review-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <ExtractedDataReview
              dataList={extractedDataList}
              onSaveAll={handleSaveAll}
              onEdit={setEditingIndex}
              onReset={resetImport}
              isSaving={isSaving}
              savingProgress={savingProgress}
              saveError={saveError}
            />
          </motion.div>
        )}

        {/* Se apenas 1 GC extraído, mostra formulário direto */}
        {showDirectForm && (
          <motion.div
            key="review-single"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <ExtractedDataForm
              data={extractedDataList[0]}
              onSave={handleSave}
              onBack={resetImport}
              backLabel="Voltar e reimportar"
              isSaving={isSaving}
              saveError={saveError}
            />
          </motion.div>
        )}

        {step === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <ImportSuccessFeedback
              savedNames={extractedDataList.map((gc) => gc.name)}
              savedGcIds={savedGcIds}
              onReset={resetImport}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
