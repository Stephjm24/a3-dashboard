import type { ReactNode } from "react";
import Link from "next/link";
import { SECTIONS, type SectionInfo } from "@/lib/a3/sections";
import { sectionHasContent } from "@/lib/a3/progress";
import { checkA3Rules, type RuleWarning } from "@/lib/a3/rules";
import { latestValue } from "@/lib/a3/charts";
import type { LoadedA3 } from "@/lib/a3/repository";
import type { A3Document } from "@/lib/a3/schema";
import { EditButton } from "./editors/edit-button";
import { STATUS_LABEL } from "@/lib/a3/edit";
import { SectionContent } from "./section-content";

const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

// The A3 laid out as a landscape page: Plan sections on the left half,
// Countermeasures, Plan and Follow-up on the right half. With `editable`, each
// part has an Edit button; without it the sheet is a read-only earlier version.
export function A3Sheet({ a3, editable }: { a3: LoadedA3; editable: boolean }) {
  const doc = a3.document;
  const warnings = checkA3Rules(doc);
  const edit = editable ? { a3Id: a3.id, version: a3.version, doc } : null;
  const left = SECTIONS.filter((s) => s.column === "left");
  const right = SECTIONS.filter((s) => s.column === "right");
  const box = (s: SectionInfo) => (
    <SectionBox
      key={s.id}
      section={s}
      doc={doc}
      warnings={warnings.filter((w) => w.section === s.id)}
      edit={edit && <EditButton {...edit} part={s.id} />}
    />
  );
  return (
    <section aria-label="A3" className="overflow-auto p-3 sm:p-6">
      <article className="mx-auto max-w-[1200px] rounded-md border border-slate-300 bg-white shadow-sm">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-300 px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Problem-solving A3 · {STATUS_LABEL[doc.status]}
            </p>
            <h1 className="text-xl font-semibold">{doc.title}</h1>
            {doc.team.length > 0 && (
              <p className="text-xs text-slate-600">Team: {doc.team.map((p) => (p.role ? `${p.name} (${p.role})` : p.name)).join(", ")}</p>
            )}
          </div>
          <div className="flex items-end gap-4">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs sm:grid-cols-4">
              <Meta label="Owner" value={doc.owner.name} />
              <Meta label="Mentor" value={doc.mentor?.name ?? "Not set"} />
              <Meta label="Version" value={<Link href={`/a3/${a3.id}/history`} className="underline">v{a3.version}</Link>} />
              <Meta label={editable ? "Updated" : "Saved"} value={dateFormat.format(a3.updatedAt)} />
            </dl>
            {edit && <EditButton {...edit} part="header" />}
          </div>
        </header>
        <MetricsStrip doc={doc} edit={edit && <EditButton {...edit} part="metrics" label="Edit metrics" />} />
        <div className="grid grid-cols-1 md:grid-cols-2 md:divide-x md:divide-slate-300">
          <div className="divide-y divide-slate-200">{left.map(box)}</div>
          <div className="divide-y divide-slate-200 border-t border-slate-300 md:border-t-0">{right.map(box)}</div>
        </div>
      </article>
    </section>
  );
}

function Meta({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

function MetricsStrip({ doc, edit }: { doc: A3Document; edit: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-slate-300 bg-slate-50 px-4 py-2 text-xs sm:px-6">
      <span className="font-semibold text-slate-700">Metrics</span>
      {doc.metrics.length === 0 && <span className="text-slate-500">None yet. Add one to draw the charts.</span>}
      {doc.metrics.map((m) => {
        const latest = latestValue(m);
        return (
          <span key={m.id} className="rounded-full border border-slate-300 bg-white px-2 py-0.5">
            {m.name}
            <span className="text-slate-500">
              {" "}
              · {m.series.length} value{m.series.length === 1 ? "" : "s"}
              {latest && `, latest ${latest.value} ${m.unit}`}
            </span>
          </span>
        );
      })}
      <span className="ml-auto">{edit}</span>
    </div>
  );
}

function SectionBox({
  section,
  doc,
  warnings,
  edit,
}: {
  section: SectionInfo;
  doc: A3Document;
  warnings: RuleWarning[];
  edit: ReactNode;
}) {
  const started = sectionHasContent(doc, section.id);
  return (
    <div id={section.id} className="scroll-mt-4 px-4 py-5 sm:px-6">
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold">
          {section.number}. {section.title}
        </h2>
        <span className="flex items-center gap-3">
          <span className="text-[11px] uppercase tracking-wide text-slate-500">{section.pdca}</span>
          {edit}
        </span>
      </div>
      <p className="mb-3 text-xs text-slate-600">{section.purpose}</p>
      {warnings.length > 0 && (
        <ul className="mb-3 space-y-1">
          {warnings.map((w, i) => (
            <li key={i} className="rounded border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs text-amber-900">
              <span aria-hidden>⚠ </span>
              {w.message}
            </li>
          ))}
        </ul>
      )}
      {started ? (
        <SectionContent doc={doc} id={section.id} />
      ) : (
        <div className="rounded border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-xs text-slate-500">
          <p className="font-medium text-slate-600">{section.visual}</p>
          <p className="mt-1">{section.prompt}</p>
        </div>
      )}
    </div>
  );
}
