// Editing an A3 by hand: which parts of the document each editor owns, how an
// edit is applied, and how a saved version is described in the history.
import { z } from "zod";
import {
  A3_STATUSES,
  actionItemSchema,
  backgroundSchema,
  countermeasureSchema,
  currentConditionSchema,
  followUpSchema,
  goalSchema,
  metricSchema,
  personSchema,
  rootCauseAnalysisSchema,
  type A3Document,
} from "./schema";
import { SECTIONS, type SectionId } from "./sections";

/** The parts of an A3 that have their own editor: the header, the seven sections and the metrics. */
export type EditablePart = "header" | SectionId | "metrics";

export const headerSchema = z.object({
  title: z.string().trim().min(3, "Give the problem a short title.").max(160),
  status: z.enum(A3_STATUSES),
  mentor: personSchema.optional(),
  team: z.array(personSchema),
});
export type HeaderData = z.infer<typeof headerSchema>;

export const PART_SCHEMAS = {
  header: headerSchema,
  background: backgroundSchema,
  currentCondition: currentConditionSchema,
  goal: goalSchema,
  rootCause: rootCauseAnalysisSchema,
  countermeasures: z.array(countermeasureSchema),
  plan: z.array(actionItemSchema),
  followUp: followUpSchema,
  metrics: z.array(metricSchema),
} satisfies Record<EditablePart, z.ZodType>;

export type PartData<P extends EditablePart> = z.infer<(typeof PART_SCHEMAS)[P]>;

export const EDITABLE_PARTS = Object.keys(PART_SCHEMAS) as EditablePart[];

export function isEditablePart(value: unknown): value is EditablePart {
  return typeof value === "string" && (EDITABLE_PARTS as string[]).includes(value);
}

/** The slice of the document an editor starts from. */
export function readPart<P extends EditablePart>(doc: A3Document, part: P): PartData<P> {
  if (part === "header") {
    return { title: doc.title, status: doc.status, mentor: doc.mentor, team: doc.team } as PartData<P>;
  }
  return doc[part as Exclude<EditablePart, "header">] as PartData<P>;
}

/** Returns a new document with the part replaced. The input is not changed. */
export function applyPart(doc: A3Document, part: EditablePart, data: unknown): A3Document {
  const parsed = tidyPart(part, PART_SCHEMAS[part].parse(data));
  const next: A3Document = structuredClone(doc);
  if (part === "header") {
    const h = parsed as HeaderData;
    next.title = h.title;
    next.status = h.status;
    next.team = h.team;
    if (h.mentor && h.mentor.name.trim()) next.mentor = h.mentor;
    else delete next.mentor;
  } else {
    (next as Record<string, unknown>)[part] = parsed;
  }
  return next;
}

export const STATUS_LABEL: Record<(typeof A3_STATUSES)[number], string> = {
  draft: "Draft",
  in_review: "In review",
  approved: "Approved",
  implementing: "Implementing",
  checking: "Checking",
  closed: "Closed",
};

export const PART_LABELS: Record<EditablePart, string> = {
  header: "Header",
  metrics: "Metrics",
  ...(Object.fromEntries(SECTIONS.map((s) => [s.id, s.title])) as Record<SectionId, string>),
};

/** The editable parts whose content differs between two versions, in A3 order. */
export function changedParts(before: A3Document, after: A3Document): EditablePart[] {
  const order: EditablePart[] = ["header", ...SECTIONS.map((s) => s.id), "metrics"];
  return order.filter((p) => JSON.stringify(readPart(before, p)) !== JSON.stringify(readPart(after, p)));
}

/** A one-line description for the version history, for example "Edited Goal and Metrics". */
export function describeChange(parts: EditablePart[]): string {
  if (parts.length === 0) return "Saved with no changes";
  const names = parts.map((p) => PART_LABELS[p]);
  const list = names.length === 1 ? names[0] : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
  return `Edited ${list}`;
}

/** The PDCA stage implied by how far the A3 has got, stored on the A3 for the list page. */
export function pdcaStageFor(doc: A3Document): "plan" | "do" | "check" | "act" {
  if (doc.followUp.standardization.length > 0 || doc.followUp.yokoten.length > 0) return "act";
  if (doc.followUp.measurements.length > 0) return "check";
  if (doc.plan.some((a) => a.status !== "not_started")) return "do";
  return "plan";
}

const lines = (xs: string[]) => xs.map((x) => x.trim()).filter(Boolean);

/** Drops blank lines and empty rows the editors leave behind, so they are not saved. */
export function tidyPart<P extends EditablePart>(part: P, data: PartData<P>): PartData<P> {
  switch (part) {
    case "header": {
      const h = data as HeaderData;
      return { ...h, team: h.team.filter((p) => p.name.trim()) } as PartData<P>;
    }
    case "background": {
      const b = data as PartData<"background">;
      return {
        ...b,
        affected: lines(b.affected),
        businessLink: b.businessLink.filter((l) => l.goalOrKpi.trim()),
      } as PartData<P>;
    }
    case "rootCause": {
      const r = data as PartData<"rootCause">;
      if (!r.fishbone) return data;
      return {
        ...r,
        fishbone: {
          ...r.fishbone,
          categories: r.fishbone.categories
            .filter((c) => c.name.trim() || c.causes.some((x) => x.text.trim()))
            .map((c) => ({ ...c, causes: c.causes.filter((x) => x.text.trim()) })),
        },
      } as PartData<P>;
    }
    case "followUp": {
      const f = data as PartData<"followUp">;
      return {
        ...f,
        checkDates: lines(f.checkDates),
        anticipatedIssues: lines(f.anticipatedIssues),
        standardization: lines(f.standardization),
        yokoten: lines(f.yokoten),
        lessonsLearned: lines(f.lessonsLearned),
      } as PartData<P>;
    }
    default:
      return data;
  }
}
