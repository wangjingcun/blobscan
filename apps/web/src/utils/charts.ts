import type { EChartOption } from "echarts";

import dayjs from "@blobscan/dayjs";

import { getHumanDate as humanDateFormatter } from "./date";
import { abbreviateNumber as abbreviateNumberFormatter } from "./number";

type ExtendedFormat = EChartOption.Tooltip.Format & { name?: string };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ValueFormatter = (value: any) => unknown;

function applyFormatter(value?: unknown, formatter?: ValueFormatter) {
  return value ? (formatter ? formatter(value) : value) : "Unknown value";
}

function buildYAxisHtml(param: ExtendedFormat, formatter?: ValueFormatter) {
  return `<span>${param.marker} ${param.seriesName}: <strong>${applyFormatter(
    param.value,
    formatter
  )}</strong><span/>`;
}

function buildXAxisHtml(param?: ExtendedFormat, formatter?: ValueFormatter) {
  return `${applyFormatter(param?.name, formatter)}`;
}

export function dateAxisFormatter(date: string | Date) {
  return dayjs(date).format("MMM DD");
}

export function createTooltip(
  xAxisFormatter?: ValueFormatter,
  yAxisFormatter?: ValueFormatter
): EChartOption["tooltip"] {
  return {
    formatter: (paramOrParams) => {
      if (Array.isArray(paramOrParams)) {
        const [firstParam] = paramOrParams;
        const yAxisElement = buildXAxisHtml(firstParam, xAxisFormatter);
        const xAxisElements = paramOrParams.map((p) =>
          buildYAxisHtml(p, yAxisFormatter)
        );

        return `${yAxisElement}</br>${xAxisElements.join("<br/>")}`;
      } else {
        const xAxisElement = buildYAxisHtml(paramOrParams, yAxisFormatter);
        const yAxisElement = buildXAxisHtml(paramOrParams, xAxisFormatter);

        return `${yAxisElement}</br>${xAxisElement}`;
      }
    },
    extraCssText: "font-size: 0.80rem;",
  };
}

export type TimeSeriesInput = Partial<{
  dates: string[];
  axisFormatters: Partial<{
    xAxisLabel: ValueFormatter;
    xAxisTooltip: ValueFormatter;
    yAxisLabel: ValueFormatter;
    yAxisTooltip: ValueFormatter;
  }>;
}>;

export function buildTimeSeriesOptions({
  dates,
  axisFormatters,
}: TimeSeriesInput): EChartOption {
  const {
    xAxisLabel = dateAxisFormatter,
    xAxisTooltip = humanDateFormatter,
    yAxisLabel = abbreviateNumberFormatter,
    yAxisTooltip,
  } = axisFormatters || {};
  return {
    xAxis: {
      type: "category",
      data: dates,
      axisLabel: {
        formatter: xAxisLabel,
      },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        formatter: yAxisLabel,
      },
    },
    tooltip: createTooltip(xAxisTooltip, yAxisTooltip),
  };
}
