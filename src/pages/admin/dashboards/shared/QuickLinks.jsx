import { Link } from "react-router-dom";

function QuickLinks({ items = [] }) {
  if (!items.length) return null;

  return (
    <section>
      <h2 className="text-sm font-semibold text-[color:var(--edvora-muted)] mb-3">
        Quick Links
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {items.map((item) => {
          const Icon = item.icon;
          const content = (
            <>
              <span className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-[color:var(--edvora-primary)] text-white shadow-md transition group-hover:scale-105">
                {Icon ? <Icon size={18} /> : null}
              </span>
              <span className="text-center text-xs font-semibold leading-tight text-[color:var(--edvora-ink-strong)]">
                {item.label}
              </span>
            </>
          );

          const className =
            "group flex min-h-[96px] flex-col items-center justify-center rounded-2xl border border-[color:var(--edvora-glass-border-soft)] bg-[color:var(--edvora-card)] p-3 shadow-[var(--edvora-glass-shadow)] transition hover:-translate-y-0.5 hover:shadow-md";

          if (item.to) {
            return (
              <Link key={item.label} to={item.to} className={className}>
                {content}
              </Link>
            );
          }

          return (
            <div key={item.label} className={`${className} cursor-default opacity-80`}>
              {content}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default QuickLinks;
