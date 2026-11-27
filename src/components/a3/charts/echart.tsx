"use client";

import { useEffect, useRef } from "react";
import * as echarts from "echarts/core";
import { BarChart, CustomChart, LineChart, ScatterChart } from "echarts/charts";
import {
  GridComponent,
  LegendComponent,
  MarkAreaComponent,
  MarkLineComponent,
  TooltipComponent,
} from "echarts/components";
import { SVGRenderer } from "echarts/renderers";
import type { EChartsOption } from "echarts";

echarts.use([
  BarChart,
  CustomChart,
  LineChart,
  ScatterChart,
  GridComponent,
  LegendComponent,
  MarkAreaComponent,
  MarkLineComponent,
  TooltipComponent,
  SVGRenderer,
]);

/** Draws one ECharts option. SVG keeps the chart sharp when printed or exported later. */
export function EChart({ option, height = 220, label }: { option: EChartsOption; height?: number; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const chart = echarts.init(el, null, { renderer: "svg" });
    // ECharts measures labels on a canvas, which can't resolve "inherit": give it the page font.
    const fontFamily = getComputedStyle(el).fontFamily;
    chart.setOption({ ...option, textStyle: { ...(option.textStyle as object), fontFamily } });
    const observer = new ResizeObserver(() => chart.resize());
    observer.observe(el);
    return () => {
      observer.disconnect();
      chart.dispose();
    };
  }, [option]);
  return <div ref={ref} role="img" aria-label={label} style={{ height }} className="w-full" />;
}
