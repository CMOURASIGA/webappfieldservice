import { z } from 'zod';

export const espacoSchema = z.object({
  nome: z.string().min(1, "O nome do espaço é obrigatório").max(100),
  idLocal: z.coerce.number().min(1, "Selecione um local"),
  capacidade: z.coerce.number().optional().nullable(),
  ativo: z.boolean().default(true),
  codigo: z.string().max(10, "Máximo de 10 caracteres").optional().nullable(),
  caracteristicasArray:  z.array(
    z.object({
      caracteristicaId: z.int().optional().default(0),
      nome: z.string().optional(),  
      observacao: z.string().optional(), 
     })).optional(),
});

export type EspacoFormData = z.infer<typeof espacoSchema>;