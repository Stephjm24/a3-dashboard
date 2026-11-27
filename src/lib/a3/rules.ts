// The key rules from the knowledge base (section 10). They are warnings, not
// blockers: the person can save an A3 that breaks them, and the app shows why.
import type { A3Document } from "./schema";

export type RuleWarning = { rule: string; section: string; message: string };

export function checkA3Rules(doc: A3Document): RuleWarning[] {
  const warnings: RuleWarning[] = [];

  const gapMetric = doc.currentCondition.gap?.metricId ?? null;
  const goalMetric = doc.goal.metricId;
  if (gapMetric && goalMetric && gapMetric !== goalMetric) {
    warnings.push({
      rule: "same-metric",
      section: "goal",
      message: "The goal should use the same metric as the gap in Current condition.",
    });
  }
  const followUpMetrics = new Set(doc.followUp.measurements.map((m) => m.metricId));
  if (goalMetric && followUpMetrics.size > 0 && !followUpMetrics.has(goalMetric)) {
    warnings.push({
      rule: "same-metric",
      section: "followUp",
      message: "Follow-up results should be measured on the goal's metric.",
    });
  }

  const rootCauseIds = new Set(doc.rootCause.rootCauses.map((c) => c.id));
  for (const cm of doc.countermeasures) {
    if (cm.addressesRootCauseIds.length === 0) {
      warnings.push({
        rule: "countermeasure-linked",
        section: "countermeasures",
        message: `"${cm.description || cm.id}" is not linked to a root cause.`,
      });
    } else if (cm.addressesRootCauseIds.some((id) => !rootCauseIds.has(id))) {
      warnings.push({
        rule: "countermeasure-linked",
        section: "countermeasures",
        message: `"${cm.description || cm.id}" points to a root cause that no longer exists.`,
      });
    }
  }

  for (const item of doc.plan) {
    if (!item.owner || !item.due) {
      warnings.push({
        rule: "action-owner-due",
        section: "plan",
        message: `"${item.task || item.id}" needs an owner and a due date.`,
      });
    }
  }

  return warnings;
}
