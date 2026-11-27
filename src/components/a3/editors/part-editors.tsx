"use client";

import type { A3Document } from "@/lib/a3/schema";
import { A3_STATUSES, ACTION_STATUSES, PDCA_PHASES } from "@/lib/a3/schema";
import { STATUS_LABEL, type EditablePart, type PartData } from "@/lib/a3/edit";
import { ACTION_STATUS_LABEL } from "@/lib/a3/charts";
import {
  CheckboxField,
  DateField,
  Grid,
  LinesField,
  NumberField,
  RowList,
  SelectField,
  TextField,
  newId,
} from "./fields";
import { MetricsEditor } from "./metrics-editor";

export type EditorProps<P extends EditablePart> = {
  value: PartData<P>;
  onChange: (v: PartData<P>) => void;
  doc: A3Document;
};


function metricOptions(doc: A3Document) {
  return [{ value: "", label: "No metric chosen" }, ...doc.metrics.map((m) => ({ value: m.id, label: `${m.name} (${m.unit})` }))];
}

const NO_METRICS_HINT = "Add the metric under Metrics first to draw the chart.";

export function HeaderEditor({ value, onChange }: EditorProps<"header">) {
  return (
    <div className="space-y-4">
      <TextField
        label="Title"
        hint="Name the problem, not the solution."
        value={value.title}
        onChange={(title) => onChange({ ...value, title })}
      />
      <Grid>
        <SelectField
          label="Status"
          value={value.status}
          options={A3_STATUSES.map((s) => ({ value: s, label: STATUS_LABEL[s] }))}
          onChange={(status) => onChange({ ...value, status })}
        />
        <TextField
          label="Mentor or coach"
          value={value.mentor?.name}
          onChange={(name) => onChange({ ...value, mentor: { id: value.mentor?.id ?? newId("p"), name } })}
        />
      </Grid>
      <RowList
        label="Team"
        rows={value.team}
        onChange={(team) => onChange({ ...value, team })}
        create={() => ({ id: newId("p"), name: "" })}
        addLabel="Add a team member"
        render={(p, set) => (
          <Grid>
            <TextField label="Name" value={p.name} onChange={(name) => set({ ...p, name })} />
            <TextField label="Role" value={p.role} onChange={(role) => set({ ...p, role: role || undefined })} />
          </Grid>
        )}
      />
    </div>
  );
}

export function BackgroundEditor({ value, onChange }: EditorProps<"background">) {
  return (
    <div className="space-y-4">
      <TextField
        label="Business context"
        multiline
        rows={4}
        hint="What's the situation? Write it so an outsider could follow."
        value={value.context}
        onChange={(context) => onChange({ ...value, context })}
      />
      <TextField label="Why now" multiline value={value.whyNow} onChange={(whyNow) => onChange({ ...value, whyNow })} />
      <RowList
        label="Linked goal, strategy or KPI"
        rows={value.businessLink}
        onChange={(businessLink) => onChange({ ...value, businessLink })}
        create={() => ({ goalOrKpi: "" })}
        addLabel="Add a link to a goal or KPI"
        render={(l, set) => (
          <Grid>
            <TextField label="Goal or KPI" value={l.goalOrKpi} onChange={(goalOrKpi) => set({ ...l, goalOrKpi })} />
            <TextField label="How it links" value={l.description} onChange={(d) => set({ ...l, description: d || undefined })} />
          </Grid>
        )}
      />
      <LinesField label="Who is affected" value={value.affected} onChange={(affected) => onChange({ ...value, affected })} />
      <TextField
        label="Brief history"
        multiline
        value={value.history}
        onChange={(history) => onChange({ ...value, history: history || undefined })}
      />
    </div>
  );
}

