"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Loader2, ScanSearch } from "lucide-react";

interface ExtractionProgressStepProps {
  message: string | null;
  onCancel: () => void;
}

export function ExtractionProgressStep({
  message,
  onCancel,
}: ExtractionProgressStepProps) {
  return (
    <Card className="mx-auto max-w-lg">
      <CardContent className="flex flex-col items-center gap-6 py-12 text-center">
        {/* Ícone animado */}
        <div className="relative">
          <ScanSearch className="size-12 text-primary" />
          <Loader2 className="absolute -right-1 -top-1 size-5 animate-spin text-primary" />
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Processando imagem...</h2>

          {/* Mensagem com animação de fade */}
          <div className="min-h-[1.5rem]">
            <AnimatePresence mode="wait">
              <motion.p
                key={message}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="text-sm text-muted-foreground"
              >
                {message ?? "Aguardando..."}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* Barra de progresso indeterminada */}
        <div className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: "easeInOut",
            }}
            style={{ width: "40%" }}
          />
        </div>

        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </CardContent>
    </Card>
  );
}
