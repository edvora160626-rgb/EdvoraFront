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
    <section
      className="relative overflow-hidden rounded-xl xs:rounded-2xl text-white p-3 xs:p-4 sm:p-5 md:p-6 lg:p-7 [@media(min-width:1750px)]:p-8 shadow-xl"
      style={{
        background:
          "linear-gradient(135deg, var(--edvora-primary) 0%, var(--edvora-primary-hover) 48%, var(--edvora-primary-deep) 100%)",
      }}
    >
      <div
        className="absolute -top-10 -right-10 h-44 w-44 rounded-full blur-2xl animate-pulse"
        style={{
          background:
            "color-mix(in srgb, var(--edvora-accent) 35%, transparent)",
        }}
      />
      <div className="absolute -bottom-14 -left-10 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
      <div className="absolute top-1/2 right-1/4 h-24 w-24 rounded-full bg-white/5 blur-xl" />

      <div className="relative flex flex-col xl:flex-row xl:items-center gap-4 sm:gap-5 md:gap-6">
        <div className="flex-1 min-w-0">
          <div className="inline-flex items-center gap-1.5 xs:gap-2 rounded-full border border-white/30 bg-white/15 px-2.5 py-0.5 xs:px-3 xs:py-1 rs-caption font-medium text-white/95 mb-2 sm:mb-3">
            <Sparkles className="w-[1em] h-[1em] text-[clamp(11px,2.5vw,14px)] text-[color:var(--edvora-accent)]" />
            {portalTitle}
          </div>

          <h1 className="rs-hero-title">
            {getGreeting()}
            {firstName ? `, ${firstName}` : ""}!
          </h1>
          <p className="mt-1.5 sm:mt-2 rs-subtitle text-white/85 max-w-xl">
            {summary}
          </p>
          <p className="mt-1.5 sm:mt-2 rs-caption text-white/60">{today}</p>

          {ctaLabel && ctaTo ? (
            <Link
              to={ctaTo}
              replace
              className="rs-btn rs-btn-primary mt-3 sm:mt-4 !bg-[color:var(--edvora-accent)] !text-[color:var(--edvora-primary-deep)] !shadow-md hover:brightness-95"
            >
              {ctaLabel}
            </Link>
          ) : null}
        </div>

        {accentStats.length ? (
          <div className="grid grid-cols-2 gap-2 xs:gap-3 min-w-0 xl:min-w-[280px] [@media(min-width:1750px)]:min-w-[320px]">
            {accentStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl bg-white/12 backdrop-blur-md border border-white/20 p-2.5 xs:p-3 sm:p-3.5"
              >
                <p className="rs-caption text-white/75">{stat.label}</p>
                <p
                  className={`rs-hero-stat-value mt-0.5 ${
                    stat.highlight ? "text-[color:var(--edvora-accent)]" : ""
                  }`}
                >
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
