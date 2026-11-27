import { SECTIONS, type SectionInfo } from "@/lib/a3/sections";
import { sectionHasContent } from "@/lib/a3/progress";
import type { LoadedA3 } from "@/lib/a3/repository";

const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

// The A3 laid out as a landscape page: Plan sections on the left half,
// Countermeasures, Plan and Follow-up on the right half.
export function A3Sheet({ a3 }: { a3: LoadedA3 }) {
  const doc = a3.document;
  const left = SECTIONS.filter((s) => s.column === "left");
  const right = SECTIONS.filter((s) => s.column === "right");
  return (
    <section aria-label="A3" className="overflow-auto p-6">
      <article className="mx-auto max-w-[1200px] rounded-md border border-slate-300 bg-white shadow-sm">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-300 px-6 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Problem-solving A3</p>
            <h1 className="text-xl font-semibold">{doc.title}</h1>
          </div>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs sm:grid-cols-4">
            <Meta label="Owner" value={doc.owner.name} />
            <Meta label="Mentor" value={doc.mentor?.name ?? "Not set"} />
            <Meta label="Version" value={`v${a3.version}`} />
            <Meta label="Updated" value={dateFormat.format(a3.updatedAt)} />
          </dl>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 md:divide-x md:divide-slate-300">
          <div className="divide-y divide-slate-200">
            {left.map((s) => (
              <SectionBox key={s.id} section={s} started={sectionHasContent(doc, s.id)} />
            ))}
          </div>
          <div className="divide-y divide-slate-200">
            {right.map((s) => (
              <SectionBox key={s.id} section={s} started={sectionHasContent(doc, s.id)} />
            ))}
          </div>
        </div>
      </article>
    </section>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

function SectionBox({ section, started }: { section: SectionInfo; started: boolean }) {
  return (
    <div id={section.id} className="scroll-mt-4 px-6 py-5">
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold">
          {section.number}. {section.title}
        </h2>
        <span className="text-[11px] uppercase tracking-wide text-slate-500">{section.pdca}</span>
      </div>
      <p className="mb-3 text-xs text-slate-600">{section.purpose}</p>
      {!started && (
        <div className="rounded border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-xs text-slate-500">
          <p className="font-medium text-slate-600">{section.visual}</p>
          <p className="mt-1">Appears here once this section has content.</p>
        </div>
      )}
    </div>
  );
}
