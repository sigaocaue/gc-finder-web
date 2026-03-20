"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Pencil,
} from "lucide-react";
import type { GcExtractedData } from "@/types/gc-import";

interface ExtractedDataReviewProps {
  dataList: GcExtractedData[];
  onSaveAll: (selected: GcExtractedData[]) => Promise<void>;
  onEdit: (index: number) => void;
  onReset: () => void;
  isSaving: boolean;
  savingProgress: string | null;
  saveError: string | null;
}

export function ExtractedDataReview({
  dataList,
  onSaveAll,
  onEdit,
  onReset,
  isSaving,
  savingProgress,
  saveError,
}: ExtractedDataReviewProps) {
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(
    () => new Set(dataList.map((_, i) => i))
  );

  const toggleSelection = useCallback((index: number) => {
    setSelectedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }, []);

  const handleSave = useCallback(() => {
    const selected = dataList.filter((_, i) => selectedIndices.has(i));
    if (selected.length === 0) return;
    void onSaveAll(selected);
  }, [dataList, selectedIndices, onSaveAll]);

  // Formata endereço resumido para exibição
  const formatAddress = (gc: GcExtractedData): string => {
    const parts = [gc.street];
    if (gc.number) parts[0] += `, ${gc.number}`;
    if (gc.city) parts.push(gc.city);
    if (gc.state) parts[parts.length - 1] += `/${gc.state}`;
    return parts.join(" - ");
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Dados extraídos — {dataList.length} GC(s) encontrado(s)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {dataList.map((gc, index) => (
            <div
              key={index}
              className="flex items-start gap-3 rounded-lg border p-4"
            >
              <Checkbox
                id={`gc-select-${index}`}
                checked={selectedIndices.has(index)}
                onCheckedChange={() => toggleSelection(index)}
                disabled={isSaving}
                aria-label={`Selecionar ${gc.name}`}
                className="mt-1"
              />
              <div className="min-w-0 flex-1">
                <label
                  htmlFor={`gc-select-${index}`}
                  className="cursor-pointer text-sm font-semibold"
                >
                  {gc.name}
                </label>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {formatAddress(gc)}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {gc.leaders.length} líder(es) · {gc.meetings.length}{" "}
                  encontro(s)
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onEdit(index)}
                disabled={isSaving}
                aria-label={`Editar ${gc.name}`}
              >
                <Pencil className="size-3.5" />
                Editar
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Erro de salvamento */}
      {saveError && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
          <p className="text-sm text-destructive">{saveError}</p>
        </div>
      )}

      {/* Rodapé */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onReset}
          disabled={isSaving}
        >
          <ArrowLeft className="size-4" />
          Voltar e reimportar
        </Button>

        <Button
          onClick={handleSave}
          disabled={selectedIndices.size === 0 || isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              {savingProgress ?? "Cadastrando..."}
            </>
          ) : (
            <>
              Cadastrar selecionados
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
