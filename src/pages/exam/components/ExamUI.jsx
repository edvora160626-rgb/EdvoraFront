/** Shared presentational primitives — Resilink-style responsive scale. */

export function PageHeader({ title, description, action, module }) {
  return (
    <div className="mb-3 xs:mb-4 sm:mb-5 md:mb-6 flex flex-col gap-2 sm:gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {module ? (
          <p className="rs-caption font-semibold text-[#A77A95] mb-1">
            <span className="text-[#735366]/70">{module}</span>
            <span className="mx-1.5 text-[#735366]/40">{">>"}</span>
            <span>{title}</span>
          </p>
        ) : null}
        <h1 className="rs-title text-[#3d1f33]">{title}</h1>
        {description ? (
          <p className="rs-subtitle mt-1 text-[#735366]/70 max-w-2xl">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0 w-full sm:w-auto">{action}</div> : null}
    </div>
  );
}

export function Surface({ children, className = "" }) {
  return <div className={`rs-card ${className}`}>{children}</div>;
}

export function Pill({ children, tone = "default" }) {
  const tones = {
    default: "bg-[#FAEEE9] text-[#735366]",
    success: "bg-emerald-50 text-emerald-700",
    warn: "bg-amber-50 text-amber-800",
    info: "bg-[#F5D69B]/35 text-[#735366]",
  };
  return (
    <span className={`rs-pill ${tones[tone] || tones.default}`}>{children}</span>
  );
}

export function PrimaryButton({ children, className = "", ...props }) {
  return (
    <button
      type="button"
      className={`rs-btn rs-btn-primary ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function GhostButton({ children, className = "", ...props }) {
  return (
    <button
      type="button"
      className={`rs-btn rs-btn-ghost ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function EmptyState({ title, description }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#e0cce0] bg-white/60 px-4 py-8 xs:px-5 xs:py-10 sm:px-6 sm:py-12 text-center">
      <p className="rs-title text-[#3d1f33]">{title}</p>
      {description ? (
        <p className="rs-subtitle mt-1 text-[#735366]/65">{description}</p>
      ) : null}
    </div>
  );
}