export function CurrentConditionEditor({ value, onChange, doc }: EditorProps<"currentCondition">) {
  const gap = value.gap ?? { metricId: "", standardValue: 0, actualValue: 0, unit: "" };
  const setGap = (g: Partial<typeof gap>) => onChange({ ...value, gap: { ...gap, ...g } });
  return (
    <div className="space-y-4">
      <TextField
        label="Problem statement"
        multiline
        hint="Say what is wrong, not what is missing. Avoid “we lack…”."
        value={value.problemStatement}
        onChange={(problemStatement) => onChange({ ...value, problemStatement })}
      />
      <Grid>
        <TextField label="Standard (what should happen)" multiline value={value.standard} onChange={(standard) => onChange({ ...value, standard })} />
        <TextField label="Actual (what happens today)" multiline value={value.actual} onChange={(actual) => onChange({ ...value, actual })} />
      </Grid>
      <fieldset className="space-y-2">
        <legend className="text-xs font-semibold text-slate-800">The gap in numbers</legend>
        <CheckboxField label="Measure the gap" checked={value.gap !== null} onChange={(on) => onChange({ ...value, gap: on ? gap : null })} />
        {value.gap !== null && (
          <Grid cols={4}>
            <SelectField
              label="Metric"
              value={gap.metricId}
              options={metricOptions(doc)}
              hint={doc.metrics.length === 0 ? NO_METRICS_HINT : undefined}
              onChange={(metricId) => {
                const m = doc.metrics.find((x) => x.id === metricId);
                setGap({ metricId, unit: gap.unit || m?.unit || "" });
              }}
            />
            <NumberField label="Standard value" value={gap.standardValue} onChange={(v) => setGap({ standardValue: v ?? 0 })} />
            <NumberField label="Actual value" value={gap.actualValue} onChange={(v) => setGap({ actualValue: v ?? 0 })} />
            <TextField label="Unit" value={gap.unit} onChange={(unit) => setGap({ unit })} />
          </Grid>
        )}
      </fieldset>
      <Grid>
        <TextField label="How often it happens" value={value.frequency} onChange={(v) => onChange({ ...value, frequency: v || undefined })} />
        <TextField label="Its effect" value={value.impact} onChange={(v) => onChange({ ...value, impact: v || undefined })} />
      </Grid>
      <TextField
        label="Point of occurrence"
        hint="Where in the process the problem first shows up."
        value={value.pointOfOccurrence}
        onChange={(v) => onChange({ ...value, pointOfOccurrence: v || undefined })}
      />
      <RowList
        label="Breakdown"
        hint="Split the problem by a dimension (shift, product, step) to find the biggest piece. Drawn as a sorted bar chart."
        rows={value.breakdown}
        onChange={(breakdown) => onChange({ ...value, breakdown })}
        create={() => ({ dimension: "", categories: [] })}
        addLabel="Add a breakdown"
        render={(b, set) => (
          <div className="space-y-2">
            <TextField label="Broken down by" value={b.dimension} placeholder="e.g. Hour of day" onChange={(dimension) => set({ ...b, dimension })} />
            <RowList
              label="Categories"
              rows={b.categories}
              onChange={(categories) => set({ ...b, categories })}
              create={() => ({ label: "", value: 0 })}
              addLabel="Add a category"
              render={(c, setC) => (
                <Grid>
                  <TextField label="Category" value={c.label} onChange={(label) => setC({ ...c, label })} />
                  <NumberField label="Count or value" value={c.value} onChange={(v) => setC({ ...c, value: v ?? 0 })} />
                </Grid>
              )}
            />
          </div>
        )}
      />
      <RowList
        label="Process steps"
        hint="A simple map of the current process."
        rows={value.processMap ?? []}
        onChange={(processMap) => onChange({ ...value, processMap })}
        create={() => ({ id: newId("step"), name: "" })}
        addLabel="Add a process step"
        render={(s, set) => (
          <Grid cols={4}>
            <TextField label="Step" value={s.name} onChange={(name) => set({ ...s, name })} />
            <NumberField label="Work (min)" value={s.durationMin} onChange={(v) => set({ ...s, durationMin: v ?? undefined })} />
            <NumberField label="Wait (min)" value={s.waitMin} onChange={(v) => set({ ...s, waitMin: v ?? undefined })} />
            <TextField label="Problem seen here" value={s.problem} onChange={(v) => set({ ...s, problem: v || undefined })} />
          </Grid>
        )}
      />
      <RowList
        label="Gemba observations"
        hint="What you saw when you went to where the work happens."
        rows={value.gembaObservations}
        onChange={(gembaObservations) => onChange({ ...value, gembaObservations })}
        create={() => ({ date: new Date().toISOString().slice(0, 10), observer: "", note: "" })}
        addLabel="Add an observation"
        render={(o, set) => (
          <div className="space-y-2">
            <Grid>
              <DateField label="Date" value={o.date} onChange={(date) => set({ ...o, date })} />
              <TextField label="Observer" value={o.observer} onChange={(observer) => set({ ...o, observer })} />
            </Grid>
            <TextField label="What you saw" multiline rows={2} value={o.note} onChange={(note) => set({ ...o, note })} />
          </div>
        )}
      />
    </div>
  );
}

