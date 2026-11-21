/** Petits graphiques SVG du tableau de bord (rendus côté serveur, sans bibliothèque). */

type DailyLabels = { chart: (total: number, max: number) => string; start: string; end: string; locale: string };

/** Demandes par jour : barres verticales, valeur du jour le plus haut indiquée. */
export function DailyBars({ data, labels }: { data: { date: string; count: number }[]; labels: DailyLabels }) {
  const dayFormat = new Intl.DateTimeFormat(labels.locale, { weekday: "short", day: "numeric", timeZone: "UTC" });
  const max = Math.max(1, ...data.map((day) => day.count));
  const total = data.reduce((sum, day) => sum + day.count, 0);
  const width = 280;
  const height = 96;
  const gap = 4;
  const bar = (width - gap * (data.length - 1)) / data.length;

  return (
    <figure dir="ltr" className="grid gap-2">
      <svg
        viewBox={`0 0 ${width} ${height + 18}`}
        role="img"
        aria-label={labels.chart(total, max)}
        className="h-auto w-full"
      >
        <line x1="0" x2={width} y1={height} y2={height} className="stroke-soil-200" strokeWidth="1" />
        {data.map((day, index) => {
          const h = day.count === 0 ? 0 : Math.max(3, (day.count / max) * (height - 14));
          const x = index * (bar + gap);
          const today = index === data.length - 1;
          return (
            <g key={day.date}>
              <title>{`${dayFormat.format(new Date(day.date))} : ${day.count}`}</title>
              <rect x={x} y={height - h} width={bar} height={h} rx="2" className={today ? "fill-water-600" : "fill-field-600"} />
              {day.count === max && max > 0 ? (
                <text x={x + bar / 2} y={height - h - 4} textAnchor="middle" className="fill-soil-700 text-[10px]">
                  {day.count}
                </text>
              ) : null}
            </g>
          );
        })}
        <text x="0" y={height + 14} className="fill-soil-500 text-[10px]">
          {labels.start}
        </text>
        <text x={width} y={height + 14} textAnchor="end" className="fill-soil-500 text-[10px]">
          {labels.end}
        </text>
      </svg>
    </figure>
  );
}

/** Classement : barres horizontales avec libellé et valeur directement lisibles. */
export function RankBars({ data, empty }: { data: { label: string; count: number }[]; empty: string }) {
  if (data.length === 0) return <p className="text-sm text-soil-500">{empty}</p>;
  const max = Math.max(...data.map((item) => item.count));
  return (
    <ul className="grid gap-2.5">
      {data.map((item) => (
        <li key={item.label} className="grid gap-1">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate text-soil-800">{item.label}</span>
            <span className="tabular-nums font-semibold text-soil-900">{item.count}</span>
          </div>
          <div className="h-2 rounded-full bg-soil-100" aria-hidden="true">
            <div className="h-2 rounded-full bg-field-600" style={{ width: `${(item.count / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
