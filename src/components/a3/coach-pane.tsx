import { SECTIONS } from "@/lib/a3/sections";

// Placeholder until the coach is built in phase 3. It shows where the chat
// will sit and the first question the coach will ask.
export function CoachPane() {
  const first = SECTIONS[0];
  return (
    <aside aria-label="Coach" className="flex flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-3">
        <h2 className="text-sm font-semibold">Coach</h2>
        <p className="text-xs text-slate-500">Guides you through A3 thinking. You decide what goes in.</p>
      </div>
      <div className="flex-1 space-y-3 p-5 text-sm">
        <div className="max-w-[90%] rounded-lg bg-slate-100 px-4 py-3 text-slate-800">
          <p className="mb-1 text-xs font-medium text-slate-500">
            {first.title} · {first.pdca}
          </p>
          {first.prompt}
        </div>
        <p className="text-xs text-slate-500">The coach arrives in phase 3. For now this shows where it will sit.</p>
      </div>
      <div className="border-t border-slate-200 p-4">
        <label htmlFor="coach-input" className="sr-only">
          Your answer
        </label>
        <textarea
          id="coach-input"
          disabled
          rows={3}
          placeholder="Describe the background and what's happening now, in your own words."
          className="w-full resize-none rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
        />
      </div>
    </aside>
  );
}