export function GoalEditor({ value, onChange, doc }: EditorProps<"goal">) {
  const gapMetric = doc.currentCondition.gap?.metricId;
  return (
    <div className="space-y-4">
      <TextField
        label="Goal statement"
        multiline
        hint="For example: cut average lab turnaround from 85 to 45 minutes by 31 March."
        value={value.statement}
        onChange={(statement) => onChange({ ...value, statement })}
      />
      <Grid>
        <SelectField
          label="Metric"
          value={value.metricId ?? ""}
          options={metricOptions(doc)}
          hint={
            doc.metrics.length === 0
              ? NO_METRICS_HINT
              : gapMetric && value.metricId !== gapMetric
                ? "Use the same metric as the gap in Current condition."
                : undefined
          }
          onChange={(id) => {
            const m = doc.metrics.find((x) => x.id === id);
            onChange({ ...value, metricId: id || null, unit: value.unit || m?.unit || "" });
          }}
        />
        <TextField label="Unit" value={value.unit} onChange={(unit) => onChange({ ...value, unit })} />
      </Grid>
      <Grid cols={3}>
        <NumberField label="Baseline" value={value.baseline} onChange={(baseline) => onChange({ ...value, baseline })} />
        <NumberField label="Target" value={value.target} onChange={(target) => onChange({ ...value, target })} />
        <DateField label="Deadline" value={value.deadline} onChange={(deadline) => onChange({ ...value, deadline })} />
      </Grid>
      <TextField
        label="Scope"
        hint="Which slice of the problem this A3 covers."
        value={value.scope}
        onChange={(scope) => onChange({ ...value, scope })}
      />
    </div>
  );
}

const METHODS = [
  { value: "five_whys", label: "5 Whys" },
  { value: "fishbone", label: "Fishbone" },
  { value: "pareto", label: "Pareto" },
  { value: "is_is_not", label: "Is / is not" },
  { value: "process_map", label: "Process map" },
  { value: "scatter", label: "Scatter" },
] as const;

