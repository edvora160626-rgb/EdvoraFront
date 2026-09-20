function ScheduleTimeline({ items = [], title = "Today's Schedule" }) {
  return (
    <div className="rounded-2xl border border-[color:var(--edvora-glass-border-soft)] bg-[color:var(--edvora-card)] shadow-[var(--edvora-glass-shadow)] p-4 sm:p-5">
      <h3 className="mb-4 text-sm font-semibold text-[color:var(--edvora-ink-strong)]">
        {title}
      </h3>
      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={`${item.time}-${item.title}`}
            className={`relative border-l-2 pl-4 ${
              item.now
                ? "border-[color:var(--edvora-primary)]"
                : "border-[color:var(--edvora-secondary)]"
            }`}
          >
            <div
              className={`rounded-xl p-3 ${
                item.now
                  ? "border border-[color:var(--edvora-primary-border)] bg-[color:var(--edvora-primary-soft)]"
                  : "border border-transparent bg-[color:var(--edvora-glass-soft)]"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[color:var(--edvora-ink-strong)]">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-xs text-[color:var(--edvora-muted)]">
                    {item.meta}
                  </p>
                </div>
                {item.now ? (
                  <span className="shrink-0 rounded-full bg-[color:var(--edvora-primary)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                    Now
                  </span>
                ) : null}
              </div>
              <p className="mt-2 text-[11px] font-medium text-[color:var(--edvora-primary-hover)]">
                {item.time}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ScheduleTimeline;
