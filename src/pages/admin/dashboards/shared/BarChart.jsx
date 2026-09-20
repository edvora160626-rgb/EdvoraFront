function BarChart({
  data = [],
  maxValue = 100,
  height = 140,
}) {
  const peak =
    maxValue || Math.max(...data.map((d) => Math.max(d.a || 0, d.b || 0)), 1);

  return (
    <div
      className="flex items-end justify-between gap-2 sm:gap-3"
      style={{ height }}
    >
      {data.map((item) => (
        <div
          key={item.label}
          className="flex min-w-0 flex-1 flex-col items-center gap-2"
        >
          <div
            className="flex w-full items-end justify-center gap-1"
            style={{ height: height - 28 }}
          >
            <div
              className="w-[38%] rounded-t-md transition-all duration-500"
              style={{
                height: `${((item.a || 0) / peak) * 100}%`,
                background:
                  "linear-gradient(to top, var(--edvora-primary), var(--edvora-secondary))",
              }}
              title={`${item.label} avg: ${item.a}%`}
            />
            <div
              className="w-[38%] rounded-t-md transition-all duration-500"
              style={{
                height: `${((item.b || 0) / peak) * 100}%`,
                background:
                  "linear-gradient(to top, var(--edvora-accent-hover), var(--edvora-accent))",
              }}
              title={`${item.label} top: ${item.b}%`}
            />
          </div>
          <span className="w-full truncate text-center text-[10px] font-medium text-[color:var(--edvora-muted)] sm:text-xs">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export default BarChart;