export function RootCauseEditor({ value, onChange }: EditorProps<"rootCause">) {
  const fishbone = value.fishbone ?? { effect: "", categories: [] };
  return (
    <div className="space-y-5">
      <fieldset>
        <legend className="mb-1 text-xs font-semibold text-slate-800">Tools used</legend>
        <div className="flex flex-wrap gap-4">
          {METHODS.map((m) => (
            <CheckboxField
              key={m.value}
              label={m.label}
              checked={value.method.includes(m.value)}
              onChange={(on) =>
                onChange({ ...value, method: on ? [...value.method, m.value] : value.method.filter((x) => x !== m.value) })
              }
            />
          ))}
        </div>
      </fieldset>
      <RowList
        label="5 Whys"
        hint="Start at the point of occurrence. Check each answer against the facts and note the evidence."
        rows={value.whyChains}
        onChange={(whyChains) => onChange({ ...value, whyChains })}
        create={() => ({ id: newId("why"), problem: "", steps: [{ why: "", because: "", verified: false }] })}
        addLabel="Add a 5 Whys chain"
        render={(c, set) => (
          <div className="space-y-2">
            <TextField label="Problem at the point of occurrence" value={c.problem} onChange={(problem) => set({ ...c, problem })} />
            <RowList
              label="Why…because"
              rows={c.steps}
              onChange={(steps) => set({ ...c, steps })}
              create={() => ({ why: "", because: "", verified: false })}
              addLabel="Ask why again"
              render={(s, setS, i) => (
                <div className="space-y-2">
                  <Grid>
                    <TextField label={`Why ${i + 1}?`} value={s.why} onChange={(why) => setS({ ...s, why })} />
                    <TextField label="Because" value={s.because} onChange={(because) => setS({ ...s, because })} />
                  </Grid>
                  <TextField label="Evidence" value={s.evidence} onChange={(v) => setS({ ...s, evidence: v || undefined })} />
                  <CheckboxField label="Checked against the facts" checked={s.verified} onChange={(verified) => setS({ ...s, verified })} />
                </div>
              )}
            />
          </div>
        )}
      />
      <fieldset className="space-y-2">
        <legend className="text-xs font-semibold text-slate-800">Fishbone</legend>
        <CheckboxField
          label="Use a fishbone diagram"
          checked={value.fishbone !== undefined}
          onChange={(on) =>
            onChange({
              ...value,
              fishbone: on
                ? {
                    effect: fishbone.effect,
                    categories: fishbone.categories.length
                      ? fishbone.categories
                      : ["People", "Method", "Machine", "Material", "Measurement", "Environment"].map((name) => ({ name, causes: [] })),
                  }
                : undefined,
            })
          }
        />
        {value.fishbone && (
          <>
            <TextField label="Effect (the problem)" value={fishbone.effect} onChange={(effect) => onChange({ ...value, fishbone: { ...fishbone, effect } })} />
            <RowList
              label="Categories"
              rows={fishbone.categories}
              onChange={(categories) => onChange({ ...value, fishbone: { ...fishbone, categories } })}
              create={() => ({ name: "", causes: [] })}
              addLabel="Add a category"
              render={(cat, setCat) => (
                <div className="space-y-2">
                  <TextField label="Category" value={cat.name} onChange={(name) => setCat({ ...cat, name })} />
                  <LinesField
                    label="Possible causes"
                    value={cat.causes.map((c) => c.text)}
                    onChange={(lines) =>
                      setCat({ ...cat, causes: lines.map((text, i) => ({ id: cat.causes[i]?.id ?? newId("c"), text })) })
                    }
                  />
                </div>
              )}
            />
          </>
        )}
      </fieldset>
      <RowList
        label="Pareto of causes"
        hint="How often each cause was seen. Drawn largest first."
        rows={value.pareto ?? []}
        onChange={(pareto) => onChange({ ...value, pareto: pareto.length ? pareto : undefined })}
        create={() => ({ label: "", count: 0 })}
        addLabel="Add a cause count"
        render={(p, set) => (
          <Grid>
            <TextField label="Cause" value={p.label} onChange={(label) => set({ ...p, label })} />
            <NumberField label="Count" value={p.count} onChange={(v) => set({ ...p, count: v ?? 0 })} />
          </Grid>
        )}
      />
      <RowList
        label="Root causes"
        hint="Two or three at most. Blame conditions and systems, not people."
        rows={value.rootCauses}
        onChange={(rootCauses) => onChange({ ...value, rootCauses })}
        create={() => ({ id: newId("rc"), statement: "", evidence: "", verified: false })}
        addLabel="Add a root cause"
        render={(rc, set) => (
          <div className="space-y-2">
            <TextField label="Root cause" value={rc.statement} onChange={(statement) => set({ ...rc, statement })} />
            <Grid>
              <TextField label="Evidence" value={rc.evidence} onChange={(evidence) => set({ ...rc, evidence })} />
              <TextField label="Category" value={rc.category} onChange={(v) => set({ ...rc, category: v || undefined })} />
            </Grid>
            <CheckboxField label="Verified" checked={rc.verified} onChange={(verified) => set({ ...rc, verified })} />
          </div>
        )}
      />
    </div>
  );
}

const STRENGTHS = [
  { value: "eliminate", label: "Eliminate the cause" },
  { value: "prevent", label: "Prevent (error-proof)" },
  { value: "detect", label: "Detect" },
  { value: "procedure", label: "Procedure or standard work" },
  { value: "training", label: "Training" },
] as const;

const SCORES = [1, 2, 3, 4, 5].map((n) => ({ value: String(n) as "1", label: String(n) }));

