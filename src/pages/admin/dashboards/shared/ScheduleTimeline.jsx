function ScheduleTimeline({ items = [], title = "Today's Schedule" }) {
  return (
    <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-4 sm:p-5">
      <h3 className="text-sm font-semibold text-[#735366] mb-4">{title}</h3>
      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={`${item.time}-${item.title}`}
            className={`relative pl-4 border-l-2 ${
              item.now ? "border-[#A77A95]" : "border-[#C3C3D5]"
            }`}
          >
            <div
              className={`rounded-xl p-3 ${
                item.now
                  ? "bg-[#FAEEE9] border border-[#C3C3D5]"
                  : "bg-slate-50/80 border border-transparent"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#735366] truncate">{item.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{item.meta}</p>
                </div>
                {item.now ? (
                  <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide bg-[#A77A95] text-white px-2 py-0.5 rounded-full">
                    Now
                  </span>
                ) : null}
              </div>
              <p className="mt-2 text-[11px] font-medium text-[#8F6580]">{item.time}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ScheduleTimeline;
