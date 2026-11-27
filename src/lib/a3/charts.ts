// ECharts options for the A3 charts, built only from a saved A3 document so the
// charts always redraw from the version on screen. Pure functions, no DOM.
// Colours follow the categorical and status palettes in the dataviz guide:
// series take slots in fixed order, status colours only mean status.
import type { EChartsOption } from "echarts";
import type { A3Document } from "./schema";

export const INK = { primary: "#191919", secondary: "#666666", grid: "#e7e7e7", surface: "#ffffff" };
export const SERIES = { blue: "#257de0", orange: "#f47230", aqua: "#00b894" };
export const STATUS = { good: "#0aac23", warning: "#fbb315", critical: "#dc3c3d", neutral: "#9ca3af" };

type Metric = A3Document["metrics"][number];

const base = {
  animation: false,
  textStyle: { color: INK.primary, fontSize: 11 },
  // Keeps axis labels inside the chart (ECharts 6 replacement for containLabel).
  grid: { left: 8, right: 16, top: 28, bottom: 8, outerBoundsMode: "same", outerBoundsContain: "axisLabel", outerBoundsClampWidth: "60%" },
} satisfies EChartsOption;

const axisCommon = {
  axisLine: { lineStyle: { color: INK.grid } },
  axisTick: { show: false },
  axisLabel: { color: INK.secondary, hideOverlap: true },
  splitLine: { lineStyle: { color: INK.grid } },
};

/** A value axis that always shows the given reference values, not just the data range. */
function rangeIncluding(values: number[]) {
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const pad = (hi - lo || Math.abs(hi) || 1) * 0.1;
  return { min: Math.floor(lo - pad), max: Math.ceil(hi + pad) };
}

function refLine(name: string, value: number, unit: string, color = INK.secondary) {
  return {
    name,
    yAxis: value,
    lineStyle: { color, type: "dashed" as const, width: 1.5 },
    label: { formatter: `${name} ${fmt(value)}${unit ? ` ${unit}` : ""}`, color: INK.secondary, position: "insideEndTop" as const },
  };
}

export function fmt(n: number): string {
  return Number.isInteger(n) ? n.toLocaleString("en-GB") : n.toLocaleString("en-GB", { maximumFractionDigits: 2 });
}

export function findMetric(doc: A3Document, id: string | null | undefined): Metric | undefined {
  return id ? doc.metrics.find((m) => m.id === id) : undefined;
}

/** The newest value in a metric's series, if it has any. */
export function latestValue(metric: Metric | undefined): { date: string; value: number } | undefined {
  if (!metric || metric.series.length === 0) return undefined;
  return [...metric.series].sort((a, b) => a.date.localeCompare(b.date)).at(-1);
}

/** Current condition: the gap metric over time against the standard, with the gap shaded. */
export function currentConditionRunChart(doc: A3Document): EChartsOption | null {
  const gap = doc.currentCondition.gap;
  const metric = findMetric(doc, gap?.metricId);
  if (!gap || !metric || metric.series.length === 0) return null;
  const unit = gap.unit || metric.unit;
  const [lo, hi] = [Math.min(gap.standardValue, gap.actualValue), Math.max(gap.standardValue, gap.actualValue)];
  return {
    ...base,
    tooltip: { trigger: "axis", valueFormatter: (v) => `${fmt(Number(v))} ${unit}` },
    xAxis: { type: "time", ...axisCommon, splitNumber: 3, axisLabel: { ...axisCommon.axisLabel, formatter: "{d} {MMM}" }, splitLine: { show: false } },
    yAxis: {
      type: "value",
      ...axisCommon,
      ...rangeIncluding([...metric.series.map((p) => p.value), gap.standardValue, gap.actualValue]),
      axisLabel: { ...axisCommon.axisLabel, formatter: (v: number) => `${fmt(v)} ${unit}` },
    },
    series: [
      {
        name: metric.name,
        type: "line",
        data: sorted(metric.series).map((p) => [p.date, p.value]),
        lineStyle: { width: 2, color: SERIES.blue },
        itemStyle: { color: SERIES.blue },
        symbolSize: 6,
        markLine: { symbol: "none", silent: true, data: [refLine("Standard", gap.standardValue, unit)] },
        markArea: {
          silent: true,
          itemStyle: { color: "rgba(220, 60, 61, 0.08)" },
          label: { color: INK.secondary, position: "insideTopLeft", formatter: `Gap ${fmt(hi - lo)} ${unit}` },
          data: [[{ yAxis: lo }, { yAxis: hi }]],
        },
      },
    ],
  };
}

