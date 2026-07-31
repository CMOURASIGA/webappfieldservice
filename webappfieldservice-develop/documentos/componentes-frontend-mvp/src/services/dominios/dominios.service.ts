// src/services/dominios.service.ts

import { api } from "../api";

// Interface para garantir a tipagem das opções que o SelectField espera
// Interface para garantir a tipagem das opções que o SelectField espera
export interface OptionItem {
  label: string;
  value: string; // Mantemos string aqui, pois você usou toString() no mapToOption
  idLocal?: number; // ID do local associado (para espaços)
}

// Interface para o retorno completo de todos os domínios
export interface DomainOptions {
  frequencias: OptionItem[];
  situacoes: OptionItem[];
  espacos: OptionItem[];
  tamanhos: OptionItem[];
  formatos: OptionItem[];
  complexidades: OptionItem[];
  fases: OptionItem[];
  tipos: OptionItem[];
  tiposEspaco: OptionItem[];
  produtores: OptionItem[];
  demandantes: OptionItem[];
  categorias: OptionItem[];
  categoriasEventos: OptionItem[];
  eventos: OptionItem[];
  entidades: OptionItem[];
  locais: OptionItem[];
  segmentos: OptionItem[];
  segmentosPublicos: OptionItem[];
  publicosAlvo: OptionItem[];
  classificacoes: OptionItem[];
  tematicas: OptionItem[]; // Adicionado tematicas
  numeroParticipantes: OptionItem[];
  faixasAutoridades: OptionItem[];
  faixasAtivacoes: OptionItem[];
  pacotesServicos: OptionItem[];
  niveisContratacao: OptionItem[];

  // Adicione outros domínios aqui, se necessário (segmento, categoria, etc)
}

/**
 * Função utilitária para mapear o retorno do Backend (que tem {id, nome})
 * para o formato do Frontend ({label, value}).
 * @param items Array de objetos com {id, nome}.
 * @returns Array de objetos com {label, value}.
 */
function mapToOption(items: any[]): OptionItem[] {
  if (!Array.isArray(items)) return [];

  return items.map((item) => ({
    label: item.nome, // Nome da tabela auxiliar
    value: String(item.id), // ID do item (Convertido para string para o SelectField)
  }));
}

const DOMINIOS_BASE_PATH = "/dominios"; // Ajuste conforme seu Controller

export async function getFrequencias(): Promise<OptionItem[]> {
  try {
    // Chamada direta ao endpoint de Frequencias
    const response = await api.get(`${DOMINIOS_BASE_PATH}/frequencias`);

    return response.data;
  } catch (error) {
    console.error("Erro ao carregar Frequências:", error);
    return [];
  }
}

export async function getSituacoes(): Promise<OptionItem[]> {
  try {
    const response = await api.get(`${DOMINIOS_BASE_PATH}/situacoes`);
    return response.data;
  } catch (error) {
    console.error("Erro ao carregar Situações:", error);
    return [];
  }
}

export async function getEspacos(): Promise<OptionItem[]> {
  try {
    const response = await api.get(`${DOMINIOS_BASE_PATH}/espacos`);

    return response.data;
  } catch (error) {
    console.error("Erro ao carregar Espaços:", error);
    return [];
  }
}

export async function getTamanhos(): Promise<OptionItem[]> {
  try {
    const response = await api.get(`${DOMINIOS_BASE_PATH}/tamanhos`);
    return response.data;
  } catch (error) {
    console.error("Erro ao carregar Tamanhos:", error);
    return [];
  }
}

export async function getFormatos(): Promise<OptionItem[]> {
  try {
    const response = await api.get(`${DOMINIOS_BASE_PATH}/formatos`);
    return response.data;
  } catch (error) {
    console.error("Erro ao carregar Formatos:", error);
    return [];
  }
}

export async function getComplexidades(): Promise<OptionItem[]> {
  try {
    const response = await api.get(`${DOMINIOS_BASE_PATH}/complexidades`);
    return response.data;
  } catch (error) {
    console.error("Erro ao carregar Complexidades:", error);
    return [];
  }
}

export async function getNiveisAssessoria(): Promise<OptionItem[]> {
  try {
    const response = await api.get(`${DOMINIOS_BASE_PATH}/niveis-assessoria`);
    return response.data;
  } catch (error) {
    console.error("Erro ao carregar Níveis de Assessoria:", error);
    return [];
  }
}

