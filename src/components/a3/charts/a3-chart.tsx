"use client";

import { useMemo } from "react";
import type { A3Document } from "@/lib/a3/schema";
import {
  currentConditionRunChart,
  effectEffortMatrix,
  followUpRunChart,
  ganttChart,
  ganttRows,
  goalBulletChart,
  paretoChart,
  sparkline,
} from "@/lib/a3/charts";
import { EChart } from "./echart";

export type ChartKind =
  | "currentConditionRun"
  | "breakdown"
  | "rootCausePareto"
  | "goalBullet"
  | "effectEffort"
  | "gantt"
  | "followUpRun"
  | "sparkline";

const LABELS: Record<ChartKind, string> = {
  currentConditionRun: "Run chart of the problem metric against the standard",
  breakdown: "Breakdown of the problem, largest first",
  rootCausePareto: "Pareto of causes, largest first",
  goalBullet: "Goal: baseline, latest and target",
  effectEffort: "Countermeasures by effect and effort",
  gantt: "Implementation plan as a Gantt chart",
  followUpRun: "Follow-up: actual and predicted results against baseline and target",
  sparkline: "Trend of the metric",
};

/** One of the A3 charts, drawn from the document on screen. Renders nothing when there is no data yet. */
export function A3Chart({ doc, kind, index = 0, metricId }: { doc: A3Document; kind: ChartKind; index?: number; metricId?: string }) {
  const option = useMemo(() => {
    switch (kind) {
      case "currentConditionRun":
        return currentConditionRunChart(doc);
      case "breakdown":
        return doc.currentCondition.breakdown[index] ? paretoChart(doc.currentCondition.breakdown[index].categories) : null;
      case "rootCausePareto":
        return paretoChart((doc.rootCause.pareto ?? []).map((p) => ({ label: p.label, value: p.count })));
      case "goalBullet":
        return goalBulletChart(doc);
      case "effectEffort":
        return effectEffortMatrix(doc);
      case "gantt":
        return ganttChart(doc);
      case "followUpRun":
        return followUpRunChart(doc);
      case "sparkline": {
        const m = doc.metrics.find((x) => x.id === metricId);
        return m ? sparkline(m) : null;
      }
    }
  }, [doc, kind, index, metricId]);
  if (!option) return null;
  const height =
    kind === "sparkline"
      ? 40
      : kind === "gantt"
        ? 60 + ganttRows(doc).length * 28
        : kind === "goalBullet"
          ? 110
          : kind === "breakdown" || kind === "rootCausePareto"
            ? 40 + 26 * Math.max(1, kind === "breakdown" ? (doc.currentCondition.breakdown[index]?.categories.length ?? 1) : (doc.rootCause.pareto?.length ?? 1))
            : 220;
  return <EChart option={option} height={height} label={LABELS[kind]} />;
}