export function CountermeasuresEditor({ value, onChange, doc }: EditorProps<"countermeasures">) {
  const rootCauses = doc.rootCause.rootCauses;
  return (
    <RowList
      label="Countermeasures"
      hint="Compare two or three options per root cause. Prevention first, then detection, procedures and training last."
      rows={value}
      onChange={onChange}
      create={() => ({
        id: newId("cm"),
        description: "",
        addressesRootCauseIds: [],
        kind: "permanent" as const,
        strength: "prevent" as const,
        effect: 3,
        effort: 3,
        selected: false,
      })}
      addLabel="Add a countermeasure"
      render={(cm, set) => (
        <div className="space-y-2">
          <TextField label="Countermeasure" value={cm.description} onChange={(description) => set({ ...cm, description })} />
          <fieldset>
            <legend className="mb-1 text-xs font-medium text-slate-700">Addresses root cause</legend>
            {rootCauses.length === 0 ? (
              <p className="text-[11px] text-slate-500">Add root causes in section 4 first.</p>
            ) : (
              <div className="flex flex-col gap-1">
                {rootCauses.map((rc) => (
                  <CheckboxField
                    key={rc.id}
                    label={rc.statement || rc.id}
                    checked={cm.addressesRootCauseIds.includes(rc.id)}
                    onChange={(on) =>
                      set({
                        ...cm,
                        addressesRootCauseIds: on
                          ? [...cm.addressesRootCauseIds, rc.id]
                          : cm.addressesRootCauseIds.filter((x) => x !== rc.id),
                      })
                    }
                  />
                ))}
              </div>
            )}
          </fieldset>
          <Grid cols={4}>
            <SelectField
              label="Kind"
              value={cm.kind}
              options={[
                { value: "containment", label: "Containment (short term)" },
                { value: "permanent", label: "Permanent" },
              ]}
              onChange={(kind) => set({ ...cm, kind })}
            />
            <SelectField label="Strength" value={cm.strength} options={STRENGTHS} onChange={(strength) => set({ ...cm, strength })} />
            <SelectField
              label="Effect (1–5)"
              value={String(cm.effect) as "1"}
              options={SCORES}
              onChange={(v) => set({ ...cm, effect: Number(v) })}
            />
            <SelectField
              label="Effort (1–5)"
              value={String(cm.effort) as "1"}
              options={SCORES}
              onChange={(v) => set({ ...cm, effort: Number(v) })}
            />
          </Grid>
          <Grid cols={3}>
            <TextField label="Cost" value={cm.cost} onChange={(v) => set({ ...cm, cost: v || undefined })} />
            <TextField label="Risk" value={cm.risk} onChange={(v) => set({ ...cm, risk: v || undefined })} />
            <NumberField
              label="Predicted value on the goal metric"
              value={cm.predictedImpact?.value}
              onChange={(v) =>
                set({
                  ...cm,
                  predictedImpact: v === null || !doc.goal.metricId ? undefined : { metricId: doc.goal.metricId, value: v },
                })
              }
              hint={doc.goal.metricId ? undefined : "Choose the goal's metric first."}
            />
          </Grid>
          <CheckboxField label="Chosen" checked={cm.selected} onChange={(selected) => set({ ...cm, selected })} />
        </div>
      )}
    />
  );
}

export function PlanEditor({ value, onChange, doc }: EditorProps<"plan">) {
  return (
    <RowList
      label="Actions"
      hint="Every action needs one owner and a due date. Drawn as a Gantt chart."
      rows={value}
      onChange={onChange}
      create={() => ({ id: newId("act"), task: "", owner: null, due: "", status: "not_started" as const, phase: "do" as const })}
      addLabel="Add an action"
      render={(a, set) => (
        <div className="space-y-2">
          <TextField label="Task" value={a.task} onChange={(task) => set({ ...a, task })} />
          <Grid cols={3}>
            <TextField
              label="Owner"
              value={a.owner?.name}
              onChange={(name) => set({ ...a, owner: name.trim() ? { id: a.owner?.id ?? newId("p"), name } : null })}
            />
            <DateField label="Start" value={a.start} onChange={(v) => set({ ...a, start: v || undefined })} />
            <DateField label="Due" value={a.due} onChange={(due) => set({ ...a, due })} />
          </Grid>
          <Grid cols={3}>
            <SelectField
              label="Status"
              value={a.status}
              options={ACTION_STATUSES.map((s) => ({ value: s, label: ACTION_STATUS_LABEL[s] }))}
              onChange={(status) => set({ ...a, status })}
            />
            <SelectField
              label="PDCA phase"
              value={a.phase}
              options={PDCA_PHASES.map((p) => ({ value: p, label: p[0].toUpperCase() + p.slice(1) }))}
              onChange={(phase) => set({ ...a, phase })}
            />
            <SelectField
              label="Countermeasure"
              value={a.countermeasureId ?? ""}
              options={[
                { value: "", label: "None" },
                ...doc.countermeasures.map((c) => ({ value: c.id, label: c.description || c.id })),
              ]}
              onChange={(v) => set({ ...a, countermeasureId: v || undefined })}
            />
          </Grid>
          <CheckboxField label="Pilot or trial" checked={a.isPilot ?? false} onChange={(isPilot) => set({ ...a, isPilot: isPilot || undefined })} />
        </div>
      )}
    />
  );
}