export async function getFasesProjeto(): Promise<OptionItem[]> {
  try {
    const response = await api.get(`${DOMINIOS_BASE_PATH}/fases`);

    return response.data;
  } catch (error) {
    console.error("Erro ao carregar Fases de Projeto:", error);
    return [];
  }
}

export async function getTiposEspaco(): Promise<OptionItem[]> {
  try {
    const response = await api.get(`${DOMINIOS_BASE_PATH}/tipos-espaco`);
    return response.data;
  } catch (error) {
    console.error("Erro ao carregar Tipos de Espaço:", error);
    return [];
  }
}

export async function getTipos(): Promise<OptionItem[]> {
  try {
    const response = await api.get(`${DOMINIOS_BASE_PATH}/tipos`);
    return response.data;
  } catch (error) {
    console.error("Erro ao carregar Tipos:", error);
    return [];
  }
}
export async function getDemandantes(): Promise<OptionItem[]> {
  try {
    const response = await api.get(`${DOMINIOS_BASE_PATH}/demandantes`);
    return response.data;
  } catch (error) {
    console.error("Erro ao carregar Demandantes:", error);
    return [];
  }
}

export async function getNumeroParticipantes(): Promise<OptionItem[]> {
  try {
    const response = await api.get(`${DOMINIOS_BASE_PATH}/numeroparticipantes`);
    return response.data;
  } catch (error) {
    console.error("Erro ao carregar Numero de Participantes:", error);
    return [];
  }
}
export async function getTematicas(): Promise<OptionItem[]> {
  try {
    const response = await api.get(`${DOMINIOS_BASE_PATH}/tematicas`);
    return response.data;
  } catch (error) {
    console.error("Erro ao carregar Temáticas:", error);
    return [];
  }
}
export async function getCategorias(): Promise<OptionItem[]> {
  try {
    const response = await api.get(`${DOMINIOS_BASE_PATH}/categorias`);
    return response.data;
  } catch (error) {
    console.error("Erro ao carregar Categoria:", error);
    return [];
  }
}
export async function getCategoriasEventos(): Promise<OptionItem[]> {
  try {
    const response = await api.get(`${DOMINIOS_BASE_PATH}/categorias-eventos`);
    return response.data;
  } catch (error) {
    console.error("Erro ao carregar CategoriaEvento:", error);
    return [];
  }
}
export async function getProdutores(): Promise<OptionItem[]> {
  return [
    { label: "Produtor A", value: "10" },
    { label: "Produtor B", value: "20" },
  ];
}
export async function getEventos(): Promise<OptionItem[]> {
  try {
    const response = await api.get(`${DOMINIOS_BASE_PATH}/eventos`);
    return response.data;
  } catch (error) {
    console.error("Erro ao carregar Categoria:", error);
    return [];
  }
}
export async function getLocais(): Promise<OptionItem[]> {
  try {
    const response = await api.get(`${DOMINIOS_BASE_PATH}/locais`);
    return response.data;
  } catch (error) {
    console.error("Erro ao carregar Locais:", error);
    return [];
  }
}
export async function getEntidades(): Promise<OptionItem[]> {
  try {
    const response = await api.get(`${DOMINIOS_BASE_PATH}/entidades`);
    return response.data;
  } catch (error) {
    console.error("Erro ao carregar Entidades:", error);
    return [];
  }
}
export async function getSegmentos(): Promise<OptionItem[]> {
  try {
    const response = await api.get(`${DOMINIOS_BASE_PATH}/segmento`);
    return response.data;
  } catch (error) {
    console.error("Erro ao carregar Entidades:", error);
    return [];
  }
}
export async function getSegmentosPublico(): Promise<OptionItem[]> {
  try {
    const response = await api.get(`${DOMINIOS_BASE_PATH}/segmento-publico`);
    return response.data;
  } catch (error) {
    console.error("Erro ao carregar Entidades:", error);
    return [];
  }
}
export async function getPublicoAlvo(): Promise<OptionItem[]> {
  try {
    const response = await api.get(`${DOMINIOS_BASE_PATH}/publico-alvo`);
    return response.data;
  } catch (error) {
    console.error("Erro ao carregar Entidades:", error);
    return [];
  }
}
export async function getClassificacao(): Promise<OptionItem[]> {
  try {
    const response = await api.get(`${DOMINIOS_BASE_PATH}/classificacao`);
    return response.data;
  } catch (error) {
    console.error("Erro ao carregar Entidades:", error);
    return [];
  }
}

