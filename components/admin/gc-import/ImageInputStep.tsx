"use client";

import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, ImagePlus, Loader2, Plus, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  type OcrServiceName,
  OCR_SERVICE_LABELS,
} from "@/types/gc-import";

const ACCEPTED_EXTENSIONS = [".jpg", ".jpeg", ".png"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB por arquivo

interface ImageInputStepProps {
  onExtract: (images: File[], urls: string[]) => Promise<void>;
  isStartingJob: boolean;
  startError: string | null;
  ocrService: OcrServiceName;
  onOcrServiceChange: (value: OcrServiceName) => void;
}

interface FileWithPreview {
  file: File;
  preview: string;
}

export function ImageInputStep({
  onExtract,
  isStartingJob,
  startError,
  ocrService,
  onOcrServiceChange,
}: ImageInputStepProps) {
  const [tab, setTab] = useState("upload");
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([""]);
  const [urlPreviews, setUrlPreviews] = useState<Record<number, string>>({});
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Valida e adiciona arquivos selecionados
  const handleFilesSelect = useCallback(
    (selectedFiles: FileList) => {
      setFileError(false);
      const newFiles: FileWithPreview[] = [];

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const ext = `.${file.name.split(".").pop()?.toLowerCase()}`;

        if (!ACCEPTED_EXTENSIONS.includes(ext)) {
          toast.error(`Formato inválido: ${file.name}. Use .jpg, .jpeg ou .png.`);
          setFileError(true);
          continue;
        }

        if (file.size > MAX_FILE_SIZE) {
          toast.error(`${file.name} excede 5MB.`);
          setFileError(true);
          continue;
        }

        newFiles.push({ file, preview: URL.createObjectURL(file) });
      }

      if (newFiles.length > 0) {
        setFiles((prev) => [...prev, ...newFiles]);
      }
    },
    []
  );

  // Drag & drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        handleFilesSelect(e.dataTransfer.files);
      }
    },
    [handleFilesSelect]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFilesSelect(e.target.files);
      }
      // Reseta o input para permitir selecionar o mesmo arquivo novamente
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [handleFilesSelect]
  );

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => {
      const removed = prev[index];
      URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  // Gerenciamento de URLs
  const updateUrl = useCallback((index: number, value: string) => {
    setImageUrls((prev) => prev.map((u, i) => (i === index ? value : u)));
  }, []);

  const addUrlField = useCallback(() => {
    setImageUrls((prev) => [...prev, ""]);
  }, []);

  const removeUrlField = useCallback((index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
    setUrlPreviews((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  }, []);

  const handleUrlBlur = useCallback(
    (index: number) => {
      const url = imageUrls[index]?.trim();
      if (!url) {
        setUrlPreviews((prev) => {
          const next = { ...prev };
          delete next[index];
          return next;
        });
        return;
      }
      try {
        new URL(url);
        setUrlPreviews((prev) => ({ ...prev, [index]: url }));
      } catch {
        toast.error("URL inválida. Informe uma URL válida de imagem.");
        setUrlPreviews((prev) => {
          const next = { ...prev };
          delete next[index];
          return next;
        });
      }
    },
    [imageUrls]
  );

  const handleSubmit = useCallback(() => {
    const validUrls = imageUrls
      .map((u) => u.trim())
      .filter((u) => {
        if (!u) return false;
        try {
          new URL(u);
          return true;
        } catch {
          return false;
        }
      });

    const uploadFiles = files.map((f) => f.file);

    if (uploadFiles.length === 0 && validUrls.length === 0) return;

    void onExtract(uploadFiles, validUrls);
  }, [files, imageUrls, onExtract]);

  // Pelo menos uma imagem (upload) ou uma URL válida
  const validUrlCount = imageUrls.filter((u) => {
    if (!u.trim()) return false;
    try {
      new URL(u);
      return true;
    } catch {
      return false;
    }
  }).length;

  const canSubmit = files.length > 0 || validUrlCount > 0;

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImagePlus className="size-5" />
          Importar GC por imagem
        </CardTitle>
        <CardDescription>
          Envie uma ou mais imagens com informações de GCs e os dados serão
          extraídos automaticamente usando inteligência artificial.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Seleção do serviço OCR */}
        <div className="space-y-2">
          <Label htmlFor="ocr-service">Serviço OCR</Label>
          <Select
            value={ocrService}
            onValueChange={(v) => onOcrServiceChange(v as OcrServiceName)}
            disabled={isStartingJob}
          >
            <SelectTrigger id="ocr-service" aria-label="Serviço OCR">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(
                Object.entries(OCR_SERVICE_LABELS) as [OcrServiceName, string][]
              ).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload de arquivos</TabsTrigger>
            <TabsTrigger value="url">URLs</TabsTrigger>
          </TabsList>

          {/* Tab: Upload de arquivos */}
          <TabsContent value="upload" className="space-y-4">
            <div
              role="button"
              tabIndex={0}
              aria-label="Clique ou arraste imagens para fazer upload"
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                  fileInputRef.current?.click();
              }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed p-8 text-center transition-colors",
                isDragging
                  ? "border-primary bg-primary/5"
                  : fileError
                    ? "border-destructive"
                    : "border-muted-foreground/25 hover:border-primary/50"
              )}
            >
              <Upload className="size-8 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  Clique para selecionar ou arraste as imagens aqui
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Formatos aceitos: JPG, JPEG, PNG — Tamanho máximo: 5MB por
                  arquivo
                </p>
              </div>
            </div>

            {/* Lista de previews */}
            {files.length > 0 && (
              <div className="space-y-2">
                {files.map((item, index) => (
                  <div
                    key={`${item.file.name}-${index}`}
                    className="relative flex items-center gap-3 rounded-lg border p-2"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.preview}
                      alt={`Preview de ${item.file.name}`}
                      className="size-16 shrink-0 rounded object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {item.file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(item.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-destructive hover:text-destructive"
                      onClick={() => removeFile(index)}
                      aria-label={`Remover ${item.file.name}`}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png"
              multiple
              className="hidden"
              onChange={handleFileInputChange}
              aria-hidden="true"
            />
          </TabsContent>

          {/* Tab: URLs */}
          <TabsContent value="url" className="space-y-4">
            {imageUrls.map((url, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-end gap-2">
                  <div className="min-w-0 flex-1 space-y-1">
                    <Label htmlFor={`image-url-${index}`}>
                      URL da imagem {imageUrls.length > 1 ? index + 1 : ""}
                    </Label>
                    <Input
                      id={`image-url-${index}`}
                      type="url"
                      placeholder="https://exemplo.com/imagem-gc.jpg"
                      value={url}
                      onChange={(e) => updateUrl(index, e.target.value)}
                      onBlur={() => handleUrlBlur(index)}
                      disabled={isStartingJob}
                    />
                  </div>
                  {imageUrls.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-destructive hover:text-destructive"
                      onClick={() => removeUrlField(index)}
                      aria-label={`Remover URL ${index + 1}`}
                    >
                      <X className="size-4" />
                    </Button>
                  )}
                </div>

                {urlPreviews[index] && (
                  <div className="overflow-hidden rounded-lg border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={urlPreviews[index]}
                      alt={`Preview da imagem URL ${index + 1}`}
                      className="max-h-48 w-full object-contain"
                      onError={() => {
                        setUrlPreviews((prev) => {
                          const next = { ...prev };
                          delete next[index];
                          return next;
                        });
                        toast.error("Não foi possível carregar a imagem da URL.");
                      }}
                    />
                  </div>
                )}
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addUrlField}
              disabled={isStartingJob}
            >
              <Plus className="size-4" />
              Adicionar URL
            </Button>
          </TabsContent>
        </Tabs>

        {/* Botão de extração */}
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit || isStartingJob}
          className="w-full"
          size="lg"
        >
          {isStartingJob ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Iniciando extração...
            </>
          ) : (
            "Extrair dados"
          )}
        </Button>

        {/* Erro */}
        {startError && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
            <p className="text-sm text-destructive">{startError}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
