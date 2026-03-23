'use client'

import { useCallback, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGcImageImport } from '@/hooks/useGcImageImport'
import { ImageInputStep } from '@/components/admin/gc-import/ImageInputStep'
import { ExtractionProgressStep } from '@/components/admin/gc-import/ExtractionProgressStep'
import { ExtractedDataReview } from '@/components/admin/gc-import/ExtractedDataReview'
import { ExtractedDataForm } from '@/components/admin/gc-import/ExtractedDataForm'
import { ImportSuccessFeedback } from '@/components/admin/gc-import/ImportSuccessFeedback'
import type { GcExtractedData } from '@/types/gc-import'
import { AdminSidebar } from '@/components/admin/admin-sidebar'

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
  } = useGcImageImport()

  // Índice do GC em edição (null = exibir lista de review)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  // Quando o resultado tem apenas 1 GC, vai direto para o formulário de edição
  const showDirectForm =
    step === 'review' && extractedDataList.length === 1 && editingIndex === null

  const handleEditSave = useCallback(
    async (data: GcExtractedData) => {
      if (editingIndex !== null) {
        // Atualiza os dados na lista e volta para o review
        extractedDataList[editingIndex] = data
        setEditingIndex(null)
        return
      }
      // Se é formulário direto (1 GC), salva diretamente
      await handleSave(data)
    },
    [editingIndex, extractedDataList, handleSave],
  )

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex items-center justify-center flex-1 p-4 pt-18 lg:p-8 lg:pt-8">
        <div>
          {/* Steps com animação de fade */}
          <AnimatePresence mode="wait">
            {step === 'input' && (
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

            {step === 'extracting' && (
              <motion.div
                key="extracting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <ExtractionProgressStep message={extractionProgress} onCancel={resetImport} />
              </motion.div>
            )}

            {step === 'review' && editingIndex !== null && (
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

            {step === 'review' && editingIndex === null && !showDirectForm && (
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

            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <ImportSuccessFeedback
                  savedNames={extractedDataList.map(gc => gc.name)}
                  savedGcIds={savedGcIds}
                  onReset={resetImport}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
