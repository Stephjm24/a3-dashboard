"use client";

import { startTransition, useActionState, useRef, useState } from "react";
import { savePart, type SaveState } from "@/app/a3/[id]/actions";
import { PART_LABELS, readPart, type EditablePart, type PartData } from "@/lib/a3/edit";
import type { A3Document } from "@/lib/a3/schema";
import { PartEditor } from "./part-editors";

/** An Edit button that opens the editor for one part of the A3 and saves it as a new version. */
export function EditButton({
  a3Id,
  version,
  doc,
  part,
  label = "Edit",
}: {
  a3Id: string;
  version: number;
  doc: A3Document;
  part: EditablePart;
  label?: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState<PartData<EditablePart>>(() => readPart(doc, part));
  // Remounts the editor on each open so it starts from the saved version.
  const [openCount, setOpenCount] = useState(0);
  const [dirty, setDirty] = useState(false);

  const [state, save, pending] = useActionState<SaveState | null>(async () => {
    const result = await savePart({ a3Id, baseVersion: version, part, data: draft });
    if (result.ok) {
      startTransition(() => {
        setDirty(false);
        dialog.current?.close();
      });
    }
    return result;
  }, null);

  const open = () => {
    setDraft(readPart(doc, part));
    setDirty(false);
    setOpenCount((n) => n + 1);
    dialog.current?.showModal();
  };
  const close = () => {
    if (dirty && !window.confirm("Discard your changes to this section?")) return;
    dialog.current?.close();
  };

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="rounded border border-slate-300 bg-white px-2 py-0.5 text-xs font-medium text-slate-700 hover:bg-slate-50 print:hidden"
      >
        {label}
      </button>
      <dialog
        ref={dialog}
        aria-label={`Edit ${PART_LABELS[part]}`}
        onCancel={(e) => {
          e.preventDefault();
          close();
        }}
        className="m-0 h-full max-h-none w-full max-w-none bg-white p-0 backdrop:bg-slate-900/40 sm:m-auto sm:h-auto sm:max-h-[90vh] sm:max-w-3xl sm:rounded-lg sm:shadow-xl"
      >
        <form
          action={save}
          className="flex h-full flex-col sm:max-h-[90vh]"
          onSubmit={(e) => {
            if (!dirty) {
              e.preventDefault();
              dialog.current?.close();
            }
          }}
        >
          <header className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
            <h2 className="text-sm font-semibold">Edit {PART_LABELS[part]}</h2>
            <button type="button" onClick={close} className="text-xs text-slate-600 hover:underline">
              Close
            </button>
          </header>
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {openCount > 0 && (
              <PartEditor
                key={openCount}
                part={part}
                doc={doc}
                value={draft}
                onChange={(v: PartData<EditablePart>) => {
                  setDraft(v);
                  setDirty(true);
                }}
              />
            )}
          </div>
          <footer className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 px-5 py-3">
            {state && !state.ok && (
              <p role="alert" className="mr-auto text-xs text-red-700">
                {state.error}
              </p>
            )}
            <button type="button" onClick={close} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm">
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="rounded-md bg-slate-900 px-4 py-1.5 text-sm font-medium text-white disabled:opacity-60"
            >
              {pending ? "Saving…" : `Save as v${version + 1}`}
            </button>
          </footer>
        </form>
      </dialog>
    </>
  );
}
