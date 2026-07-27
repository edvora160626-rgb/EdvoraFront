const RISK_TONES = {
  High: "bg-red-50 text-red-600 border-red-100",
  Medium: "bg-amber-50 text-amber-700 border-amber-100",
  Low: "bg-emerald-50 text-emerald-700 border-emerald-100",
};

function RiskAlerts({ items = [], title = "AI Student Risk Alerts" }) {
  return (
    <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-4 sm:p-5">
      <h3 className="text-base font-semibold text-[#735366]">{title}</h3>
      <p className="text-xs text-slate-500 mt-0.5 mb-4">
        Early-warning signals from attendance & performance patterns
      </p>
      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={item.name}
            className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#A77A95] to-[#735366] text-white text-xs font-bold">
              {item.initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#735366] truncate">{item.name}</p>
              <p className="text-xs text-slate-500 truncate">{item.reason}</p>
            </div>
            <span
              className={`shrink-0 text-[10px] font-bold px-2 py-1 rounded-full border ${
                RISK_TONES[item.level] || RISK_TONES.Low
              }`}
            >
              {item.level}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default RiskAlerts;
