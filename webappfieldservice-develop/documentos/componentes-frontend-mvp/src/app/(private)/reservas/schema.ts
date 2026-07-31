import { z } from "zod";

export const reservaSchema = z
  .object({
    id: z.number().optional(),
    idEspaco: z
      .union([z.string(), z.number(), z.null(), z.undefined()])
      .transform((val) => {
        if (val === "" || val === null || val === undefined) return undefined;
        const num = Number(val);
        return isNaN(num) ? undefined : num;
      })
      .refine((val) => typeof val === "number" && val > 0, {
        message: "Selecione um espaço",
      }),
    idEvento: z.coerce.number().optional().nullable(),
    dataInicio: z.string().min(1, "Data de início é obrigatória"),
    dataFim: z.string().min(1, "Data de fim é obrigatória"),
    motivo: z.string().min(1, "O motivo da reserva é obrigatório").max(150),
  })
  .refine((data) => new Date(data.dataFim) > new Date(data.dataInicio), {
    message: "A data de fim deve ser posterior à data de início",
    path: ["dataFim"],
  });

export type ReservaFormData = z.infer<typeof reservaSchema>;
