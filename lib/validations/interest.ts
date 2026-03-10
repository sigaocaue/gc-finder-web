import { z } from "zod";

export const interestFormSchema = z.object({
  name: z
    .string()
    .min(3, "O nome deve ter pelo menos 3 caracteres")
    .max(100, "O nome deve ter no máximo 100 caracteres"),
  email: z.string().email("Informe um email válido"),
  phone: z
    .string()
    .min(10, "Informe um telefone válido")
    .max(15, "Informe um telefone válido"),
  zipCode: z
    .string()
    .regex(/^\d{5}-?\d{3}$/, "Informe um CEP válido (00000-000)"),
  message: z.string().max(500, "A mensagem deve ter no máximo 500 caracteres").optional(),
  gcId: z.string().optional(),
});

export type InterestFormValues = z.infer<typeof interestFormSchema>;
