"use client";
import { ResponsivePie } from "@nivo/pie";

export interface DataPieProps {
  id: string;
  label: string;
  value: number;
  color?: string;
}

function truncateLabel(label: string, max = 16) {
  return label.length > max ? label.slice(0, max) + "..." : label;
}

interface PieProps {
  data: DataPieProps[];
  isDonut?: boolean;
  showLinkLabels?: boolean;
  onClick?: (datum: any, event: React.MouseEvent) => void;
  activeIds?: string[]; // ids das fatias ativas para aplicar pattern
  valueFormat?: (value: number) => string;
}

export function Pie({
  data,
  isDonut,
  showLinkLabels = true,
  onClick,
  activeIds,
  valueFormat,
}: PieProps) {
  return (
    <ResponsivePie
      data={data}
      margin={{
        top: 32,
        right: window.innerWidth < 768 ? 24 : 80,
        bottom: window.innerWidth < 768 ? 24 : 80,
        left: window.innerWidth < 768 ? 24 : 80,
      }}
      innerRadius={isDonut ? 0.5 : undefined}
      padAngle={0.6}
      cornerRadius={2}
      activeOuterRadiusOffset={8}
      enableArcLinkLabels={showLinkLabels}
      arcLinkLabelsSkipAngle={10}
      arcLinkLabelsTextColor="#333333"
      arcLinkLabelsThickness={2}
      arcLinkLabelsColor={{ from: "color" }}
      arcLabelsSkipAngle={10}
      arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
      enableArcLabels={false}
      arcLinkLabel={(d) => truncateLabel(String(d.label))}
      tooltip={({ datum }) => (
        <div
          className="p-2 bg-white rounded shadow text-xs"
          style={{
            whiteSpace: "normal",
            minWidth: 120,
            maxWidth: 250,
            zIndex: 9999,
          }}
        >
          <strong>{datum.label}</strong>:{" "}
          {valueFormat
            ? valueFormat(datum.value)
            : Intl.NumberFormat("pt-br").format(datum.value)}
        </div>
      )}
      valueFormat={(value) =>
        valueFormat
          ? valueFormat(value)
          : Intl.NumberFormat("pt-br").format(value)
      }
      animate={false}
      onClick={onClick}
      defs={[
        {
          id: "dots",
          type: "patternDots",
          background: "inherit",
          color: "#fff",
          size: 6,
          padding: 2,
          stagger: true,
        },
        {
          id: "lines",
          type: "patternLines",
          background: "inherit",
          color: "rgba(255,255,255,0.4)",
          rotation: -45,
          lineWidth: 6,
          spacing: 10,
        },
      ]}
      fill={
        activeIds && activeIds.length > 0
          ? [
              {
                match: (d) => activeIds.includes(String(d.id)),
                id: "lines",
              },
            ]
          : []
      }
    />
  );
}

/**
 * Componente de gráfico de pizza com legenda lateral opcional.
 * @param showLegend - se false, oculta a legenda lateral (default: true)
 * @param showLinkLabels - se false, oculta os arc link labels (default: true)
 */
interface PieWithLegendProps {
  data: DataPieProps[];
  isDonut?: boolean;
  legendWidth?: number;
  showLegend?: boolean;
  showLinkLabels?: boolean;
}

export function PieWithLegend({
  data,
  isDonut,
  legendWidth = 160,
  showLegend = true,
  showLinkLabels = true,
}: PieWithLegendProps) {
  return (
    <div className="flex w-full h-full min-h-[220px]">
      <div className="flex-1">
        <ResponsivePie
          data={data}
          margin={{
            top: 32,
            right: showLegend ? legendWidth + 16 : 32,
            bottom: 32,
            left: 32,
          }}
          innerRadius={isDonut ? 0.5 : undefined}
          padAngle={0.6}
          cornerRadius={2}
          activeOuterRadiusOffset={8}
          enableArcLinkLabels={showLinkLabels}
          arcLinkLabelsSkipAngle={10}
          arcLinkLabelsTextColor="#333333"
          arcLinkLabelsThickness={2}
          arcLinkLabelsColor={{ from: "color" }}
          arcLabelsSkipAngle={10}
          arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
          enableArcLabels={false}
          arcLinkLabel={(d) => truncateLabel(String(d.label))}
          tooltip={({ datum }) => (
            <div
              className="p-2 bg-white rounded shadow text-xs max-w-xs break-words"
              style={{
                whiteSpace: "normal",
                wordBreak: "break-word",
                maxWidth: 200,
                zIndex: 9999,
              }}
            >
              <strong>{datum.label}</strong>:{" "}
              {Intl.NumberFormat("pt-br").format(datum.value)}
            </div>
          )}
          valueFormat={(value) => Intl.NumberFormat("pt-br").format(value)}
        />
      </div>
      {showLegend && (
        <div
          className="overflow-y-auto pl-2"
          style={{ width: legendWidth, maxHeight: 260 }}
          aria-label="Legenda do gráfico"
        >
          {data.map((item) => (
            <div
              key={item.id}
              className="flex items-center mb-1"
              tabIndex={0}
              aria-label={`${item.label}: ${item.value}`}
            >
              <span
                className="inline-block w-3 h-3 rounded mr-2"
                style={{ background: item.color || "#888" }}
                aria-hidden="true"
              />
              <span className="truncate text-xs" title={item.label}>
                {item.label}
              </span>
              <span className="ml-auto text-xs font-semibold">
                {Intl.NumberFormat("pt-br").format(item.value)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