/** A breakdown or Pareto: bars sorted largest first, labelled with value and running share. */
export function paretoChart(categories: { label: string; value: number }[], unitLabel = ""): EChartsOption | null {
  const items = categories.filter((c) => c.label.trim() && Number.isFinite(c.value)).sort((a, b) => b.value - a.value);
  if (items.length === 0) return null;
  const total = items.reduce((s, c) => s + c.value, 0);
  let running = 0;
  const labels = items.map((c) => {
    running += c.value;
    return total > 0 ? `${fmt(c.value)} · ${Math.round((running / total) * 100)}% cum.` : fmt(c.value);
  });
  return {
    ...base,
    grid: { ...base.grid, right: 96 },
    tooltip: { trigger: "item", formatter: (p) => `${(p as { name: string }).name}: ${labels[(p as { dataIndex: number }).dataIndex]}${unitLabel}` },
    xAxis: { type: "value", ...axisCommon },
    yAxis: { type: "category", inverse: true, data: items.map((c) => c.label), ...axisCommon, splitLine: { show: false } },
    series: [
      {
        type: "bar",
        data: items.map((c) => c.value),
        barMaxWidth: 18,
        itemStyle: { color: SERIES.blue, borderRadius: [0, 4, 4, 0] },
        label: { show: true, position: "right", color: INK.secondary, formatter: (p) => labels[p.dataIndex] },
      },
    ],
  };
}

/** Goal: where the metric started, where it is now and where it needs to get to. */
export function goalBulletChart(doc: A3Document): EChartsOption | null {
  const g = doc.goal;
  if (g.baseline === null || g.target === null) return null;
  const metric = findMetric(doc, g.metricId);
  const current = latestValue(metric);
  const unit = g.unit || metric?.unit || "";
  const rows = [
    { name: "Baseline", value: g.baseline, color: STATUS.neutral },
    ...(current ? [{ name: `Latest (${current.date})`, value: current.value, color: SERIES.blue }] : []),
    { name: `Target${g.deadline ? ` by ${g.deadline}` : ""}`, value: g.target, color: SERIES.aqua },
  ];
  return {
    ...base,
    grid: { ...base.grid, top: 8, right: 56 },
    tooltip: { trigger: "item", valueFormatter: (v) => `${fmt(Number(v))} ${unit}` },
    xAxis: { type: "value", ...axisCommon },
    yAxis: { type: "category", inverse: true, data: rows.map((r) => r.name), ...axisCommon, splitLine: { show: false } },
    series: [
      {
        type: "bar",
        barMaxWidth: 16,
        data: rows.map((r) => ({ value: r.value, itemStyle: { color: r.color, borderRadius: [0, 4, 4, 0] } })),
        label: { show: true, position: "right", color: INK.secondary, formatter: (p) => `${fmt(Number(p.value))} ${unit}` },
      },
    ],
  };
}

/** Countermeasures: effect (up) against effort (right). Top left is high effect for low effort. */
export function effectEffortMatrix(doc: A3Document): EChartsOption | null {
  const cms = doc.countermeasures.filter((c) => c.description.trim());
  if (cms.length === 0) return null;
  // Labels sit left of points near the right edge so they stay inside the chart.
  const point = (c: (typeof cms)[number], i: number) => ({
    value: [c.effort + jitter(i), c.effect + jitter(i + 3)],
    name: short(c.description),
    label: { position: c.effort >= 4 ? ("left" as const) : ("right" as const) },
  });
  const axis = (name: string) => ({
    type: "value" as const,
    name,
    nameLocation: "middle" as const,
    nameGap: 22,
    nameTextStyle: { color: INK.secondary },
    min: 0,
    max: 6,
    interval: 1,
    ...axisCommon,
    axisLabel: { color: INK.secondary, formatter: (v: number) => (v >= 1 && v <= 5 ? String(v) : "") },
  });
  const label = { show: true, position: "right" as const, color: INK.primary, formatter: "{b}", fontSize: 10 };
  return {
    ...base,
    grid: { left: 36, right: 16, top: 28, bottom: 36, outerBoundsMode: "none" },
    legend: { top: 0, right: 0, textStyle: { color: INK.secondary }, data: ["Chosen", "Option"] },
    tooltip: {
      trigger: "item",
      formatter: (p) => {
        const c = cms.find((x) => short(x.description) === (p as { name: string }).name);
        return c ? `${escapeHtml(c.description)}<br/>Effect ${c.effect} · Effort ${c.effort}` : "";
      },
    },
    xAxis: axis("Effort (1 low – 5 high)"),
    yAxis: axis("Effect"),
    series: [
      {
        name: "Chosen",
        type: "scatter",
        symbolSize: 12,
        itemStyle: { color: SERIES.blue, borderColor: INK.surface, borderWidth: 2 },
        label,
        data: cms.flatMap((c, i) => (c.selected ? [point(c, i)] : [])),
        markArea: {
          silent: true,
          itemStyle: { color: "rgba(0, 184, 148, 0.07)" },
          label: { color: INK.secondary, position: "insideTopLeft", formatter: "Quick wins" },
          data: [[{ coord: [0, 3] }, { coord: [3, 6] }]],
        },
      },
      {
        name: "Option",
        type: "scatter",
        symbolSize: 10,
        itemStyle: { color: INK.surface, borderColor: INK.secondary, borderWidth: 2 },
        label,
        data: cms.flatMap((c, i) => (!c.selected ? [point(c, i)] : [])),
      },
    ],
  };
}

