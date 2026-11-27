import { describe, expect, it } from "vitest";
import { emptyA3, type A3Document } from "./schema";
import {
  currentConditionRunChart,
  effectEffortMatrix,
  followUpRunChart,
  ganttChart,
  ganttRows,
  goalBulletChart,
  paretoChart,
} from "./charts";

function sample(): A3Document {
  const doc = emptyA3({ title: "Late lab results delay discharges", owner: { id: "u1", name: "Sam" } });
  doc.metrics.push({
    id: "tat",
    name: "Lab turnaround",
    unit: "min",
    direction: "lower_is_better",
    series: [
      { date: "2026-10-12", value: 80 },
      { date: "2026-10-05", value: 85 },
    ],
  });
  doc.currentCondition.gap = { metricId: "tat", standardValue: 45, actualValue: 85, unit: "min" };
  doc.goal = { ...doc.goal, metricId: "tat", baseline: 85, target: 45, unit: "min", deadline: "2027-03-31" };
  return doc;
}

describe("charts", () => {
  it("draws nothing for an empty A3", () => {
    const doc = emptyA3({ title: "x", owner: { id: "u1", name: "Sam" } });
    for (const build of [currentConditionRunChart, goalBulletChart, effectEffortMatrix, ganttChart, followUpRunChart]) {
      expect(build(doc)).toBeNull();
    }
    expect(paretoChart([])).toBeNull();
  });

  it("draws the run chart from the gap's metric, in date order, with the standard and the gap", () => {
    const option = currentConditionRunChart(sample())!;
    const series = (option.series as { data: unknown[]; markLine: { data: { yAxis: number }[] }; markArea: { data: { yAxis: number }[][] } }[])[0];
    expect(series.data).toEqual([
      ["2026-10-05", 85],
      ["2026-10-12", 80],
    ]);
    expect(series.markLine.data[0].yAxis).toBe(45);
    expect(series.markArea.data[0].map((p) => p.yAxis)).toEqual([45, 85]);
  });

  it("shows baseline, latest and target on the goal chart", () => {
    const option = goalBulletChart(sample())!;
    expect((option.yAxis as { data: string[] }).data).toEqual(["Baseline", "Latest (2026-10-12)", "Target by 2027-03-31"]);
  });

  it("sorts a breakdown largest first", () => {
    const option = paretoChart([
      { label: "Night", value: 4 },
      { label: "Day", value: 10 },
    ])!;
    expect((option.yAxis as { data: string[] }).data).toEqual(["Day", "Night"]);
  });

  it("merges follow-up results into the goal metric and keeps predictions separate", () => {
    const doc = sample();
    doc.followUp.measurements.push({ date: "2027-01-10", metricId: "tat", predicted: 50, actual: 55 });
    doc.followUp.measurements.push({ date: "2027-01-17", metricId: "other", actual: 1 });
    const [actual, predicted] = followUpRunChart(doc)!.series as { data: unknown[] }[];
    expect(actual.data).toEqual([
      ["2026-10-05", 85],
      ["2026-10-12", 80],
      ["2027-01-10", 55],
    ]);
    expect(predicted.data).toEqual([["2027-01-10", 50]]);
  });

  it("puts plan actions with a due date on the Gantt, earliest first", () => {
    const doc = sample();
    doc.plan.push(
      { id: "b", task: "Train staff", owner: null, start: "2027-02-01", due: "2027-02-10", status: "not_started", phase: "do" },
      { id: "a", task: "Pilot courier run", owner: { id: "p", name: "Jo" }, start: "2027-01-05", due: "2027-01-20", status: "in_progress", phase: "do" },
      { id: "c", task: "No date yet", owner: null, due: "", status: "not_started", phase: "do" },
    );
    expect(ganttRows(doc).map((r) => r.id)).toEqual(["a", "b"]);
    expect(ganttChart(doc)).not.toBeNull();
  });

  it("splits chosen and other countermeasures on the matrix", () => {
    const doc = sample();
    const cm = { addressesRootCauseIds: [] as string[], kind: "permanent" as const, strength: "prevent" as const, effect: 4, effort: 2 };
    doc.countermeasures.push({ ...cm, id: "1", description: "Second courier run", selected: true });
    doc.countermeasures.push({ ...cm, id: "2", description: "New analyser", selected: false, effort: 5 });
    const [chosen, other] = effectEffortMatrix(doc)!.series as { data: unknown[] }[];
    expect(chosen.data).toHaveLength(1);
    expect(other.data).toHaveLength(1);
  });
});
