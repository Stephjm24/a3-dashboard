import type { A3Document } from "@/lib/a3/schema";
import type { SectionId } from "@/lib/a3/sections";
import { ACTION_STATUS_LABEL, findMetric, fmt, latestValue } from "@/lib/a3/charts";
import { A3Chart } from "./charts/a3-chart";
import { Fishbone, WhyChains } from "./charts/diagrams";
import type { ReactNode } from "react";

/** The read view of one section: its words, lists and charts. */
export function SectionContent({ doc, id }: { doc: A3Document; id: SectionId }) {
  switch (id) {
    case "background":
      return <Background doc={doc} />;
    case "currentCondition":
      return <CurrentCondition doc={doc} />;
    case "goal":
      return <Goal doc={doc} />;
    case "rootCause":
      return <RootCause doc={doc} />;
    case "countermeasures":
      return <Countermeasures doc={doc} />;
    case "plan":
      return <Plan doc={doc} />;
    case "followUp":
      return <FollowUp doc={doc} />;
  }
}

function Text({ label, children }: { label?: string; children?: ReactNode }) {
  if (!children) return null;
  return (
    <div className="text-sm">
      {label && <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{label}</p>}
      <p className="whitespace-pre-line">{children}</p>
    </div>
  );
}

function Bullets({ label, items }: { label: string; items: ReactNode[] }) {
  if (items.length === 0) return null;
  return (
    <div className="text-sm">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <ul className="ml-4 list-disc">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function Background({ doc }: { doc: A3Document }) {
  const b = doc.background;
  const metric = findMetric(doc, doc.goal.metricId ?? doc.currentCondition.gap?.metricId);
  const latest = latestValue(metric);
  return (
    <div className="space-y-3">
      {(b.businessLink.length > 0 || metric) && (
        <div className="flex flex-wrap gap-3">
          {metric && (
            <div className="min-w-[180px] flex-1 rounded border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="text-[11px] text-slate-500">{metric.name}</p>
              <p className="text-lg font-semibold">
                {latest ? `${fmt(latest.value)} ${metric.unit}` : "No values yet"}
                {doc.goal.target !== null && (
                  <span className="ml-2 text-xs font-normal text-slate-500">
                    target {fmt(doc.goal.target)} {doc.goal.unit || metric.unit}
                  </span>
                )}
              </p>
              <A3Chart doc={doc} kind="sparkline" metricId={metric.id} />
            </div>
          )}
          {b.businessLink.map((l, i) => (
            <div key={i} className="min-w-[140px] flex-1 rounded border border-blue-200 bg-blue-50 px-3 py-2 text-xs">
              <p className="font-semibold text-blue-950">{l.goalOrKpi}</p>
              {l.description && <p className="text-blue-900">{l.description}</p>}
            </div>
          ))}
        </div>
      )}
      <Text>{b.context}</Text>
      <Text label="Why now">{b.whyNow}</Text>
      <Bullets label="Who is affected" items={b.affected} />
      <Text label="History">{b.history}</Text>
    </div>
  );
}

function CurrentCondition({ doc }: { doc: A3Document }) {
  const c = doc.currentCondition;
  return (
    <div className="space-y-3">
      <Text label="Problem statement">{c.problemStatement}</Text>
      {(c.standard || c.actual) && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Text label="Standard">{c.standard}</Text>
          <Text label="Actual">{c.actual}</Text>
        </div>
      )}
      {c.gap && (
        <p className="text-sm">
          <span className="font-semibold">Gap: </span>
          {fmt(c.gap.actualValue)} {c.gap.unit} against a standard of {fmt(c.gap.standardValue)} {c.gap.unit} (
          {fmt(Math.abs(c.gap.actualValue - c.gap.standardValue))} {c.gap.unit})
        </p>
      )}
      <A3Chart doc={doc} kind="currentConditionRun" />
      {c.gap && !findMetric(doc, c.gap.metricId)?.series.length && (
        <p className="text-xs text-slate-500">Add values to the gap&apos;s metric to draw the run chart.</p>
      )}
      <Text label="How often">{c.frequency}</Text>
      <Text label="Effect">{c.impact}</Text>
      <Text label="Point of occurrence">{c.pointOfOccurrence}</Text>
      {c.breakdown.map((b, i) => (
        <div key={i}>
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">By {b.dimension || "category"}</p>
          <A3Chart doc={doc} kind="breakdown" index={i} />
        </div>
      ))}
      {c.processMap && c.processMap.length > 0 && (
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Process</p>
          <ol className="flex flex-wrap items-stretch gap-1 text-xs">
            {c.processMap.map((s, i) => (
              <li key={s.id} className="flex items-center gap-1">
                <span className={`rounded border px-2 py-1 ${s.problem ? "border-red-300 bg-red-50" : "border-slate-300 bg-white"}`}>
                  <span className="font-medium">{s.name}</span>
                  {(s.durationMin !== undefined || s.waitMin !== undefined) && (
                    <span className="block text-[10px] text-slate-500">
                      {s.durationMin !== undefined && `work ${fmt(s.durationMin)} min`}
                      {s.durationMin !== undefined && s.waitMin !== undefined && " · "}
                      {s.waitMin !== undefined && `wait ${fmt(s.waitMin)} min`}
                    </span>
                  )}
                  {s.problem && <span className="block text-[10px] text-red-800">⚠ {s.problem}</span>}
                </span>
                {i < c.processMap!.length - 1 && <span aria-hidden>→</span>}
              </li>
            ))}
          </ol>
        </div>
      )}
      <Bullets
        label="Gemba observations"
        items={c.gembaObservations.map((o) => (
          <>
            <span className="text-slate-500">
              {o.date}
              {o.observer && `, ${o.observer}`}:
            </span>{" "}
            {o.note}
          </>
        ))}
      />
    </div>
  );
}

function Goal({ doc }: { doc: A3Document }) {
  const g = doc.goal;
  return (
    <div className="space-y-3">
      <Text>{g.statement}</Text>
      <A3Chart doc={doc} kind="goalBullet" />
      {(g.deadline || g.scope) && (
        <dl className="grid grid-cols-2 gap-2 text-sm">
          {g.deadline && (
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Deadline</dt>
              <dd>{g.deadline}</dd>
            </div>
          )}
          {g.scope && (
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Scope</dt>
              <dd>{g.scope}</dd>
            </div>
          )}
        </dl>
      )}
    </div>
  );
}

function RootCause({ doc }: { doc: A3Document }) {
  const r = doc.rootCause;
  return (
    <div className="space-y-3">
      <WhyChains chains={r.whyChains} />
      <Fishbone fishbone={r.fishbone} />
      {r.pareto && r.pareto.length > 0 && (
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Pareto of causes</p>
          <A3Chart doc={doc} kind="rootCausePareto" />
        </div>
      )}
      <Bullets
        label="Root causes"
        items={r.rootCauses.map((rc) => (
          <>
            <span className="font-medium">{rc.statement}</span>{" "}
            <span className={rc.verified ? "text-green-700" : "text-amber-700"}>{rc.verified ? "✓ verified" : "? not yet verified"}</span>
            {rc.evidence && <span className="block text-xs text-slate-500">Evidence: {rc.evidence}</span>}
          </>
        ))}
      />
    </div>
  );
}

const STRENGTH_LABEL = {
  eliminate: "Eliminate",
  prevent: "Prevent",
  detect: "Detect",
  procedure: "Procedure",
  training: "Training",
} as const;

function Countermeasures({ doc }: { doc: A3Document }) {
  const causes = new Map(doc.rootCause.rootCauses.map((c, i) => [c.id, `RC${i + 1}`]));
  const cms = doc.countermeasures;
  if (cms.length === 0) return null;
  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="text-[11px] uppercase tracking-wide text-slate-500">
            <tr>
              <th className="py-1 pr-2 font-medium">Countermeasure</th>
              <th className="py-1 pr-2 font-medium">Cause</th>
              <th className="py-1 pr-2 font-medium">Type</th>
              <th className="py-1 pr-2 font-medium">Effect</th>
              <th className="py-1 pr-2 font-medium">Effort</th>
              <th className="py-1 font-medium">Chosen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {cms.map((cm) => (
              <tr key={cm.id}>
                <td className="py-1 pr-2">{cm.description}</td>
                <td className="py-1 pr-2">{cm.addressesRootCauseIds.map((id) => causes.get(id) ?? "?").join(", ") || "None"}</td>
                <td className="py-1 pr-2">
                  {cm.kind === "containment" ? "Containment" : "Permanent"} · {STRENGTH_LABEL[cm.strength]}
                </td>
                <td className="py-1 pr-2">{cm.effect}</td>
                <td className="py-1 pr-2">{cm.effort}</td>
                <td className="py-1">{cm.selected ? "✓ Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {causes.size > 0 && (
          <p className="mt-1 text-[11px] text-slate-500">
            {doc.rootCause.rootCauses.map((c, i) => `RC${i + 1}: ${c.statement}`).join(" · ")}
          </p>
        )}
      </div>
      <A3Chart doc={doc} kind="effectEffort" />
    </div>
  );
}

function Plan({ doc }: { doc: A3Document }) {
  if (doc.plan.length === 0) return null;
  return (
    <div className="space-y-3">
      <A3Chart doc={doc} kind="gantt" />
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="text-[11px] uppercase tracking-wide text-slate-500">
            <tr>
              <th className="py-1 pr-2 font-medium">Action</th>
              <th className="py-1 pr-2 font-medium">Owner</th>
              <th className="py-1 pr-2 font-medium">Due</th>
              <th className="py-1 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {doc.plan.map((a) => (
              <tr key={a.id}>
                <td className="py-1 pr-2">
                  {a.task}
                  {a.isPilot && <span className="ml-1 text-[10px] text-slate-500">(pilot)</span>}
                </td>
                <td className="py-1 pr-2">{a.owner?.name ?? <span className="text-amber-700">No owner</span>}</td>
                <td className="py-1 pr-2">{a.due || <span className="text-amber-700">No date</span>}</td>
                <td className="py-1">{ACTION_STATUS_LABEL[a.status]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FollowUp({ doc }: { doc: A3Document }) {
  const f = doc.followUp;
  return (
    <div className="space-y-3">
      <A3Chart doc={doc} kind="followUpRun" />
      {f.targetMet !== undefined && (
        <p className="text-sm font-medium">
          {f.targetMet ? "✓ Target met" : "✗ Target not met: loop back to root cause analysis"}
        </p>
      )}
      <Bullets label="Check dates" items={f.checkDates} />
      <Bullets label="Problems we expect" items={f.anticipatedIssues} />
      <Bullets label="Standardise" items={f.standardization} />
      <Bullets label="Share with (yokoten)" items={f.yokoten} />
      <Bullets label="Lessons learned" items={f.lessonsLearned} />
    </div>
  );
}
