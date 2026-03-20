"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, ExternalLink, ImagePlus, List } from "lucide-react";
import type { GcExtractedData } from "@/types/gc-import";

interface ImportSuccessFeedbackProps {
  savedNames: string[];
  savedGcIds: string[];
  onReset: () => void;
}

export function ImportSuccessFeedback({
  savedNames,
  savedGcIds,
  onReset,
}: ImportSuccessFeedbackProps) {
  const router = useRouter();
  const count = savedGcIds.length;

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

        <div className="space-y-2">
          <h2 className="text-lg font-semibold">
            {count} GC(s) cadastrado(s) com sucesso!
          </h2>
          {savedNames.length > 0 && (
            <ul className="space-y-0.5">
              {savedNames.map((name, i) => (
                <li key={i} className="text-sm font-medium text-primary">
                  {name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex w-full max-w-xs flex-col gap-2">
          {savedGcIds.length === 1 && (
            <Button
              onClick={() =>
                router.push(`/admin/gcs/${savedGcIds[0]}/edit`)
              }
              className="w-full"
            >
              <ExternalLink className="size-4" />
              Ver GC cadastrado
            </Button>
          )}

          <Button variant="outline" onClick={onReset} className="w-full">
            <ImagePlus className="size-4" />
            Importar outros GCs
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
