import { describe, expect, it } from "vitest";
import { a3DocumentSchema, emptyA3 } from "./schema";
import { checkA3Rules } from "./rules";
import { sectionHasContent } from "./progress";
import { SECTIONS } from "./sections";

const owner = { id: "u1", name: "Sam Tester" };

describe("emptyA3", () => {
  it("is a valid A3 document with no content and no rule warnings", () => {
    const doc = emptyA3({ title: "Late lab results delay discharges", owner });
    expect(a3DocumentSchema.parse(doc)).toEqual(doc);
    expect(checkA3Rules(doc)).toEqual([]);
    for (const s of SECTIONS) expect(sectionHasContent(doc, s.id)).toBe(false);
  });

  it("rejects a document with an unknown status", () => {
    const doc = { ...emptyA3({ title: "x", owner }), status: "finished" };
    expect(a3DocumentSchema.safeParse(doc).success).toBe(false);
  });
});

describe("sections", () => {
  it("has the seven problem-solving sections in A3 order", () => {
    expect(SECTIONS.map((s) => s.number)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(SECTIONS.filter((s) => s.column === "left").map((s) => s.id)).toEqual([
      "background",
      "currentCondition",
      "goal",
      "rootCause",
    ]);
  });
});

describe("checkA3Rules", () => {
  it("warns when the goal uses a different metric from the gap", () => {
    const doc = emptyA3({ title: "x", owner });
    doc.currentCondition.gap = { metricId: "tat", standardValue: 45, actualValue: 85, unit: "min" };
    doc.goal.metricId = "volume";
    expect(checkA3Rules(doc).map((w) => w.rule)).toContain("same-metric");
    expect(sectionHasContent(doc, "currentCondition")).toBe(true);
  });

  it("warns when a countermeasure is not linked to a root cause", () => {
    const doc = emptyA3({ title: "x", owner });
    doc.countermeasures.push({
      id: "cm1",
      description: "Add a second courier run",
      addressesRootCauseIds: [],
      kind: "permanent",
      strength: "prevent",
      effect: 4,
      effort: 2,
      selected: true,
    });
    expect(checkA3Rules(doc)).toEqual([
      expect.objectContaining({ rule: "countermeasure-linked", section: "countermeasures" }),
    ]);
  });

  it("warns when an action has no owner", () => {
    const doc = emptyA3({ title: "x", owner });
    doc.plan.push({ id: "a1", task: "Pilot the new run", owner: null, due: "2027-01-15", status: "not_started", phase: "do" });
    expect(checkA3Rules(doc).map((w) => w.rule)).toEqual(["action-owner-due"]);
  });
});
