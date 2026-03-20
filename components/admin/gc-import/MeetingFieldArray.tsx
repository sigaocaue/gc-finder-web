"use client";

import {
  useFieldArray,
  Controller,
  type UseFormRegister,
  type Control,
  type FieldErrors,
} from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarPlus, Trash2 } from "lucide-react";
import type { ExtractedDataFormValues } from "./ExtractedDataForm";

// Mapeamento conforme spec: 0=Dom, 1=Seg, ..., 6=Sáb
const WEEKDAY_OPTIONS = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda-feira" },
  { value: 2, label: "Terça-feira" },
  { value: 3, label: "Quarta-feira" },
  { value: 4, label: "Quinta-feira" },
  { value: 5, label: "Sexta-feira" },
  { value: 6, label: "Sábado" },
];

interface MeetingFieldArrayProps {
  control: Control<ExtractedDataFormValues>;
  register: UseFormRegister<ExtractedDataFormValues>;
  errors: FieldErrors<ExtractedDataFormValues>;
}

export function MeetingFieldArray({
  control,
  register,
  errors,
}: MeetingFieldArrayProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "meetings",
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Encontros</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="flex flex-wrap items-end gap-3 rounded-lg border p-4"
          >
            <div className="w-48 space-y-1">
              <Label htmlFor={`meeting-weekday-${index}`}>
                Dia da semana *
              </Label>
              <Controller
                control={control}
                name={`meetings.${index}.weekday`}
                render={({ field: weekdayField }) => (
                  <Select
                    value={String(weekdayField.value)}
                    onValueChange={(v) => weekdayField.onChange(Number(v))}
                  >
                    <SelectTrigger
                      id={`meeting-weekday-${index}`}
                      aria-label="Dia da semana"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WEEKDAY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={String(opt.value)}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.meetings?.[index]?.weekday && (
                <p className="text-xs text-destructive">
                  {errors.meetings[index].weekday?.message}
                </p>
              )}
            </div>

            <div className="w-32 space-y-1">
              <Label htmlFor={`meeting-time-${index}`}>Horário *</Label>
              <Input
                id={`meeting-time-${index}`}
                {...register(`meetings.${index}.start_time`)}
                placeholder="20:00"
              />
              {errors.meetings?.[index]?.start_time && (
                <p className="text-xs text-destructive">
                  {errors.meetings[index].start_time?.message}
                </p>
              )}
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <Label htmlFor={`meeting-notes-${index}`}>Observações</Label>
              <Input
                id={`meeting-notes-${index}`}
                {...register(`meetings.${index}.notes`)}
                placeholder="Ex: quinzenal"
              />
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 text-destructive hover:text-destructive"
              onClick={() => remove(index)}
              aria-label={`Remover encontro ${index + 1}`}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            append({ weekday: 3, start_time: "20:00", notes: "" })
          }
        >
          <CalendarPlus className="size-4" />
          Adicionar encontro
        </Button>
      </CardContent>
    </Card>
  );
}