export function FollowUpEditor({ value, onChange, doc }: EditorProps<"followUp">) {
  const metricId = doc.goal.metricId;
  const metric = doc.metrics.find((m) => m.id === metricId);
  return (
    <div className="space-y-4">
      <RowList
        label="Check dates"
        rows={value.checkDates}
        onChange={(checkDates) => onChange({ ...value, checkDates })}
        create={() => ""}
        addLabel="Add a check date"
        render={(d, set) => <DateField label="Check on" value={d} onChange={set} />}
      />
      <RowList
        label={`Results${metric ? ` on ${metric.name} (${metric.unit})` : ""}`}
        hint={
          metricId
            ? "Measured on the goal's metric, so predicted and actual can be compared with the baseline."
            : "Choose the goal's metric in section 3 first."
        }
        rows={value.measurements}
        onChange={(measurements) => onChange({ ...value, measurements })}
        create={() => ({ date: new Date().toISOString().slice(0, 10), metricId: metricId ?? "", actual: 0 })}
        addLabel="Add a result"
        render={(m, set) => (
          <Grid cols={3}>
            <DateField label="Date" value={m.date} onChange={(date) => set({ ...m, date })} />
            <NumberField label="Predicted" value={m.predicted} onChange={(v) => set({ ...m, predicted: v ?? undefined })} />
            <NumberField label="Actual" value={m.actual} onChange={(v) => set({ ...m, actual: v ?? 0 })} />
          </Grid>
        )}
      />
      <SelectField
        label="Target met?"
        value={value.targetMet === undefined ? "" : value.targetMet ? "yes" : "no"}
        options={[
          { value: "", label: "Not yet known" },
          { value: "yes", label: "Yes" },
          { value: "no", label: "No: go back to root cause" },
        ]}
        onChange={(v) => onChange({ ...value, targetMet: v === "" ? undefined : v === "yes" })}
      />
      <LinesField label="Problems you expect" value={value.anticipatedIssues} onChange={(anticipatedIssues) => onChange({ ...value, anticipatedIssues })} />
      <LinesField label="How it will be standardised" value={value.standardization} onChange={(standardization) => onChange({ ...value, standardization })} />
      <LinesField label="Where else to share it (yokoten)" value={value.yokoten} onChange={(yokoten) => onChange({ ...value, yokoten })} />
      <LinesField label="Lessons learned" value={value.lessonsLearned} onChange={(lessonsLearned) => onChange({ ...value, lessonsLearned })} />
    </div>
  );
}

export function PartEditor<P extends EditablePart>({ part, ...props }: EditorProps<P> & { part: P }) {
  // The switch picks the editor that matches `part`, so its props line up.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = props as unknown as EditorProps<any>;
  switch (part) {
    case "header":
      return <HeaderEditor {...p} />;
    case "background":
      return <BackgroundEditor {...p} />;
    case "currentCondition":
      return <CurrentConditionEditor {...p} />;
    case "goal":
      return <GoalEditor {...p} />;
    case "rootCause":
      return <RootCauseEditor {...p} />;
    case "countermeasures":
      return <CountermeasuresEditor {...p} />;
    case "plan":
      return <PlanEditor {...p} />;
    case "followUp":
      return <FollowUpEditor {...p} />;
    case "metrics":
      return <MetricsEditor {...p} />;
  }
}
