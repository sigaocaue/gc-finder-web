import { z } from "zod";

export const zipCodeSchema = z.object({
  zipCode: z
    .string()
    .regex(/^\d{5}-?\d{3}$/, "Informe um CEP válido (00000-000)"),
});

export type ZipCodeFormValues = z.infer<typeof zipCodeSchema>;
