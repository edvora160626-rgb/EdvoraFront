import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function DashboardHero({
  portalTitle,
  firstName,
  summary,
  ctaLabel,
  ctaTo,
  accentStats = [],
  children,
}) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <section className="relative overflow-hidden rounded-2xl bg-linear-to-br from-[#A77A95] via-[#8F6580] to-[#735366] text-white p-5 sm:p-7 shadow-xl">
      <div className="absolute -top-10 -right-10 h-44 w-44 rounded-full bg-[#F5D69B]/25 blur-2xl animate-pulse" />
      <div className="absolute -bottom-14 -left-10 h-40 w-40 rounded-full bg-[#C3C3D5]/20 blur-2xl" />
      <div className="absolute top-1/2 right-1/4 h-24 w-24 rounded-full bg-white/5 blur-xl" />

      <div className="relative flex flex-col xl:flex-row xl:items-center gap-6">
        <div className="flex-1 min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#F5D69B]/20 border border-[#F5D69B]/40 px-3 py-1 text-xs font-medium text-[#FAEEE9] mb-3">
            <Sparkles size={14} className="text-[#F5D69B]" />
            {portalTitle}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {getGreeting()}
            {firstName ? `, ${firstName}` : ""}!
          </h1>
          <p className="mt-2 text-sm sm:text-base text-white/85 max-w-xl">{summary}</p>
          <p className="mt-2 text-xs text-white/60">{today}</p>

          {ctaLabel && ctaTo ? (
            <Link
              to={ctaTo}
              className="mt-4 inline-flex items-center justify-center rounded-xl bg-[#F5D69B] px-4 py-2.5 text-sm font-semibold text-[#735366] shadow-md hover:bg-[#D4B87A] transition"
            >
              {ctaLabel}
            </Link>
          ) : null}
        </div>

        {accentStats.length ? (
          <div className="grid grid-cols-2 gap-3 min-w-0 xl:min-w-[280px]">
            {accentStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl bg-white/12 backdrop-blur-md border border-white/20 p-3.5"
              >
                <p className="text-[11px] text-white/75">{stat.label}</p>
                <p className={`text-2xl font-bold mt-0.5 ${stat.highlight ? "text-[#F5D69B]" : ""}`}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        ) : null}

        {children}
      </div>
    </section>
  );
}

export default DashboardHero;
