"use client";
import { BarTooltipProps, ResponsiveBar } from "@nivo/bar";
import { DataBarProps } from "./_types";

/**
 * @typedef {Object} BarChartProps - Propriedades para o componente BarChart.
 * @property {DataBarProps[]} data - Os dados a serem exibidos no gráfico de barras.
 * @property {string[]} keys - As chaves dos valores a serem exibidos como barras (ex: ['value', 'value2']).
 * @property {string} indexBy - A propriedade do objeto de dados a ser usada como índice para as barras (ex: 'id', 'estado').
 * @property {'horizontal' | 'vertical'} [layout='vertical'] - A orientação do layout do gráfico (vertical ou horizontal).
 * @property {boolean} [showGridY=true] - Se a grade no eixo Y deve ser exibida.
 * @property {boolean} [showGridX=false] - Se a grade no eixo X deve ser exibida.
 * @property {boolean} [enableLabel=true] - Se os rótulos de valor devem ser exibidos nas barras.
 * @property {(value: number) => string} [valueFormat] - Uma função opcional para formatar os valores exibidos nos rótulos e tooltips.
 * @property {string} [axisBottomLegend] - O texto da legenda para o eixo inferior.
 * @property {string} [axisLeftLegend] - O texto da legenda para o eixo esquerdo.
 */
interface BarChartProps {
  data: DataBarProps[];
  keys?: string[];
  indexBy: string;
  layout?: "horizontal" | "vertical";
  showGridY?: boolean;
  showGridX?: boolean;
  enableLabel?: boolean;
  enableLegends?: boolean;
  valueFormat?: (value: number) => string;
  axisBottomLegend?: string;
  axisLeftLegend?: string;
  groupMode?: "stacked" | "grouped";
  colors?: any;
}

/**
 * Componente de tooltip customizado para o gráfico de barras.
 * Exibe o ID do item, o valor formatado e uma bolinha colorida.
 * @param {BarTooltipProps<DataBarProps>} props - As propriedades do tooltip fornecidas pelo Nivo.
 * @returns {JSX.Element} Um elemento JSX que representa o tooltip.
 */
const CustomBarTooltip = ({
  id,
  value,
  indexValue,
  color,
}: BarTooltipProps<DataBarProps>) => (
  <div className="p-2 rounded text-xs bg-white flex gap-2 items-center shadow-md">
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
    <span>
      <strong>{indexValue}:</strong> {Intl.NumberFormat("pt-br").format(value)}
    </span>
  </div>
);

/**
 * Um componente reutilizável para renderizar gráficos de barras usando Nivo.
 * Suporta layouts vertical e horizontal, customização de eixos e formatação de valores.
 *
 * @component
 * @param {BarChartProps} props - As propriedades para configurar o gráfico de barras.
 * @returns {JSX.Element} Um gráfico de barras responsivo.
 *
 * @example
 * ```tsx
 * import { BarChart } from './BarChart';
 * import { DataBarProps } from './_types';
 *
 * const myData: DataBarProps[] = [
 * { id: "Produto A", value: 1500 },
 * { id: "Produto B", value: 2300 },
 * { id: "Produto C", value: 800 }
 * ];
 *
 * function MyComponent() {
 * return (
 * <div style={{ height: '300px', width: '500px' }}>
 *  <BarChart
 *      data={myData}
 *      keys={['value']}
 *      indexBy="id"
 *      axisBottomLegend="Produtos"
 *      axisLeftLegend="Vendas"
 *      valueFormat={(value) => `R$ ${value.toFixed(2)}`}
 *  />
 * </div>
 * );
 * }
 * ```
 */
export const BarChart = ({
  data,
  keys,
  indexBy,
  layout = "vertical",
  showGridY = true,
  showGridX = false,
  enableLabel = true,
  enableLegends = false,
  groupMode = "stacked",
  valueFormat,
  axisBottomLegend,
  axisLeftLegend,
  colors = ["#475569"],
}: BarChartProps) => {
  const defaultFormat = (value: number) =>
    Intl.NumberFormat("pt-br").format(value);
  const format = valueFormat || defaultFormat;

  return (
    <ResponsiveBar
      data={data}
      keys={keys}
      groupMode={groupMode}
      indexBy={indexBy}
      margin={{
        top: 30,
        right: 50,
        bottom: layout === "vertical" ? 50 : 30,
        left: layout === "vertical" ? 50 : 80,
      }}
      padding={0.3}
      valueScale={{ type: "linear" }}
      indexScale={{ type: "band", round: true }}
      colors={colors}
      borderColor={{
        from: "color",
        modifiers: [["darker", 1.6]],
      }}
      axisTop={null}
      axisRight={null}
      axisBottom={
        layout === "vertical"
          ? {
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: axisBottomLegend,
              legendPosition: "middle",
              legendOffset: 32,
            }
          : null
      }
      axisLeft={
        layout === "horizontal"
          ? {
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: axisLeftLegend,
              legendPosition: "middle",
              legendOffset: -40,
            }
          : {
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: axisLeftLegend,
              legendPosition: "middle",
              legendOffset: -40,
              format: (value: number) => {
                if (value >= 1000) {
                  return `${value / 1000}K`;
                }
                return `${value}`;
              },
            }
      }
      labelPosition="end"
      legends={
        enableLegends
          ? [
              {
                dataFrom: "keys",
                anchor: "bottom-left",
                direction: "row",
                translateX: 30,
                translateY: 50,
                itemWidth: 125,
                itemHeight: 30,
                itemsSpacing: 2,
              },
            ]
          : []
      }
      enableGridX={showGridX}
      enableGridY={showGridY}
      enableLabel
      labelTextColor={{
        from: "color",
        modifiers: [["darker", 2]],
      }}
      labelOffset={16}
      role="application"
      barAriaLabel={(e) =>
        `${e.id}: ${e.formattedValue} in country: ${e.indexValue}`
      }
      layout={layout}
      valueFormat={format}
      tooltip={({ id, value, indexValue, color }) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "#f8fbff", // fundo azul bem claro
            border: "1px solid #dbeafe", // azul claro (ex: border-blue-100)
            borderRadius: 6,
            padding: "6px 14px",
            color: "#1e293b", // azul-escuro (ex: text-slate-800)
            fontWeight: 500,
            fontSize: 15,
            whiteSpace: "nowrap",
            boxShadow: "0 2px 8px 0 rgba(30,41,59,0.04)",
          }}
        >
          <span style={{ color: "#2563eb", fontWeight: 700, fontSize: 18 }}>
            ■
          </span>
          <span>
            <strong>{indexValue}</strong>
            {" — "}
            <span style={{ fontWeight: 800 }}>
              {Number(value).toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </span>
          </span>
        </div>
      )}
    />
  );
};
