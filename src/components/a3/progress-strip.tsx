import { SECTIONS } from "@/lib/a3/sections";
import { sectionHasContent } from "@/lib/a3/progress";
import type { A3Document } from "@/lib/a3/schema";

export function ProgressStrip({ doc }: { doc: A3Document }) {
  return (
    <nav aria-label="A3 sections" className="border-b border-slate-200 bg-white px-6 py-3">
      <ol className="flex flex-wrap gap-2">
        {SECTIONS.map((s) => {
          const started = sectionHasContent(doc, s.id);
          return (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${
                  started ? "border-blue-300 bg-blue-50 text-blue-900" : "border-slate-200 text-slate-600"
                }`}
              >
                <span className="font-semibold">{s.number}</span>
                {s.title}
                <span className="sr-only">{started ? "(started)" : "(not started)"}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
