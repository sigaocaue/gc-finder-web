"use client";

import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, ImagePlus, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const ACCEPTED_EXTENSIONS = [".jpg", ".jpeg", ".png"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface ImageInputStepProps {
  onExtract: (input: File | string) => Promise<void>;
  isStartingJob: boolean;
  startError: string | null;
}

export function ImageInputStep({
  onExtract,
  isStartingJob,
  startError,
}: ImageInputStepProps) {
  const [tab, setTab] = useState("upload");
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [urlPreview, setUrlPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Valida e define o arquivo selecionado
  const handleFileSelect = useCallback((selectedFile: File) => {
    setFileError(false);
    const ext = `.${selectedFile.name.split(".").pop()?.toLowerCase()}`;

    if (!ACCEPTED_EXTENSIONS.includes(ext)) {
      toast.error("Formato inválido. Use .jpg, .jpeg ou .png.");
      setFileError(true);
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      toast.error("Arquivo muito grande. O tamanho máximo é 10MB.");
      setFileError(true);
      return;
    }

    setFile(selectedFile);
    setFilePreview(URL.createObjectURL(selectedFile));
  }, []);

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
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) handleFileSelect(droppedFile);
    },
    [handleFileSelect]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0];
      if (selected) handleFileSelect(selected);
    },
    [handleFileSelect]
  );

  const clearFile = useCallback(() => {
    setFile(null);
    if (filePreview) URL.revokeObjectURL(filePreview);
    setFilePreview(null);
    setFileError(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [filePreview]);

  // Valida URL e exibe preview ao perder foco
  const handleUrlBlur = useCallback(() => {
    if (!imageUrl.trim()) {
      setUrlPreview(null);
      return;
    }
    try {
      new URL(imageUrl);
      setUrlPreview(imageUrl);
    } catch {
      toast.error("URL inválida. Informe uma URL válida de imagem.");
      setUrlPreview(null);
    }
  }, [imageUrl]);

  const handleSubmit = useCallback(() => {
    if (tab === "upload" && file) {
      void onExtract(file);
    } else if (tab === "url" && imageUrl.trim()) {
      try {
        new URL(imageUrl);
        void onExtract(imageUrl);
      } catch {
        toast.error("URL inválida.");
      }
    }
  }, [tab, file, imageUrl, onExtract]);

  const canSubmit =
    (tab === "upload" && file !== null) ||
    (tab === "url" && imageUrl.trim().length > 0);

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImagePlus className="size-5" />
          Importar GC por imagem
        </CardTitle>
        <CardDescription>
          Envie uma imagem com as informações do GC e os dados serão extraídos
          automaticamente usando inteligência artificial.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload de arquivo</TabsTrigger>
            <TabsTrigger value="url">URL da imagem</TabsTrigger>
          </TabsList>

          {/* Tab: Upload de arquivo */}
          <TabsContent value="upload" className="space-y-4">
            {!file ? (
              <div
                role="button"
                tabIndex={0}
                aria-label="Clique ou arraste uma imagem para fazer upload"
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
                    Clique para selecionar ou arraste a imagem aqui
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Formatos aceitos: JPG, JPEG, PNG — Tamanho máximo: 10MB
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative overflow-hidden rounded-lg border">
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute right-2 top-2 size-7"
                  onClick={clearFile}
                  aria-label="Remover imagem"
                >
                  <X className="size-4" />
                </Button>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={filePreview ?? ""}
                  alt="Preview da imagem selecionada"
                  className="max-h-64 w-full object-contain"
                />
                <div className="border-t bg-muted/50 px-3 py-2">
                  <p className="truncate text-xs text-muted-foreground">
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png"
              className="hidden"
              onChange={handleFileInputChange}
              aria-hidden="true"
            />
          </TabsContent>

          {/* Tab: URL da imagem */}
          <TabsContent value="url" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image-url">URL da imagem</Label>
              <Input
                id="image-url"
                type="url"
                placeholder="https://exemplo.com/imagem-gc.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onBlur={handleUrlBlur}
                disabled={isStartingJob}
              />
            </div>

            {urlPreview && (
              <div className="overflow-hidden rounded-lg border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={urlPreview}
                  alt="Preview da imagem pela URL"
                  className="max-h-64 w-full object-contain"
                  onError={() => {
                    setUrlPreview(null);
                    toast.error("Não foi possível carregar a imagem da URL.");
                  }}
                />
              </div>
            )}
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
