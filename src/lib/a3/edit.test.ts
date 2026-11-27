import { describe, expect, it } from "vitest";
import { emptyA3 } from "./schema";
import { applyPart, changedParts, describeChange, EDITABLE_PARTS, pdcaStageFor, readPart } from "./edit";

const owner = { id: "u1", name: "Sam Tester" };
const blank = () => emptyA3({ title: "Late lab results delay discharges", owner });

describe("readPart and applyPart", () => {
  it("round-trips every part of an empty A3 without changing it", () => {
    const doc = blank();
    for (const part of EDITABLE_PARTS) {
      expect(applyPart(doc, part, readPart(doc, part))).toEqual(doc);
    }
  });

  it("replaces one section and leaves the original document alone", () => {
    const doc = blank();
    const goal = { ...doc.goal, statement: "Cut turnaround from 85 to 45 minutes by 31 March", baseline: 85, target: 45 };
    const next = applyPart(doc, "goal", goal);
    expect(next.goal).toEqual(goal);
    expect(doc.goal.statement).toBe("");
    expect(changedParts(doc, next)).toEqual(["goal"]);
  });

  it("updates title, status, mentor and team from the header", () => {
    const next = applyPart(blank(), "header", {
      title: "  ER discharges wait for lab results ",
      status: "in_review",
      mentor: { id: "p1", name: "Alex Mentor" },
      team: [{ id: "p2", name: "Jo" }, { id: "p3", name: "  " }],
    });
    expect(next.title).toBe("ER discharges wait for lab results");
    expect(next.status).toBe("in_review");
    expect(next.mentor?.name).toBe("Alex Mentor");
    expect(next.team.map((p) => p.name)).toEqual(["Jo"]);
  });

  it("removes the mentor when the name is cleared", () => {
    const withMentor = applyPart(blank(), "header", { title: "Title", status: "draft", mentor: { id: "p1", name: "Alex" }, team: [] });
    const without = applyPart(withMentor, "header", { title: "Title", status: "draft", mentor: { id: "p1", name: " " }, team: [] });
    expect(without.mentor).toBeUndefined();
  });

  it("rejects data that does not fit the section", () => {
    expect(() => applyPart(blank(), "goal", { statement: 3 })).toThrow();
    expect(() => applyPart(blank(), "header", { title: "x", status: "draft", team: [] })).toThrow();
    expect(() =>
      applyPart(blank(), "countermeasures", [
        { id: "c", description: "x", addressesRootCauseIds: [], kind: "permanent", strength: "prevent", effect: 9, effort: 1, selected: true },
      ]),
    ).toThrow();
  });

  it("drops blank lines and empty rows the editors leave behind", () => {
    const doc = blank();
    const next = applyPart(doc, "followUp", { ...doc.followUp, lessonsLearned: ["Go and see first", "", "  "], checkDates: [""] });
    expect(next.followUp.lessonsLearned).toEqual(["Go and see first"]);
    expect(next.followUp.checkDates).toEqual([]);
    const bg = applyPart(doc, "background", { ...doc.background, affected: ["ER patients", ""], businessLink: [{ goalOrKpi: " " }] });
    expect(bg.background.affected).toEqual(["ER patients"]);
    expect(bg.background.businessLink).toEqual([]);
  });
});

describe("describeChange", () => {
  it("names the changed parts in A3 order", () => {
    expect(describeChange(["goal"])).toBe("Edited Goal");
    expect(describeChange(["background", "goal", "metrics"])).toBe("Edited Background, Goal and Metrics");
  });
});

describe("pdcaStageFor", () => {
  it("moves from plan to do, check and act as the A3 fills in", () => {
    const doc = blank();
    expect(pdcaStageFor(doc)).toBe("plan");
    doc.plan.push({ id: "a", task: "Pilot", owner: null, due: "2027-01-01", status: "in_progress", phase: "do" });
    expect(pdcaStageFor(doc)).toBe("do");
    doc.followUp.measurements.push({ date: "2027-02-01", metricId: "m", actual: 50 });
    expect(pdcaStageFor(doc)).toBe("check");
    doc.followUp.standardization.push("Update the standard work");
    expect(pdcaStageFor(doc)).toBe("act");
  });
});
