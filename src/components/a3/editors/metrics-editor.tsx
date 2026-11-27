"use client";

import { useState, useTransition } from "react";
import { readTableFile } from "@/app/a3/[id]/actions";
import { parseCsv, tableToSeries, type DateOrder, type Table } from "@/lib/a3/import";
import type { EditorProps } from "./part-editors";
import { Grid, RowList, SelectField, TextField, newId } from "./fields";

type Metric = EditorProps<"metrics">["value"][number];
type Point = Metric["series"][number];

export function MetricsEditor({ value, onChange }: EditorProps<"metrics">) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-600">
        A metric is a number you track over time, such as turnaround in minutes. Use the same metric for the gap, the goal and
        the follow-up results so the story connects. Type values below or import them from a CSV or Excel file.
      </p>
      <RowList
        label="Metrics"
        rows={value}
        onChange={onChange}
        create={() => ({ id: newId("m"), name: "", unit: "", direction: "lower_is_better" as const, series: [] })}
        addLabel="Add a metric"
        render={(m, set) => <MetricRow metric={m} onChange={set} />}
      />
    </div>
  );
}

function MetricRow({ metric, onChange }: { metric: Metric; onChange: (m: Metric) => void }) {
  // Bumped on each import so the typed-values box redraws with the imported values.
  const [imports, setImports] = useState(0);
  return (
    <div className="space-y-3">
      <Grid cols={3}>
        <TextField label="Name" value={metric.name} placeholder="e.g. Lab turnaround" onChange={(name) => onChange({ ...metric, name })} />
        <TextField label="Unit" value={metric.unit} placeholder="e.g. min" onChange={(unit) => onChange({ ...metric, unit })} />
        <SelectField
          label="Better when"
          value={metric.direction}
          options={[
            { value: "lower_is_better", label: "Lower" },
            { value: "higher_is_better", label: "Higher" },
          ]}
          onChange={(direction) => onChange({ ...metric, direction })}
        />
      </Grid>
      <TextField
        label="Where the numbers come from"
        value={metric.source}
        onChange={(source) => onChange({ ...metric, source: source || undefined })}
      />
      <SeriesField key={imports} series={metric.series} onChange={(series) => onChange({ ...metric, series })} />
      <FileImport
        onImport={(series, fileName, mode) => {
          onChange({
            ...metric,
            series: mode === "replace" ? series : mergeSeries(metric.series, series),
            source: metric.source || `Imported from ${fileName}`,
          });
          setImports((n) => n + 1);
        }}
      />
    </div>
  );
}

function seriesToText(series: Point[]): string {
  return series.map((p) => `${p.date}, ${p.value}`).join("\n");
}

/** Typed values, one "date, value" pair per line. */
function SeriesField({ series, onChange }: { series: Point[]; onChange: (s: Point[]) => void }) {
  const [text, setText] = useState(() => seriesToText(series));
  const [skipped, setSkipped] = useState<number[]>([]);
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-slate-700">
        Values over time
        <textarea
          rows={Math.min(10, Math.max(3, series.length + 1))}
          value={text}
          placeholder={"2026-10-01, 85\n2026-10-08, 79"}
          onChange={(e) => {
            setText(e.target.value);
            const result = parseLines(e.target.value);
            setSkipped(result.skipped);
            onChange(result.series);
          }}
          className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 font-mono text-xs font-normal focus:border-blue-600 focus:outline-none"
        />
      </label>
      <p className="text-[11px] text-slate-500">
        One per line: date (YYYY-MM-DD or DD/MM/YYYY), then the value. {series.length} value{series.length === 1 ? "" : "s"}.
        {skipped.length > 0 && <span className="text-amber-700"> Line {skipped.join(", ")} could not be read and will not be saved.</span>}
      </p>
    </div>
  );
}

function parseLines(text: string) {
  const table = parseCsv(`date,value\n${text}`);
  return tableToSeries(table, 0, 1, "day_first");
}

function mergeSeries(a: Point[], b: Point[]): Point[] {
  const map = new Map(a.map((p) => [p.date, p.value]));
  for (const p of b) map.set(p.date, p.value);
  return [...map.entries()].sort(([x], [y]) => x.localeCompare(y)).map(([date, value]) => ({ date, value }));
}

function FileImport({ onImport }: { onImport: (s: Point[], fileName: string, mode: "replace" | "add") => void }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string>();
  const [file, setFile] = useState<{ table: Table; fileName: string }>();
  const [dateCol, setDateCol] = useState(0);
  const [valueCol, setValueCol] = useState(1);
  const [order, setOrder] = useState<DateOrder>("day_first");
  const preview = file ? tableToSeries(file.table, dateCol, valueCol, order) : undefined;

  return (
    <div className="rounded-md border border-dashed border-slate-300 bg-white p-3">
      <label className="text-xs font-medium text-slate-700">
        Import from a CSV or Excel file
        <input
          type="file"
          accept=".csv,.tsv,.txt,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          className="mt-1 block w-full text-xs"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            setError(undefined);
            setFile(undefined);
            const form = new FormData();
            form.set("file", f);
            start(async () => {
              const result = await readTableFile(form);
              if (!result.ok) return setError(result.error);
              setFile({ table: result.table, fileName: result.fileName });
              const guessDate = result.table.columns.findIndex((c) => /date|day|week|month|time/i.test(c));
              setDateCol(guessDate >= 0 ? guessDate : 0);
              setValueCol(guessDate === 0 || guessDate < 0 ? Math.min(1, result.table.columns.length - 1) : 0);
            });
          }}
        />
      </label>
      <p className="mt-1 text-[11px] text-slate-500">
        The first row should hold column names. Only the numbers you import are kept, not the file. Up to 2 MB.
      </p>
      {pending && <p className="mt-2 text-xs text-slate-600">Reading the file…</p>}
      {error && <p className="mt-2 text-xs text-red-700">{error}</p>}
      {file && preview && (
        <div className="mt-3 space-y-2">
          <Grid cols={3}>
            <SelectField
              label="Date column"
              value={String(dateCol)}
              options={file.table.columns.map((c, i) => ({ value: String(i), label: c }))}
              onChange={(v) => setDateCol(Number(v))}
            />
            <SelectField
              label="Value column"
              value={String(valueCol)}
              options={file.table.columns.map((c, i) => ({ value: String(i), label: c }))}
              onChange={(v) => setValueCol(Number(v))}
            />
            <SelectField
              label="Dates like 03/04/2026 mean"
              value={order}
              options={[
                { value: "day_first", label: "3 April (day first)" },
                { value: "month_first", label: "March 4 (month first)" },
              ]}
              onChange={setOrder}
            />
          </Grid>
          <p className="text-xs text-slate-700">
            {preview.series.length} value{preview.series.length === 1 ? "" : "s"} found
            {preview.series.length > 0 && ` from ${preview.series[0].date} to ${preview.series.at(-1)!.date}`}.
            {preview.skipped.length > 0 && (
              <span className="text-amber-700">
                {" "}
                {preview.skipped.length} row{preview.skipped.length === 1 ? "" : "s"} skipped because the date or value could not be read.
              </span>
            )}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={preview.series.length === 0}
              onClick={() => {
                onImport(preview.series, file.fileName, "replace");
                setFile(undefined);
              }}
              className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
            >
              Replace values
            </button>
            <button
              type="button"
              disabled={preview.series.length === 0}
              onClick={() => {
                onImport(preview.series, file.fileName, "add");
                setFile(undefined);
              }}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium disabled:opacity-50"
            >
              Add to values
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
