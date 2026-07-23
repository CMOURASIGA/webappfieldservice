import { z } from "zod";

export const localSchema = z.object({
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  codigo: z.string().optional(),
  endereco: z.string().optional(),
  linkMapa: z.string().optional(),
  externo: z.boolean(),
});

export type LocalFormData = z.infer<typeof localSchema>;
