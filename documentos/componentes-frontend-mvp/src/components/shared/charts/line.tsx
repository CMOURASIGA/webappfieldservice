import { ResponsiveLine } from "@nivo/line";
import { DataLineProps } from "./_types";

interface BarChartProps {
  data: DataLineProps[];
  enableLegends?: boolean;
  yFormat?: string;
}
export const LineChart = ({
  data,
  enableLegends = false,
  yFormat,
}: BarChartProps) => (
  <ResponsiveLine
    data={data}
    margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
    yScale={{
      type: "linear",
      min: "auto",
      max: "auto",
      stacked: true,
      reverse: false,
    }}
    pointSize={10}
    pointBorderWidth={2}
    pointLabelYOffset={-12}
    enableTouchCrosshair={true}
    useMesh={true}
    yFormat={yFormat}
    legends={
      enableLegends
        ? [
            {
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
  />
);
