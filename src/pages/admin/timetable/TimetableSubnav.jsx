import { NavLink } from "react-router-dom";
import {
  CalendarClock,
  DoorOpen,
  LayoutGrid,
  Settings2,
  UserRound,
  Users,
} from "lucide-react";

const LINKS = [
  { to: "/admin/timetable", label: "Dashboard", icon: LayoutGrid, end: true },
  { to: "/admin/timetable/settings", label: "Settings", icon: Settings2 },
  { to: "/admin/timetable/rooms", label: "Rooms", icon: DoorOpen },
  {
    to: "/admin/timetable/allocations",
    label: "Allocations",
    icon: Users,
  },
  {
    to: "/admin/timetable/teacher",
    label: "Teacher View",
    icon: UserRound,
  },
];

export default function TimetableSubnav() {
  return (
    <div className="mb-5 flex flex-wrap gap-2">
      {LINKS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${
              isActive
                ? "border-[#A77A95] bg-[#A77A95] text-white shadow-sm"
                : "border-[#E8D5CE] bg-white text-[#735366] hover:border-[#A77A95]/50"
            }`
          }
        >
          <Icon size={15} />
          {label}
        </NavLink>
      ))}
      <span className="inline-flex items-center gap-2 rounded-lg border border-dashed border-[#E8D5CE] px-3 py-2 text-xs text-slate-400">
        <CalendarClock size={14} />
        Class grids open from Dashboard
      </span>
    </div>
  );
}
