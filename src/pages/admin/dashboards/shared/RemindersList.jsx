import { Bell } from "lucide-react";

function RemindersList({ items = [], title = "Smart Reminders" }) {
  return (
    <div className="rounded-2xl border border-[color:var(--edvora-glass-border-soft)] bg-[color:var(--edvora-card)] shadow-[var(--edvora-glass-shadow)] p-4 sm:p-5">
      <div className="mb-4 flex items-center gap-2">
        <Bell size={16} className="text-[color:var(--edvora-primary)]" />
        <h3 className="text-sm font-semibold text-[color:var(--edvora-ink-strong)]">
          {title}
        </h3>
      </div>
      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={item.title}
            className="rounded-xl border border-[color:var(--edvora-primary-border)] bg-[color:var(--edvora-primary-soft)] p-3"
          >
            <p className="text-sm font-semibold text-[color:var(--edvora-ink-strong)]">
              {item.title}
            </p>
            <p className="mt-0.5 text-xs text-[color:var(--edvora-muted)]">
              {item.detail}
            </p>
            {item.when ? (
              <p className="mt-1.5 text-[11px] font-medium text-[color:var(--edvora-primary-hover)]">
                {item.when}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default RemindersList;
