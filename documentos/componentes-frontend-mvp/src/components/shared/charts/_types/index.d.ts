export interface DataPieProps {
  id: string;
  value: number;
  label: string;
  color?: string;
}

/**
 * @typedef {Object} DataBarProps - Propriedades de um ponto de dados para o gráfico de barras do Nivo.
 * @property {string} id - O identificador único da barra (ex: 'AL', 'Jan').
 * @property {number} value - O valor numérico da barra.
 * @property {string} [label] - Um rótulo opcional para o item.
 * @property {string} [color] - A cor opcional da barra.
 * @property {any} [rest] - Quaisquer outras propriedades dinâmicas que o Nivo possa precisar.
 */
export interface DataBarProps {
  id: string;
  value: number;
  label?: string;
  color?: string;
  [key: string]: any;
}

export interface DataLineProps {
  id: string;
  data: { x: string; y: number }[];
}
