const RISK_TONES = {
  High: "bg-red-50 text-red-600 border-red-100",
  Medium: "bg-amber-50 text-amber-700 border-amber-100",
  Low: "bg-emerald-50 text-emerald-700 border-emerald-100",
};

function RiskAlerts({ items = [], title = "AI Student Risk Alerts" }) {
  return (
    <div className="rounded-2xl border border-[color:var(--edvora-glass-border-soft)] bg-[color:var(--edvora-card)] shadow-[var(--edvora-glass-shadow)] p-4 sm:p-5">
      <h3 className="text-base font-semibold text-[color:var(--edvora-ink-strong)]">
        {title}
      </h3>
      <p className="mt-0.5 mb-4 text-xs text-[color:var(--edvora-muted)]">
        Early-warning signals from attendance & performance patterns
      </p>
      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={item.name}
            className="flex items-center gap-3 rounded-xl border border-[color:var(--edvora-glass-border-soft)] bg-[color:var(--edvora-glass-soft)] p-3"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[color:var(--edvora-primary)] text-xs font-bold text-white">
              {item.initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[color:var(--edvora-ink-strong)]">
                {item.name}
              </p>
              <p className="truncate text-xs text-[color:var(--edvora-muted)]">
                {item.reason}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-bold ${
                RISK_TONES[item.level] || RISK_TONES.Low
              }`}
            >
              {item.level}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default RiskAlerts;