export const ACTION_STATUS_LABEL = {
  not_started: "Not started",
  in_progress: "In progress",
  done: "Done",
  blocked: "Blocked",
} as const;

const ACTION_STATUS_COLOR = {
  not_started: STATUS.neutral,
  in_progress: SERIES.blue,
  done: STATUS.good,
  blocked: STATUS.critical,
} as const;

/** The rows the Gantt chart draws: actions with a due date, oldest start first. */
export function ganttRows(doc: A3Document) {
  return doc.plan
    .filter((a) => a.task.trim() && a.due)
    .map((a) => ({ ...a, startDate: a.start && a.start <= a.due ? a.start : a.due }))
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
}

/** Plan: a Gantt chart with one bar per action, coloured by status and labelled with the owner. */
export function ganttChart(doc: A3Document, today = new Date().toISOString().slice(0, 10)): EChartsOption | null {
  const rows = ganttRows(doc);
  if (rows.length === 0) return null;
  const DAY = 86_400_000;
  const statuses = Object.keys(ACTION_STATUS_LABEL) as (keyof typeof ACTION_STATUS_LABEL)[];
  return {
    ...base,
    grid: { ...base.grid, top: 36, right: 56 },
    legend: { top: 0, left: 0, textStyle: { color: INK.secondary }, data: statuses.map((s) => ACTION_STATUS_LABEL[s]) },
    tooltip: {
      trigger: "item",
      formatter: (p) => {
        const r = rows[(p as { value: number[] }).value[0]];
        return r
          ? `${escapeHtml(r.task)}<br/>${escapeHtml(r.owner?.name ?? "No owner")} · ${r.startDate} to ${r.due}<br/>${ACTION_STATUS_LABEL[r.status]}`
          : "";
      },
    },
    xAxis: {
      type: "time",
      ...axisCommon,
      splitNumber: 4,
      axisLabel: { ...axisCommon.axisLabel, formatter: "{d} {MMM}" },
      splitLine: { show: true, lineStyle: { color: INK.grid } },
    },
    yAxis: {
      type: "category",
      inverse: true,
      data: rows.map((r) => short(r.task, 26)),
      ...axisCommon,
      splitLine: { show: false },
    },
    series: statuses.map((status, si) => ({
      name: ACTION_STATUS_LABEL[status],
      type: "custom" as const,
      itemStyle: { color: ACTION_STATUS_COLOR[status] },
      encode: { x: [1, 2], y: 0 },
      data: rows.flatMap((r, i) =>
        r.status === status ? [[i, Date.parse(r.startDate), Date.parse(r.due) + DAY, r.owner?.name ?? ""]] : [],
      ),
      renderItem: (params, api) => {
        const start = api.coord([api.value(1), api.value(0)]);
        const end = api.coord([api.value(2), api.value(0)]);
        const height = Math.min(16, (api.size?.([0, 1]) as number[])[1] * 0.6);
        const coordSys = params.coordSys as unknown as { x: number; y: number; width: number; height: number };
        const x = Math.max(start[0], coordSys.x);
        const width = Math.max(4, Math.min(end[0], coordSys.x + coordSys.width) - x);
        return {
          type: "group",
          children: [
            {
              type: "rect",
              shape: { x, y: start[1] - height / 2, width, height, r: 4 },
              style: { fill: ACTION_STATUS_COLOR[status] },
            },
            {
              type: "text",
              style: {
                x: x + width + 4,
                y: start[1],
                text: String(api.value(3)),
                fill: INK.secondary,
                fontSize: 10,
                verticalAlign: "middle",
              },
            },
          ],
        };
      },
      ...(si === 0
        ? {
            markLine: {
              symbol: "none",
              silent: true,
              lineStyle: { color: INK.primary, type: "dotted" as const, width: 1 },
              label: { formatter: "Today", color: INK.secondary },
              data: [{ xAxis: today }],
            },
          }
        : {}),
    })),
  };
}

