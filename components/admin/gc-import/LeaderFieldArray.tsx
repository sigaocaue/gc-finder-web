"use client";

import { useFieldArray, Controller, type UseFormRegister, type Control, type FieldErrors } from "react-hook-form";
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
import { Plus, Trash2, UserPlus } from "lucide-react";
import type { ExtractedDataFormValues } from "./ExtractedDataForm";

const CONTACT_TYPES = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "instagram", label: "Instagram" },
  { value: "email", label: "E-mail" },
];

interface LeaderFieldArrayProps {
  control: Control<ExtractedDataFormValues>;
  register: UseFormRegister<ExtractedDataFormValues>;
  errors: FieldErrors<ExtractedDataFormValues>;
}

export function LeaderFieldArray({
  control,
  register,
  errors,
}: LeaderFieldArrayProps) {
  const {
    fields: leaderFields,
    append: appendLeader,
    remove: removeLeader,
  } = useFieldArray({ control, name: "leaders" });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Líderes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {leaderFields.map((leader, leaderIndex) => (
          <LeaderItem
            key={leader.id}
            leaderIndex={leaderIndex}
            control={control}
            register={register}
            errors={errors}
            onRemove={() => removeLeader(leaderIndex)}
          />
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            appendLeader({
              name: "",
              contacts: [{ type: "whatsapp", value: "", label: "" }],
            })
          }
        >
          <UserPlus className="size-4" />
          Adicionar líder
        </Button>
      </CardContent>
    </Card>
  );
}

// Subcomponente para cada líder
interface LeaderItemProps {
  leaderIndex: number;
  control: Control<ExtractedDataFormValues>;
  register: UseFormRegister<ExtractedDataFormValues>;
  errors: FieldErrors<ExtractedDataFormValues>;
  onRemove: () => void;
}

function LeaderItem({
  leaderIndex,
  control,
  register,
  errors,
  onRemove,
}: LeaderItemProps) {
  const {
    fields: contactFields,
    append: appendContact,
    remove: removeContact,
  } = useFieldArray({
    control,
    name: `leaders.${leaderIndex}.contacts`,
  });

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 space-y-1">
          <Label htmlFor={`leader-name-${leaderIndex}`}>Nome do líder *</Label>
          <Input
            id={`leader-name-${leaderIndex}`}
            {...register(`leaders.${leaderIndex}.name`)}
            placeholder="Nome do líder"
          />
          {errors.leaders?.[leaderIndex]?.name && (
            <p className="text-xs text-destructive">
              {errors.leaders[leaderIndex].name?.message}
            </p>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="mt-6 shrink-0 text-destructive hover:text-destructive"
          onClick={onRemove}
          aria-label={`Remover líder ${leaderIndex + 1}`}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      {/* Contatos do líder */}
      <div className="space-y-2 pl-2">
        <p className="text-xs font-medium text-muted-foreground">Contatos</p>
        {contactFields.map((contact, contactIndex) => (
          <div
            key={contact.id}
            className="flex flex-wrap items-end gap-2"
          >
            <div className="w-32 space-y-1">
              <Label htmlFor={`contact-type-${leaderIndex}-${contactIndex}`}>
                Tipo
              </Label>
              <ContactTypeSelect
                control={control}
                leaderIndex={leaderIndex}
                contactIndex={contactIndex}
              />
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <Label htmlFor={`contact-value-${leaderIndex}-${contactIndex}`}>
                Valor *
              </Label>
              <Input
                id={`contact-value-${leaderIndex}-${contactIndex}`}
                {...register(
                  `leaders.${leaderIndex}.contacts.${contactIndex}.value`
                )}
                placeholder="11999999999"
              />
            </div>

            <div className="w-28 space-y-1">
              <Label htmlFor={`contact-label-${leaderIndex}-${contactIndex}`}>
                Rótulo
              </Label>
              <Input
                id={`contact-label-${leaderIndex}-${contactIndex}`}
                {...register(
                  `leaders.${leaderIndex}.contacts.${contactIndex}.label`
                )}
                placeholder="Pessoal"
              />
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 text-destructive hover:text-destructive"
              onClick={() => removeContact(contactIndex)}
              aria-label={`Remover contato ${contactIndex + 1}`}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        ))}

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-xs"
          onClick={() =>
            appendContact({ type: "whatsapp", value: "", label: "" })
          }
        >
          <Plus className="size-3" />
          Adicionar contato
        </Button>
      </div>
    </div>
  );
}

// Componente Select controlado para tipo de contato
function ContactTypeSelect({
  control,
  leaderIndex,
  contactIndex,
}: {
  control: Control<ExtractedDataFormValues>;
  leaderIndex: number;
  contactIndex: number;
}) {
  return (
    <Controller
      control={control}
      name={`leaders.${leaderIndex}.contacts.${contactIndex}.type`}
      render={({ field }) => (
        <Select value={field.value} onValueChange={field.onChange}>
          <SelectTrigger
            id={`contact-type-${leaderIndex}-${contactIndex}`}
            aria-label="Tipo de contato"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CONTACT_TYPES.map((ct) => (
              <SelectItem key={ct.value} value={ct.value}>
                {ct.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    />
  );
}
