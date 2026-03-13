"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { ApiResponse } from "@/types";

const maritalStatusOptions = [
  { value: "casado", label: "Casado(a)" },
  { value: "solteiro", label: "Solteiro(a)" },
  { value: "divorciado", label: "Divorciado(a)" },
  { value: "viuvo", label: "Viúvo(a)" },
] as const;

const availabilityOptions = [
  { value: "semana_noite", label: "Durante a semana à noite" },
  { value: "fim_semana", label: "Finais de semana" },
] as const;

const howDidYouHearOptions = [
  { value: "culto", label: "No culto" },
  { value: "redes_sociais", label: "Redes sociais" },
  { value: "indicacao", label: "Indicação de amigo" },
  { value: "site", label: "Pelo site GC Finder" },
  { value: "outro", label: "Outro" },
] as const;

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Nome deve ter pelo menos 3 caracteres")
    .max(100),
  email: z.string().trim().email("Email inválido").max(255),
  phone: z.string().trim().min(10, "Telefone inválido").max(20),
  zip_code: z.string().regex(/^\d{5}-?\d{3}$/, "CEP inválido"),
  age: z.number().min(1, "Idade inválida").max(120, "Idade inválida").optional(),
  marital_status: z
    .enum(["casado", "solteiro", "divorciado", "viuvo"])
    .optional(),
  has_children: z.boolean().optional(),
  availability: z.enum(["semana_noite", "fim_semana"]).optional(),
  is_member: z.boolean().optional(),
  serves_in_ministry: z.boolean().optional(),
  how_did_you_hear: z
    .enum(["culto", "redes_sociais", "indicacao", "site", "outro"])
    .optional(),
  how_did_you_hear_other: z.string().max(200).optional(),
  message: z.string().max(1000).optional(),
});

