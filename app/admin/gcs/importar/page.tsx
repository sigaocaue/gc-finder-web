"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useGcImageImport } from "@/hooks/useGcImageImport";
import { ImageInputStep } from "@/components/admin/gc-import/ImageInputStep";
import { ExtractionProgressStep } from "@/components/admin/gc-import/ExtractionProgressStep";
import { ExtractedDataForm } from "@/components/admin/gc-import/ExtractedDataForm";
import { ImportSuccessFeedback } from "@/components/admin/gc-import/ImportSuccessFeedback";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function GcImportPage() {
  const {
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
  } = useGcImageImport();

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
              message={extractionMessage}
              onCancel={resetImport}
            />
          </motion.div>
        )}

        {step === "review" && extractedData && (
          <motion.div
            key="review"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <ExtractedDataForm
              data={extractedData}
              onSave={handleSave}
              onReset={resetImport}
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
              gcName={extractedData?.name ?? null}
              savedGcId={savedGcId}
              onReset={resetImport}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
