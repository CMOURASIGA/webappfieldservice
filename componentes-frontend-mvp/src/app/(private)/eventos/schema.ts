// src/app/events/create/schema.ts
import { z } from "zod";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/pdf",
];

const ZodIdOptional = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }
  const num = Number(value);
  return isNaN(num) ? undefined : num;
}, z.number().int().optional());

const ZodIdNullable = z.preprocess(
  (value) => {
    if (value === "") return undefined;
    if (value === null) return null;
    if (value === undefined) return undefined;
    const num = Number(value);
    return isNaN(num) ? undefined : num;
  },
  z.union([z.number().int(), z.null()]).optional(),
);

const ZodIdRequired = z.preprocess(
  (value) => {
    if (value === "" || value === null || value === undefined) {
      return undefined;
    }
    const num = Number(value);
    return isNaN(num) ? undefined : num;
  },
  z
    .number()
    .optional()
    .refine((val) => val !== undefined && val >= 1, {
      message: "Campo obrigatório",
    })
    .transform((val) => val as number),
);

export const formularioEventosData = z
  .object({
    duracao: z.preprocess((value) => {
      if (value === "" || value === null || value === undefined)
        return undefined;
      const num = Number(value);
      return isNaN(num) ? undefined : num;
    }, z.number().min(0, "Duração deve ser positiva").optional()),

    dataInicio: z.string().optional(),
    dataFim: z.string().optional(),
    dayOfWeek: z.string().readonly().optional(),

    periodos: z
      .array(
        z.object({
          dataInicio: z.string().min(1, "Data/Hora de início é obrigatória"),
          dataFim: z.string().min(1, "Data/Hora de fim é obrigatória"),
        }).refine((data) => new Date(data.dataFim) > new Date(data.dataInicio), {
          message: "A data final deve ser posterior à inicial",
          path: ["dataFim"],
        })
      )
      .min(1, "Adicione pelo menos um período"),

    nome: z.string().min(3, "O título é obrigatório"),
    descricao: z.preprocess(
      (val) => (val === null ? "" : val),
      z.string().optional(),
    ),

    demandantesArea: z
      .array(
        z.object({
          demandanteId: z.coerce
            .string()
            .min(1, "Área demandante é obrigatória"),
          nome: z.string().optional(),
          dadosContato: z
            .string()
            .min(3, "O contato deve ter pelo menos 3 caracteres")
            .max(255, "O contato está muito longo"),
        }),
      )
      .min(1, "Selecione pelo menos um demandante"),
    idEspaco: ZodIdOptional,
    idLocal: ZodIdOptional,
    localName: z.string().optional(),

    isExternal: z.preprocess((val) => !!val, z.boolean().default(false)),
    pais: z.preprocess(
      (val) => (val === null ? "" : val),
      z.string().optional(),
    ),
    estado: z.preprocess(
      (val) => (val === null ? "" : val),
      z.string().optional(),
    ),
    localExterno: z.preprocess(
      (val) => (val === null ? "" : val),
      z.string().optional(),
    ),

    guestCount: ZodIdOptional,

    tamanho: ZodIdOptional, // Antes: z.enum(...)
    formato: ZodIdOptional, // Antes: z.enum(...)
    reservaId: ZodIdNullable, // MANTIDO PARA COMPATIBILIDADE, MAS SERÁ IGNORADO EM FAVOR DE idsReservas
    idsReservas: z.array(z.number()).optional(), // NOVO CAMPO
    idsTematicas: z.array(z.number()).optional(), // NOVO CAMPO DE TEMÁTICAS

    clientArea: z.string().optional(),

    idEntidade: ZodIdOptional,

    demandanteId: ZodIdOptional,
    idContato: z.string().optional(),

    previstoNoOrcamento: z.preprocess(
      (val) => !!val,
      z.boolean().default(false),
    ),
    idSituacao: ZodIdRequired, // OBRIGATÓRIO

    frequencia: ZodIdOptional,

    nomeProdutor: z.string().min(1, "Produtor responsável é obrigatório"), // Mantido string por causa do min(1, "obrigatório")

    complexidade: ZodIdOptional,
    categoria: ZodIdRequired,
    tipo: ZodIdOptional,
    idTipoEspaco: ZodIdOptional,
    entidade: ZodIdOptional,
    classificacao: ZodIdOptional,
    idComplexidade: ZodIdOptional,

    planejamento: z.string().optional(), // Texto livre (OK)

    integrado: z.preprocess((val) => !!val, z.boolean().default(false)),
    faseProjeto: ZodIdOptional, // Antes: z.enum(...)

    isCeremonial: z.preprocess((val) => !!val, z.boolean().default(false)),
    producaoEstande: z.preprocess((val) => !!val, z.boolean().default(false)),
    estrategico: z.preprocess((val) => !!val, z.boolean().default(false)),
    restrito: z.preprocess((val) => !!val, z.boolean().default(false)),
    observacao: z.string().optional(),
    idSegmento: ZodIdOptional,
    idClassificacao: ZodIdOptional,
    idPublicoAlvo: ZodIdOptional,
    idSegmentoPublico: ZodIdOptional,
    
    legislacao: z.preprocess((val) => !!val, z.boolean().default(false)),
    jornadaParticipante: z.preprocess((val) => !!val, z.boolean().default(false)),
    idFaixaAutoridade: ZodIdOptional,
    idFaixaAtivacao: ZodIdOptional,
    idPacoteServico: ZodIdOptional,
    idNivelContratacao: ZodIdOptional,

    mapFile: z
      .any()
      .refine((files) => {
        if (!files || files.length === 0) return true;
        return files[0]?.size <= MAX_FILE_SIZE;
      }, `O tamanho máximo é 10MB.`)
      .refine((files) => {
        if (!files || files.length === 0) return true;
        return ACCEPTED_IMAGE_TYPES.includes(files[0]?.type);
      }, "Formato inválido. Apenas .jpg, .png e .pdf são aceitos.")
      .optional(),
  })
  // Validação: Data Final > Inicial (OK)
  .refine(
    (data) => {
      if (!data.dataInicio || !data.dataFim) return true;
      return new Date(data.dataFim) > new Date(data.dataInicio);
    },
    {
      message: "A data final deve ser posterior à inicial",
      path: ["dataFim"],
    },
  )
  // Validação Condicional: País/Estado obrigatórios se Externo (CORRIGIDO OS PATHS)
  .superRefine((data, ctx) => {
    // console.log("Validation Data:", {
    //   isExternal: data.isExternal,
    //   idEspaco: data.idEspaco,
    //   type: typeof data.idEspaco,
    // });
    if (data.isExternal) {
      // ... (existing comments)
    } else {
      if (!data.idEspaco) {
        // console.log(
        //   "Validation Failed: idEspaco is required for internal location",
        // );
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Espaço é obrigatório para local interno",
          path: ["idEspaco"],
        });
      }
    }
  });

export type FormularioEventosData = z.infer<typeof formularioEventosData>;
