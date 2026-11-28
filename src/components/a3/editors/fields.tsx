"use client";

import { useId, useState, type ReactNode } from "react";

const input =
  "w-full rounded-md border border-slate-500 bg-white px-2.5 py-1.5 text-sm font-normal focus:border-blue-700 focus:outline-2 focus:outline-offset-1 focus:outline-blue-700";

export function newId(prefix: string): string {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}_${random}`;
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: (id: string) => ReactNode }) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-medium text-slate-700">
        {label}
      </label>
      {children(id)}
      {hint && <p className="text-[11px] text-slate-500">{hint}</p>}
    </div>
  );
}

export function TextField(props: {
  label: string;
  value: string | undefined;
  onChange: (v: string) => void;
  hint?: string;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
}) {
  return (
    <Field label={props.label} hint={props.hint}>
      {(id) =>
        props.multiline ? (
          <textarea
            id={id}
            rows={props.rows ?? 3}
            value={props.value ?? ""}
            placeholder={props.placeholder}
            onChange={(e) => props.onChange(e.target.value)}
            className={input}
          />
        ) : (
          <input
            id={id}
            value={props.value ?? ""}
            placeholder={props.placeholder}
            onChange={(e) => props.onChange(e.target.value)}
            className={input}
          />
        )
      }
    </Field>
  );
}

export function DateField(props: { label: string; value: string | undefined; onChange: (v: string) => void; hint?: string }) {
  return (
    <Field label={props.label} hint={props.hint}>
      {(id) => <input id={id} type="date" value={props.value ?? ""} onChange={(e) => props.onChange(e.target.value)} className={input} />}
    </Field>
  );
}

/** A number box that lets the person type freely and reports null while it's empty or unreadable. */
export function NumberField(props: {
  label: string;
  value: number | null | undefined;
  onChange: (v: number | null) => void;
  hint?: string;
  min?: number;
  max?: number;
  step?: number;
}) {
  const [text, setText] = useState(props.value === null || props.value === undefined ? "" : String(props.value));
  return (
    <Field label={props.label} hint={props.hint}>
      {(id) => (
        <input
          id={id}
          inputMode="decimal"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            const t = e.target.value.trim().replace(",", ".");
            const n = Number(t);
            props.onChange(t === "" || !Number.isFinite(n) ? null : n);
          }}
          className={input}
        />
      )}
    </Field>
  );
}

export function SelectField<T extends string>(props: {
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (v: T) => void;
  hint?: string;
}) {
  return (
    <Field label={props.label} hint={props.hint}>
      {(id) => (
        <select id={id} value={props.value} onChange={(e) => props.onChange(e.target.value as T)} className={input}>
          {props.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    </Field>
  );
}

export function CheckboxField(props: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
      <input type="checkbox" checked={props.checked} onChange={(e) => props.onChange(e.target.checked)} className="h-4 w-4" />
      {props.label}
    </label>
  );
}

/** A list of rows the person can add to, remove from and reorder. */
export function RowList<T>(props: {
  label: string;
  hint?: string;
  rows: T[];
  onChange: (rows: NoInfer<T>[]) => void;
  create: () => NoInfer<T>;
  addLabel: string;
  render: (row: T, update: (row: T) => void, index: number) => ReactNode;
}) {
  const { rows } = props;
  // Stable keys per row, so a removed or moved row takes its typed text with it.
  const [savedKeys, setKeys] = useState(() => rows.map(() => newId("row")));
  const keys = rows.map((_, i) => savedKeys[i] ?? `extra_${i}`);
  const change = (next: T[], nextKeys: string[]) => {
    setKeys(nextKeys);
    props.onChange(next);
  };
  const set = (i: number, row: T) => props.onChange(rows.map((r, j) => (j === i ? row : r)));
  const move = (i: number, d: -1 | 1) => {
    const next = [...rows];
    const nextKeys = [...keys];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    [nextKeys[i], nextKeys[i + d]] = [nextKeys[i + d], nextKeys[i]];
    change(next, nextKeys);
  };
  const remove = (i: number) =>
    change(
      rows.filter((_, j) => j !== i),
      keys.filter((_, j) => j !== i),
    );
  return (
    <fieldset className="space-y-2">
      <legend className="text-xs font-semibold text-slate-800">{props.label}</legend>
      {props.hint && <p className="text-[11px] text-slate-500">{props.hint}</p>}
      {rows.map((row, i) => (
        <div key={keys[i]} className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <div className="mb-2 flex justify-end gap-1 text-[11px]">
            <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className={rowButton} aria-label="Move up">
              ↑
            </button>
            <button type="button" disabled={i === rows.length - 1} onClick={() => move(i, 1)} className={rowButton} aria-label="Move down">
              ↓
            </button>
            <button type="button" onClick={() => remove(i)} className={`${rowButton} text-red-700`}>
              Remove
            </button>
          </div>
          {props.render(row, (r) => set(i, r), i)}
        </div>
      ))}
      <button type="button" onClick={() => change([...rows, props.create()], [...keys.slice(0, rows.length), newId("row")])} className="text-xs font-medium text-blue-700 hover:underline">
        + {props.addLabel}
      </button>
    </fieldset>
  );
}

const rowButton = "rounded border border-slate-300 bg-white px-2 py-0.5 disabled:opacity-40";

/** A list of short text lines, one per row. */
export function LinesField(props: { label: string; hint?: string; value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  return (
    <TextField
      label={props.label}
      hint={props.hint ?? "One per line."}
      multiline
      rows={Math.max(2, Math.min(6, props.value.length + 1))}
      placeholder={props.placeholder}
      value={props.value.join("\n")}
      onChange={(v) => props.onChange(v.split("\n"))}
    />
  );
}

export function Grid({ cols = 2, children }: { cols?: 2 | 3 | 4; children: ReactNode }) {
  const c = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4" }[cols];
  return <div className={`grid grid-cols-1 gap-3 ${c}`}>{children}</div>;
}
