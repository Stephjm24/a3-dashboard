import type { A3Document } from "@/lib/a3/schema";

type RootCause = A3Document["rootCause"];

/** 5 Whys: each chain read top to bottom, with evidence and whether each link was checked. */
export function WhyChains({ chains }: { chains: RootCause["whyChains"] }) {
  const shown = chains.filter((c) => c.problem.trim() || c.steps.length > 0);
  if (shown.length === 0) return null;
  return (
    <div className="space-y-3">
      {shown.map((chain) => (
        <ol key={chain.id} className="space-y-1 text-xs" aria-label={`5 Whys for ${chain.problem}`}>
          <li className="rounded border border-slate-300 bg-slate-50 px-3 py-1.5 font-medium">{chain.problem || "Problem"}</li>
          {chain.steps.map((step, i) => (
            <li key={i} className="ml-3 border-l-2 border-slate-300 pl-3">
              <p className="text-slate-500">Why? {step.why}</p>
              <p className="font-medium">
                Because: {step.because}{" "}
                <span className={step.verified ? "text-green-700" : "text-amber-700"}>
                  {step.verified ? "✓ checked" : "? not yet checked"}
                </span>
              </p>
              {step.evidence && <p className="text-slate-500">Evidence: {step.evidence}</p>}
            </li>
          ))}
        </ol>
      ))}
    </div>
  );
}

/** Fishbone (Ishikawa): categories as bones along a spine that points at the effect. */
export function Fishbone({ fishbone }: { fishbone: RootCause["fishbone"] }) {
  if (!fishbone || fishbone.categories.length === 0) return null;
  const cats = fishbone.categories;
  const perSide = Math.ceil(cats.length / 2);
  const W = 480;
  const headW = 110;
  const spineY = 150;
  const spineEnd = W - headW - 8;
  const step = (spineEnd - 20) / perSide;
  const boneLen = 115;
  const maxCauses = 4;
  return (
    <svg viewBox={`0 0 ${W} 300`} className="h-auto w-full" role="img" aria-label={`Fishbone for ${fishbone.effect}`}>
      <line x1={10} y1={spineY} x2={spineEnd} y2={spineY} stroke="#191919" strokeWidth={2} />
      <rect x={spineEnd} y={spineY - 30} width={headW} height={60} rx={6} fill="#f1f5f9" stroke="#191919" />
      <foreignObject x={spineEnd + 4} y={spineY - 28} width={headW - 8} height={56}>
        <div className="flex h-full items-center justify-center text-center text-[12px] font-semibold leading-tight">
          {fishbone.effect || "Effect"}
        </div>
      </foreignObject>
      {cats.map((cat, i) => {
        const top = i % 2 === 0;
        const slot = Math.floor(i / 2);
        const x = 30 + slot * step + step * 0.75;
        const dir = top ? -1 : 1;
        const x0 = x - boneLen * 0.55;
        const y0 = spineY + dir * boneLen;
        return (
          <g key={i}>
            <line x1={x0} y1={y0} x2={x} y2={spineY} stroke="#666666" strokeWidth={1.5} />
            <text x={x0} y={top ? y0 - 8 : y0 + 16} fontSize={13} fontWeight={600} fill="#191919" textAnchor="middle">
              {cat.name}
            </text>
            {cat.causes.slice(0, maxCauses).map((cause, j) => {
              const t = (j + 1) / (Math.min(cat.causes.length, maxCauses) + 1);
              const cx = x0 + (x - x0) * t;
              const cy = y0 + (spineY - y0) * t;
              return (
                <g key={cause.id}>
                  <line x1={cx} y1={cy} x2={cx + 6} y2={cy} stroke="#9ca3af" strokeWidth={1} />
                  <text x={cx + 8} y={cy + 3} fontSize={11} fill="#191919">
                    <title>{cause.text}</title>
                    {cause.text.length > 18 ? `${cause.text.slice(0, 17)}…` : cause.text}
                  </text>
                </g>
              );
            })}
            {cat.causes.length > maxCauses && (
              <text x={x} y={top ? spineY - 6 : spineY + 14} fontSize={10} fill="#666666" textAnchor="end">
                +{cat.causes.length - maxCauses} more
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
