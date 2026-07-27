function BarChart({
  data = [],
  maxValue = 100,
  height = 140,
}) {
  const peak = maxValue || Math.max(...data.map((d) => Math.max(d.a || 0, d.b || 0)), 1);

  return (
    <div className="flex items-end justify-between gap-2 sm:gap-3" style={{ height }}>
      {data.map((item) => (
        <div key={item.label} className="flex flex-1 flex-col items-center gap-2 min-w-0">
          <div className="flex w-full items-end justify-center gap-1" style={{ height: height - 28 }}>
            <div
              className="w-[38%] rounded-t-md bg-linear-to-t from-[#A77A95] to-[#C3C3D5] transition-all duration-500"
              style={{ height: `${((item.a || 0) / peak) * 100}%` }}
              title={`${item.label} avg: ${item.a}%`}
            />
            <div
              className="w-[38%] rounded-t-md bg-linear-to-t from-[#D4B87A] to-[#F5D69B] transition-all duration-500"
              style={{ height: `${((item.b || 0) / peak) * 100}%` }}
              title={`${item.label} top: ${item.b}%`}
            />
          </div>
          <span className="text-[10px] sm:text-xs font-medium text-slate-500 truncate w-full text-center">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export default BarChart;
