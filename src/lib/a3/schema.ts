// The A3 document, stored whole in a3_versions.document.
// Follows the data model in the A3 Thinking Knowledge Base, section 10.
import { z } from "zod";

export const A3_TYPES = ["problem_solving", "proposal", "status", "strategy"] as const;
export const A3_STATUSES = ["draft", "in_review", "approved", "implementing", "checking", "closed"] as const;
export const PDCA_PHASES = ["plan", "do", "check", "act"] as const;
export const ACTION_STATUSES = ["not_started", "in_progress", "done", "blocked"] as const;

const isoDate = z.string().min(1);

export const personSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string().optional(),
});

export const visualRefSchema = z.object({
  kind: z.enum([
    "run_chart", "pareto", "bar", "process_map", "fishbone", "gantt", "bullet", "matrix", "photo", "sketch",
  ]),
  metricId: z.string().optional(),
  title: z.string(),
});

export const backgroundSchema = z.object({
  context: z.string(),
  whyNow: z.string(),
  businessLink: z.array(z.object({ goalOrKpi: z.string(), description: z.string().optional() })),
  affected: z.array(z.string()),
  history: z.string().optional(),
});

export const processStepSchema = z.object({
  id: z.string(),
  name: z.string(),
  owner: z.string().optional(),
  durationMin: z.number().optional(),
  waitMin: z.number().optional(),
  problem: z.string().optional(),
});

export const currentConditionSchema = z.object({
  problemStatement: z.string(),
  standard: z.string(),
  actual: z.string(),
  gap: z
    .object({ metricId: z.string(), standardValue: z.number(), actualValue: z.number(), unit: z.string() })
    .nullable(),
  frequency: z.string().optional(),
  impact: z.string().optional(),
  breakdown: z.array(
    z.object({
      dimension: z.string(),
      categories: z.array(z.object({ label: z.string(), value: z.number() })),
    }),
  ),
  pointOfOccurrence: z.string().optional(),
  gembaObservations: z.array(z.object({ date: isoDate, observer: z.string(), note: z.string() })),
  processMap: z.array(processStepSchema).optional(),
  visuals: z.array(visualRefSchema),
});

export const goalSchema = z.object({
  metricId: z.string().nullable(),
  baseline: z.number().nullable(),
  target: z.number().nullable(),
  unit: z.string(),
  deadline: z.string(),
  scope: z.string(),
  statement: z.string(),
});

export const causeSchema: z.ZodType<Cause> = z.lazy(() =>
  z.object({ id: z.string(), text: z.string(), subCauses: z.array(causeSchema).optional() }),
);
export type Cause = { id: string; text: string; subCauses?: Cause[] };

export const rootCauseAnalysisSchema = z.object({
  method: z.array(z.enum(["five_whys", "fishbone", "pareto", "is_is_not", "process_map", "scatter"])),
  whyChains: z.array(
    z.object({
      id: z.string(),
      problem: z.string(),
      steps: z.array(
        z.object({ why: z.string(), because: z.string(), evidence: z.string().optional(), verified: z.boolean() }),
      ),
    }),
  ),
  fishbone: z
    .object({ effect: z.string(), categories: z.array(z.object({ name: z.string(), causes: z.array(causeSchema) })) })
    .optional(),
  pareto: z.array(z.object({ label: z.string(), count: z.number() })).optional(),
  rootCauses: z.array(
    z.object({
      id: z.string(),
      statement: z.string(),
      evidence: z.string(),
      verified: z.boolean(),
      category: z.string().optional(),
    }),
  ),
});

const score = z.number().int().min(1).max(5);

export const countermeasureSchema = z.object({
  id: z.string(),
  description: z.string(),
  addressesRootCauseIds: z.array(z.string()),
  kind: z.enum(["containment", "permanent"]),
  strength: z.enum(["eliminate", "prevent", "detect", "procedure", "training"]),
  effect: score,
  effort: score,
  cost: z.string().optional(),
  risk: z.string().optional(),
  predictedImpact: z.object({ metricId: z.string(), value: z.number() }).optional(),
  selected: z.boolean(),
});

export const actionItemSchema = z.object({
  id: z.string(),
  task: z.string(),
  countermeasureId: z.string().optional(),
  owner: personSchema.nullable(),
  start: z.string().optional(),
  due: z.string(),
  status: z.enum(ACTION_STATUSES),
  isPilot: z.boolean().optional(),
  phase: z.enum(PDCA_PHASES),
});

export const followUpSchema = z.object({
  checkDates: z.array(z.string()),
  measurements: z.array(
    z.object({ date: isoDate, metricId: z.string(), predicted: z.number().optional(), actual: z.number() }),
  ),
  targetMet: z.boolean().optional(),
  anticipatedIssues: z.array(z.string()),
  standardization: z.array(z.string()),
  yokoten: z.array(z.string()),
  lessonsLearned: z.array(z.string()),
  nextA3Id: z.string().optional(),
});

export const metricSchema = z.object({
  id: z.string(),
  name: z.string(),
  unit: z.string(),
  direction: z.enum(["lower_is_better", "higher_is_better"]),
  series: z.array(z.object({ date: isoDate, value: z.number() })),
  source: z.string().optional(),
});

export const a3DocumentSchema = z.object({
  schemaVersion: z.literal(1),
  type: z.enum(A3_TYPES),
  title: z.string(),
  owner: personSchema,
  mentor: personSchema.optional(),
  team: z.array(personSchema),
  status: z.enum(A3_STATUSES),
  background: backgroundSchema,
  currentCondition: currentConditionSchema,
  goal: goalSchema,
  rootCause: rootCauseAnalysisSchema,
  countermeasures: z.array(countermeasureSchema),
  plan: z.array(actionItemSchema),
  followUp: followUpSchema,
  metrics: z.array(metricSchema),
  stakeholders: z.array(
    z.object({
      person: personSchema,
      role: z.string(),
      consulted: z.boolean(),
      concerns: z.string().optional(),
      resolution: z.string().optional(),
    }),
  ),
});

export type A3Document = z.infer<typeof a3DocumentSchema>;

/** A new, empty problem-solving A3 for the given owner and title. */
export function emptyA3(input: { title: string; owner: { id: string; name: string } }): A3Document {
  return {
    schemaVersion: 1,
    type: "problem_solving",
    title: input.title,
    owner: { id: input.owner.id, name: input.owner.name },
    team: [],
    status: "draft",
    background: { context: "", whyNow: "", businessLink: [], affected: [] },
    currentCondition: {
      problemStatement: "",
      standard: "",
      actual: "",
      gap: null,
      breakdown: [],
      gembaObservations: [],
      visuals: [],
    },
    goal: { metricId: null, baseline: null, target: null, unit: "", deadline: "", scope: "", statement: "" },
    rootCause: { method: [], whyChains: [], rootCauses: [] },
    countermeasures: [],
    plan: [],
    followUp: {
      checkDates: [],
      measurements: [],
      anticipatedIssues: [],
      standardization: [],
      yokoten: [],
      lessonsLearned: [],
    },
    metrics: [],
    stakeholders: [],
  };
}
