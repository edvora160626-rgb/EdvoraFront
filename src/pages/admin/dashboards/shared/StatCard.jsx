import { Link } from "react-router-dom";
import Sparkline from "./Sparkline";

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  spark = [4, 7, 5, 9, 6, 11, 8],
  accent,
  to,
}) {
  const accentColor = accent || "var(--edvora-primary)";
  const deepColor = "var(--edvora-primary-deep)";

  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-medium text-[color:var(--edvora-muted)] truncate">
            {title}
          </p>
          <p className="mt-1 text-2xl sm:text-3xl font-bold text-[color:var(--edvora-ink-strong)]">
            {value}
          </p>
          {subtitle ? (
            <p className="mt-1 text-[11px] sm:text-xs text-[color:var(--edvora-muted)] line-clamp-2">
              {subtitle}
            </p>
          ) : null}
        </div>
        {Icon ? (
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm"
            style={{
              background: `linear-gradient(135deg, ${accentColor}, ${deepColor})`,
            }}
          >
            <Icon size={18} />
          </span>
        ) : null}
      </div>
      <div className="mt-3 flex justify-end opacity-80 group-hover:opacity-100 transition">
        <Sparkline points={spark} color={accentColor} />
      </div>
    </>
  );

  const className =
    "group relative overflow-hidden rounded-2xl border border-[color:var(--edvora-glass-border-soft)] bg-[color:var(--edvora-card)] shadow-[var(--edvora-glass-shadow)] p-4 sm:p-5 transition hover:shadow-md hover:-translate-y-0.5 block";

  if (to) {
    return (
      <Link to={to} className={className}>
        {body}
      </Link>
    );
  }

  return <div className={className}>{body}</div>;
}

export default StatCard;