type FormData = z.infer<typeof schema>;

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length > 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, digits.length - 4)}-${digits.slice(-4)}`;
  }
  if (digits.length > 2) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  return digits;
}

function formatCep(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length > 5) {
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  }
  return digits;
}

export default function InterestPage() {
  const searchParams = useSearchParams();
  const gcId = searchParams.get("gc_id");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      has_children: false,
      is_member: false,
      serves_in_ministry: false,
    },
  });

  const howDidYouHear = watch("how_did_you_hear");

  const onSubmit = async (data: FormData) => {
    try {
      await api<ApiResponse<null>>("/public/interest", {
        method: "POST",
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone.replace(/\D/g, ""),
          zip_code: data.zip_code.replace(/\D/g, ""),
          age: data.age,
          marital_status: data.marital_status,
          has_children: data.has_children,
          availability: data.availability,
          is_member: data.is_member,
          serves_in_ministry: data.serves_in_ministry,
          how_did_you_hear: data.how_did_you_hear,
          how_did_you_hear_other: data.how_did_you_hear_other,
          message: data.message,
          gc_id: gcId || undefined,
        },
      });
      toast.success(
        "Seu interesse foi registrado! Em breve entraremos em contato."
      );
      setTimeout(() => router.push("/"), 3000);
    } catch {
      toast.error("Erro ao enviar. Tente novamente mais tarde.");
    }
  };

  return (
    <div className="mx-auto max-w-2xl animate-fade-in px-6 py-8">
        <Link href="/">
          <Button variant="ghost" className="mb-4 gap-2">
            <ArrowLeft className="size-4" /> Voltar ao mapa
          </Button>
        </Link>
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-2xl">
              Quero participar de um GC
            </CardTitle>
            <CardDescription>
              Preencha o formulário abaixo e entraremos em contato com você para
              indicar o GC ideal.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Dados pessoais */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo *</Label>
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder="Seu nome"
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register("email")}
                      placeholder="seu@email.com"
                    />
                    {errors.email && (
                      <p className="text-xs text-destructive">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age">Idade</Label>
                    <Controller
                      name="age"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="age"
                          type="number"
                          placeholder="25"
                          min={1}
                          max={120}
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            field.onChange(val === "" ? undefined : Number(val));
                          }}
                        />
                      )}
                    />
                    {errors.age && (
                      <p className="text-xs text-destructive">
                        {errors.age.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone/WhatsApp *</Label>
                  <Input
                    id="phone"
                    {...register("phone")}
                    placeholder="(11) 99999-9999"
                    value={watch("phone") || ""}
                    onChange={(e) =>
                      setValue("phone", formatPhone(e.target.value))
                    }
                  />
                  {errors.phone && (
                    <p className="text-xs text-destructive">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zip_code">CEP *</Label>
                  <Input
                    id="zip_code"
                    {...register("zip_code")}
                    placeholder="00000-000"
                    value={watch("zip_code") || ""}
                    onChange={(e) =>
                      setValue("zip_code", formatCep(e.target.value))
                    }
                  />
                  {errors.zip_code && (
                    <p className="text-xs text-destructive">
                      {errors.zip_code.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Estado civil */}
              <div className="space-y-3">
                <Label>Estado civil?</Label>
                <Controller
                  name="marital_status"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {maritalStatusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Tem filhos */}
              <div className="space-y-3">
                <Label>Tem filhos?</Label>
                <Controller
                  name="has_children"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      onValueChange={(value) =>
                        field.onChange(value === "true")
                      }
                      value={field.value ? "true" : "false"}
                      className="flex gap-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="true"
                          id="has_children_yes"
                        />
                        <Label
                          htmlFor="has_children_yes"
                          className="cursor-pointer font-normal"
                        >
                          Sim
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="false"
                          id="has_children_no"
                        />
                        <Label
                          htmlFor="has_children_no"
                          className="cursor-pointer font-normal"
                        >
                          Não
                        </Label>
                      </div>
                    </RadioGroup>
                  )}
                />
              </div>

              {/* Disponibilidade */}
              <div className="space-y-3">
                <Label>
                  Qual é a sua disponibilidade de horários para participar do
                  GC?
                </Label>
                <Controller
                  name="availability"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex flex-col gap-3"
                    >
                      {availabilityOptions.map((option) => (
                        <div
                          key={option.value}
                          className="flex items-center space-x-2"
                        >
                          <RadioGroupItem
                            value={option.value}
                            id={option.value}
                          />
                          <Label
                            htmlFor={option.value}
                            className="cursor-pointer font-normal"
                          >
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                />
              </div>

              {/* Membro da Lagoinha */}
              <div className="space-y-3">
                <Label>Você é membro da Lagoinha Jundiaí?</Label>
                <Controller
                  name="is_member"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      onValueChange={(value) =>
                        field.onChange(value === "true")
                      }
                      value={field.value ? "true" : "false"}
                      className="flex gap-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="true" id="is_member_yes" />
                        <Label
                          htmlFor="is_member_yes"
                          className="cursor-pointer font-normal"
                        >
                          Sim
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="false" id="is_member_no" />
                        <Label
                          htmlFor="is_member_no"
                          className="cursor-pointer font-normal"
                        >
                          Não
                        </Label>
                      </div>
                    </RadioGroup>
                  )}
                />
              </div>

              {/* Serve em ministério */}
              <div className="space-y-3">
                <Label>Serve em algum ministério?</Label>
                <Controller
                  name="serves_in_ministry"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      onValueChange={(value) =>
                        field.onChange(value === "true")
                      }
                      value={field.value ? "true" : "false"}
                      className="flex gap-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="true" id="serves_yes" />
                        <Label
                          htmlFor="serves_yes"
                          className="cursor-pointer font-normal"
                        >
                          Sim
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="false" id="serves_no" />
                        <Label
                          htmlFor="serves_no"
                          className="cursor-pointer font-normal"
                        >
                          Não
                        </Label>
                      </div>
                    </RadioGroup>
                  )}
                />
              </div>

              {/* Como ficou sabendo */}
              <div className="space-y-3">
                <Label>Como ficou sabendo dos GCs?</Label>
                <Controller
                  name="how_did_you_hear"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex flex-col gap-3"
                    >
                      {howDidYouHearOptions.map((option) => (
                        <div
                          key={option.value}
                          className="flex items-center space-x-2"
                        >
                          <RadioGroupItem
                            value={option.value}
                            id={option.value}
                          />
                          <Label
                            htmlFor={option.value}
                            className="cursor-pointer font-normal"
                          >
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                />
                {howDidYouHear === "outro" && (
                  <div className="mt-2 space-y-2">
                    <Label htmlFor="how_did_you_hear_other">
                      Especifique:
                    </Label>
                    <Input
                      id="how_did_you_hear_other"
                      {...register("how_did_you_hear_other")}
                      placeholder="Como você ficou sabendo?"
                    />
                  </div>
                )}
              </div>

              {/* Mensagem */}
              <div className="space-y-2">
                <Label htmlFor="message">Mensagem (opcional)</Label>
                <Textarea
                  id="message"
                  {...register("message")}
                  placeholder="Alguma observação ou dúvida?"
                  rows={3}
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-warm text-warm-foreground hover:bg-warm/90"
              >
                {isSubmitting ? "Enviando..." : "Enviar interesse"}
              </Button>
            </form>
          </CardContent>
        </Card>
    </div>
  );
}
