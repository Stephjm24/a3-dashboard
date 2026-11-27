import type { A3Document } from "./schema";
import type { SectionId } from "./sections";

/** True when the section holds anything the person has filled in. */
export function sectionHasContent(doc: A3Document, id: SectionId): boolean {
  switch (id) {
    case "background": {
      const b = doc.background;
      return Boolean(b.context || b.whyNow || b.history) || b.businessLink.length > 0 || b.affected.length > 0;
    }
    case "currentCondition": {
      const c = doc.currentCondition;
      return (
        Boolean(c.problemStatement || c.standard || c.actual || c.frequency || c.impact || c.pointOfOccurrence) ||
        c.gap !== null ||
        c.breakdown.length > 0 ||
        c.gembaObservations.length > 0 ||
        (c.processMap?.length ?? 0) > 0
      );
    }
    case "goal":
      return Boolean(doc.goal.statement || doc.goal.scope || doc.goal.deadline) || doc.goal.target !== null || doc.goal.baseline !== null;
    case "rootCause":
      return (
        doc.rootCause.whyChains.length > 0 ||
        doc.rootCause.rootCauses.length > 0 ||
        Boolean(doc.rootCause.fishbone) ||
        (doc.rootCause.pareto?.length ?? 0) > 0
      );
    case "countermeasures":
      return doc.countermeasures.length > 0;
    case "plan":
      return doc.plan.length > 0;
    case "followUp": {
      const f = doc.followUp;
      return (
        f.targetMet !== undefined ||
        [f.checkDates, f.measurements, f.anticipatedIssues, f.standardization, f.yokoten, f.lessonsLearned].some(
          (list) => list.length > 0,
        )
      );
    }
  }
}
