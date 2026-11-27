// The seven sections of a problem-solving A3, in coaching order.
// Wording comes from the A3 Thinking Knowledge Base, section 4.

export type SectionId =
  | "background"
  | "currentCondition"
  | "goal"
  | "rootCause"
  | "countermeasures"
  | "plan"
  | "followUp";

export type SectionInfo = {
  id: SectionId;
  number: number;
  title: string;
  pdca: "Plan" | "Do" | "Check and Act";
  /** Which half of the A3 page the section sits on. */
  column: "left" | "right";
  purpose: string;
  prompt: string;
  /** The default chart or drawing for the section (knowledge base, section 7). */
  visual: string;
};

export const SECTIONS: readonly SectionInfo[] = [
  {
    id: "background",
    number: 1,
    title: "Background",
    pdca: "Plan",
    column: "left",
    purpose: "Why this problem, why now, and why it matters to the business.",
    prompt: "Tell me about the situation. Why does this problem matter, and to whom?",
    visual: "KPI tile linked to a strategic goal",
  },
  {
    id: "currentCondition",
    number: 2,
    title: "Current condition",
    pdca: "Plan",
    column: "left",
    purpose: "The facts about how things are today, and the gap against the standard.",
    prompt:
      "Describe what's happening today. What should be happening? How often does it go wrong, and how do you know?",
    visual: "Run chart against the standard, with the gap shaded",
  },
  {
    id: "goal",
    number: 3,
    title: "Goal",
    pdca: "Plan",
    column: "left",
    purpose: "The specific result needed: metric, baseline, target and deadline.",
    prompt: "What would success look like, in numbers, and by when?",
    visual: "Bullet chart: baseline, current, target and deadline",
  },
  {
    id: "rootCause",
    number: 4,
    title: "Root cause analysis",
    pdca: "Plan",
    column: "left",
    purpose: "Why the gap exists, with evidence for each link.",
    prompt: "Why do you think this happens? Let's ask why a few times and check each answer against the facts.",
    visual: "5 Whys chain or fishbone",
  },
  {
    id: "countermeasures",
    number: 5,
    title: "Countermeasures",
    pdca: "Plan",
    column: "right",
    purpose: "Actions that address the root causes, compared and chosen.",
    prompt: "For each cause, what could you change? What else could work? Which would you choose and why?",
    visual: "Effect against effort matrix",
  },
  {
    id: "plan",
    number: 6,
    title: "Implementation plan",
    pdca: "Do",
    column: "right",
    purpose: "Who does what, by when.",
    prompt: "What needs to happen to put this in place? Who owns each step and when will it be done?",
    visual: "Gantt chart with owners and status",
  },
  {
    id: "followUp",
    number: 7,
    title: "Follow-up",
    pdca: "Check and Act",
    column: "right",
    purpose: "Prove it worked, keep it working and share what was learned.",
    prompt: "How will you know it worked? When will you check? What could go wrong, and who else should learn from this?",
    visual: "Run chart: baseline, predicted, actual and target",
  },
];
