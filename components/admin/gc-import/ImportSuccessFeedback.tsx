"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, ExternalLink, ImagePlus, List } from "lucide-react";

interface ImportSuccessFeedbackProps {
  gcName: string | null;
  savedGcId: string | null;
  onReset: () => void;
}

export function ImportSuccessFeedback({
  gcName,
  savedGcId,
  onReset,
}: ImportSuccessFeedbackProps) {
  const router = useRouter();

  return (
    <Card className="mx-auto max-w-lg">
      <CardContent className="flex flex-col items-center gap-6 py-12 text-center">
        {/* Ícone animado de sucesso */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <CheckCircle2 className="size-16 text-green-500" />
        </motion.div>

        <div className="space-y-1">
          <h2 className="text-lg font-semibold">GC cadastrado com sucesso!</h2>
          {gcName && (
            <p className="text-sm font-medium text-primary">{gcName}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full max-w-xs">
          {savedGcId && (
            <Button
              onClick={() => router.push(`/admin/gcs/${savedGcId}/edit`)}
              className="w-full"
            >
              <ExternalLink className="size-4" />
              Ver GC cadastrado
            </Button>
          )}

          <Button
            variant="outline"
            onClick={onReset}
            className="w-full"
          >
            <ImagePlus className="size-4" />
            Importar outro GC
          </Button>

          <Button
            variant="ghost"
            onClick={() => router.push("/admin/gcs")}
            className="w-full"
          >
            <List className="size-4" />
            Voltar para a lista de GCs
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