/** Follow-up: the goal's metric with baseline and target, plus predicted and actual results. */
export function followUpRunChart(doc: A3Document): EChartsOption | null {
  const g = doc.goal;
  const metricId = g.metricId ?? doc.followUp.measurements[0]?.metricId;
  const metric = findMetric(doc, metricId);
  const measured = doc.followUp.measurements.filter((m) => m.metricId === metricId);
  const actual = new Map<string, number>();
  for (const p of metric?.series ?? []) actual.set(p.date, p.value);
  for (const m of measured) actual.set(m.date, m.actual);
  const predicted = measured.filter((m) => m.predicted !== undefined).map((m) => [m.date, m.predicted as number]);
  if (actual.size === 0 && predicted.length === 0) return null;
  const unit = g.unit || metric?.unit || "";
  const marks = [
    ...(g.baseline !== null ? [refLine("Baseline", g.baseline, unit)] : []),
    ...(g.target !== null ? [refLine("Target", g.target, unit, SERIES.aqua)] : []),
  ];
  return {
    ...base,
    grid: { ...base.grid, top: 36 },
    legend: { top: 0, left: 0, textStyle: { color: INK.secondary }, data: ["Actual", "Predicted"] },
    tooltip: { trigger: "axis", valueFormatter: (v) => `${fmt(Number(v))} ${unit}` },
    xAxis: { type: "time", ...axisCommon, splitNumber: 3, axisLabel: { ...axisCommon.axisLabel, formatter: "{d} {MMM}" }, splitLine: { show: false } },
    yAxis: {
      type: "value",
      ...axisCommon,
      ...rangeIncluding([
        ...actual.values(),
        ...predicted.map((p) => p[1] as number),
        ...(g.baseline !== null ? [g.baseline] : []),
        ...(g.target !== null ? [g.target] : []),
      ]),
      axisLabel: { ...axisCommon.axisLabel, formatter: (v: number) => `${fmt(v)} ${unit}` },
    },
    series: [
      {
        name: "Actual",
        type: "line",
        data: [...actual.entries()].sort(([a], [b]) => a.localeCompare(b)),
        lineStyle: { width: 2, color: SERIES.blue },
        itemStyle: { color: SERIES.blue },
        symbolSize: 6,
        markLine: { symbol: "none", silent: true, data: marks },
      },
      {
        name: "Predicted",
        type: "line",
        data: predicted.sort((a, b) => String(a[0]).localeCompare(String(b[0]))),
        lineStyle: { width: 2, color: SERIES.orange, type: "dashed" },
        itemStyle: { color: SERIES.orange },
        symbolSize: 6,
      },
    ],
  };
}

/** A small trend line for a KPI tile. */
export function sparkline(metric: Metric): EChartsOption | null {
  if (metric.series.length < 2) return null;
  return {
    animation: false,
    grid: { left: 2, right: 2, top: 4, bottom: 4 },
    tooltip: { trigger: "axis", valueFormatter: (v) => `${fmt(Number(v))} ${metric.unit}` },
    xAxis: { type: "time", show: false },
    yAxis: { type: "value", show: false, scale: true },
    series: [
      {
        type: "line",
        data: sorted(metric.series).map((p) => [p.date, p.value]),
        lineStyle: { width: 2, color: SERIES.blue },
        itemStyle: { color: SERIES.blue },
        showSymbol: false,
      },
    ],
  };
}

function sorted<T extends { date: string }>(series: T[]): T[] {
  return [...series].sort((a, b) => a.date.localeCompare(b.date));
}

function short(text: string, max = 24): string {
  const t = text.trim();
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

/** Spreads points that share a score so they don't hide each other. */
function jitter(i: number): number {
  return ((i % 5) - 2) * 0.06;
}

export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
