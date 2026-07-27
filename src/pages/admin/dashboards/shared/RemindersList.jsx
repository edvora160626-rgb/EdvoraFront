import { Bell } from "lucide-react";

function RemindersList({ items = [], title = "Smart Reminders" }) {
  return (
    <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-4">
        <Bell size={16} className="text-[#A77A95]" />
        <h3 className="text-sm font-semibold text-[#735366]">{title}</h3>
      </div>
      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={item.title}
            className="rounded-xl border border-[#C3C3D5]/60 bg-[#FAEEE9]/60 p-3"
          >
            <p className="text-sm font-semibold text-[#735366]">{item.title}</p>
            <p className="text-xs text-slate-500 mt-0.5">{item.detail}</p>
            {item.when ? (
              <p className="mt-1.5 text-[11px] font-medium text-[#8F6580]">{item.when}</p>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default RemindersList;
