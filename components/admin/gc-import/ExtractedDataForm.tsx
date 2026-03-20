"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { GcExtractedData } from "@/types/gc-import";
import { LeaderFieldArray } from "./LeaderFieldArray";
import { MeetingFieldArray } from "./MeetingFieldArray";

// Schema de validação do formulário
const extractedDataSchema = z.object({
  name: z.string().min(1, "Nome do GC é obrigatório"),
  description: z.string().optional(),
  zip_code: z.string().optional(),
  street: z.string().min(1, "Logradouro é obrigatório"),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z.string().min(1, "Estado é obrigatório"),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  leaders: z.array(
    z.object({
      name: z.string().min(1, "Nome do líder é obrigatório"),
      contacts: z.array(
        z.object({
          type: z.string(),
          value: z.string().min(1, "Valor do contato é obrigatório"),
          label: z.string().optional(),
        })
      ),
    })
  ),
  meetings: z.array(
    z.object({
      weekday: z.number().min(0).max(6),
      start_time: z.string().min(1, "Horário é obrigatório"),
      notes: z.string().optional(),
    })
  ),
});

export type ExtractedDataFormValues = z.infer<typeof extractedDataSchema>;

interface ExtractedDataFormProps {
  data: GcExtractedData;
  onSave: (data: GcExtractedData) => Promise<void>;
  onReset: () => void;
  isSaving: boolean;
  saveError: string | null;
}

export function ExtractedDataForm({
  data,
  onSave,
  onReset,
  isSaving,
  saveError,
}: ExtractedDataFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ExtractedDataFormValues>({
    resolver: zodResolver(extractedDataSchema),
    defaultValues: {
      name: data.name,
      description: data.description ?? "",
      zip_code: data.zip_code ?? "",
      street: data.street,
      number: data.number ?? "",
      complement: data.complement ?? "",
      neighborhood: data.neighborhood ?? "",
      city: data.city,
      state: data.state,
      latitude: data.latitude,
      longitude: data.longitude,
      leaders: data.leaders.map((l) => ({
        name: l.name,
        contacts: l.contacts.map((c) => ({
          type: c.type,
          value: c.value,
          label: c.label ?? "",
        })),
      })),
      meetings: data.meetings.map((m) => ({
        weekday: m.weekday,
        start_time: m.start_time,
        notes: m.notes ?? "",
      })),
    },
  });

  const onSubmit = (values: ExtractedDataFormValues) => {
    // Aviso não-bloqueante se não há encontros
    if (values.meetings.length === 0) {
      toast.warning("Nenhum encontro cadastrado. O GC será salvo sem encontros.");
    }

    // Converte de volta para o formato da API
    const payload: GcExtractedData = {
      name: values.name,
      description: values.description || null,
      zip_code: values.zip_code || null,
      street: values.street,
      number: values.number || null,
      complement: values.complement || null,
      neighborhood: values.neighborhood || null,
      city: values.city,
      state: values.state,
      latitude: values.latitude ?? null,
      longitude: values.longitude ?? null,
      leaders: values.leaders.map((l) => ({
        name: l.name,
        contacts: l.contacts.map((c) => ({
          type: c.type,
          value: c.value,
          label: c.label || null,
        })),
      })),
      meetings: values.meetings.map((m) => ({
        weekday: m.weekday,
        start_time: m.start_time,
        notes: m.notes || null,
      })),
    };

    void onSave(payload);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto max-w-2xl space-y-6"
    >
      {/* Dados do GC */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados do GC</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="gc-name">Nome do GC *</Label>
            <Input
              id="gc-name"
              {...register("name")}
              disabled={isSaving}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="gc-description">Descrição</Label>
            <Textarea
              id="gc-description"
              {...register("description")}
              rows={3}
              disabled={isSaving}
            />
          </div>
        </CardContent>
      </Card>

      {/* Endereço */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Endereço</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="gc-street">Logradouro *</Label>
              <Input
                id="gc-street"
                {...register("street")}
                disabled={isSaving}
              />
              {errors.street && (
                <p className="text-xs text-destructive">
                  {errors.street.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="gc-number">Número</Label>
              <Input
                id="gc-number"
                {...register("number")}
                disabled={isSaving}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="gc-complement">Complemento</Label>
              <Input
                id="gc-complement"
                {...register("complement")}
                disabled={isSaving}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="gc-neighborhood">Bairro</Label>
              <Input
                id="gc-neighborhood"
                {...register("neighborhood")}
                disabled={isSaving}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="gc-city">Cidade *</Label>
              <Input
                id="gc-city"
                {...register("city")}
                disabled={isSaving}
              />
              {errors.city && (
                <p className="text-xs text-destructive">
                  {errors.city.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="gc-state">Estado *</Label>
              <Input
                id="gc-state"
                {...register("state")}
                maxLength={2}
                disabled={isSaving}
              />
              {errors.state && (
                <p className="text-xs text-destructive">
                  {errors.state.message}
                </p>
              )}
            </div>

            {/* Campos readonly preenchidos automaticamente */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Label htmlFor="gc-zip-code">CEP</Label>
                <AutoBadge value={data.zip_code} />
              </div>
              <Input
                id="gc-zip-code"
                {...register("zip_code")}
                readOnly
                className="bg-muted"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Label htmlFor="gc-latitude">Latitude</Label>
                <AutoBadge value={data.latitude} />
              </div>
              <Input
                id="gc-latitude"
                value={data.latitude ?? ""}
                readOnly
                className="bg-muted"
                tabIndex={-1}
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Label htmlFor="gc-longitude">Longitude</Label>
                <AutoBadge value={data.longitude} />
              </div>
              <Input
                id="gc-longitude"
                value={data.longitude ?? ""}
                readOnly
                className="bg-muted"
                tabIndex={-1}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Líderes */}
      <LeaderFieldArray
        control={control}
        register={register}
        errors={errors}
      />

      {/* Encontros */}
      <MeetingFieldArray
        control={control}
        register={register}
        errors={errors}
      />

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

        <Button type="submit" disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Cadastrando...
            </>
          ) : (
            "Confirmar e cadastrar"
          )}
        </Button>
      </div>
    </form>
  );
}

// Badge indicando se o campo foi preenchido automaticamente ou não
function AutoBadge({ value }: { value: string | number | null | undefined }) {
  if (value !== null && value !== undefined && value !== "") {
    return (
      <Badge variant="secondary" className="text-[10px]">
        Preenchido automaticamente
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="border-yellow-500/50 bg-yellow-500/10 text-[10px] text-yellow-700 dark:text-yellow-400"
      title="O backend não conseguiu localizar este dado automaticamente"
    >
      Não encontrado
    </Badge>
  );
}