export async function getAllDominios(): Promise<DomainOptions> {
  const response = await Promise.all([
    getFrequencias(),
    getSituacoes(),
    getEspacos(),
    getTamanhos(),
    getFormatos(),
    getComplexidades(),
    getFasesProjeto(),
    getTipos(),
    getTiposEspaco(),
    getProdutores(),
    getDemandantes(),
    getCategorias(),
    getCategoriasEventos(),
    getEventos(),
    getLocais(),
    getEntidades(),
    getSegmentos(),
    getSegmentosPublico(),
    getPublicoAlvo(),
    getClassificacao(),
    getTematicas(), // Adicionado chamada
    getNumeroParticipantes(),
    getFaixasAutoridades(),
    getFaixasAtivacoes(),
    getPacotesServicos(),
    getNiveisContratacao(),
  ]);
  const [
    frequencias,
    situacoes,
    espacos,
    tamanhos,
    formatos,
    complexidades,
    fases,
    tipos,
    tiposEspaco,
    produtores,
    demandantes,
    categorias,
    categoriasEventos,
    eventos,
    locais,
    entidades,
    segmentos,
    segmentosPublicos,
    publicosAlvo,
    classificacoes,
    tematicas, // Adicionado destructuring
    numeroParticipantes,
    faixasAutoridades,
    faixasAtivacoes,
    pacotesServicos,
    niveisContratacao,
  ] = response;
  return {
    frequencias,
    situacoes,
    espacos,
    tamanhos,
    formatos,
    complexidades,
    fases,
    tipos,
    tiposEspaco,
    produtores,
    demandantes,
    categorias,
    categoriasEventos,
    eventos,
    locais,
    entidades,
    segmentos,
    segmentosPublicos,
    publicosAlvo,
    classificacoes,
    tematicas, // Adicionado retorno
    numeroParticipantes,
    faixasAutoridades,
    faixasAtivacoes,
    pacotesServicos,
    niveisContratacao,
  };
}

export async function getStatus(): Promise<OptionItem[]> {
  try {
    const response = await api.get(`${DOMINIOS_BASE_PATH}/status`);
    return response.data;
  } catch (error) {
    console.error("Erro ao carregar Status:", error);
    return [];
  }
}

export async function getFaixasAutoridades(): Promise<OptionItem[]> {
  try {
    const response = await api.get(`${DOMINIOS_BASE_PATH}/faixas-autoridades`);
    return response.data;
  } catch (error) {
    console.error("Erro ao carregar Faixas de Autoridades:", error);
    return [];
  }
}

export async function getFaixasAtivacoes(): Promise<OptionItem[]> {
  try {
    const response = await api.get(`${DOMINIOS_BASE_PATH}/faixas-ativacoes`);
    return response.data;
  } catch (error) {
    console.error("Erro ao carregar Faixas de Ativações:", error);
    return [];
  }
}

export async function getPacotesServicos(): Promise<OptionItem[]> {
  try {
    const response = await api.get(`${DOMINIOS_BASE_PATH}/pacotes-servicos`);
    return response.data;
  } catch (error) {
    console.error("Erro ao carregar Pacotes de Serviços:", error);
    return [];
  }
}

export async function getNiveisContratacao(): Promise<OptionItem[]> {
  try {
    const response = await api.get(`${DOMINIOS_BASE_PATH}/niveis-contratacao`);
    return response.data;
  } catch (error) {
    console.error("Erro ao carregar Níveis de Contratação:", error);
    return [];
  }
}



export async function createDemandante(
  nome: string,
): Promise<OptionItem | null> {
  try {
    const response = await api.post(`${DOMINIOS_BASE_PATH}/demandantes`, {
      nome,
    });
    return {
      label: response.data.nome,
      value: String(response.data.id),
    };
  } catch (error) {
    console.error("Erro ao criar Demandante:", error);
    return null;
  }
}

export async function createTematica(
  nome: string,
): Promise<OptionItem | null> {
  try {
    const response = await api.post(`${DOMINIOS_BASE_PATH}/tematicas`, {
      nome,
    });
    return {
      label: response.data.label, // O backend retorna { label, value } agora
      value: response.data.value,
    };
  } catch (error) {
    console.error("Erro ao criar Temática:", error);
    return null;
  }
}

