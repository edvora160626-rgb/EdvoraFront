import { DAYS, classLabel, teacherName } from "../../../utils/timetableApi";

function entryKey(day, slotId) {
  return `${day}:${String(slotId)}`;
}

/**
 * Read-only or clickable weekly grid.
 * entries: array with day, timeSlotId (id or populated), subjectId, teacherId, roomId, classId?
 */
export default function TimetableGridView({
  workingDays = ["MON", "TUE", "WED", "THU", "FRI"],
  slots = [],
  entries = [],
  onCellClick,
  readOnly = true,
  showClass = false,
}) {
  const map = new Map();
  for (const e of entries) {
    const slotId = e.timeSlotId?._id || e.timeSlotId;
    if (!slotId) continue;
    map.set(entryKey(e.day, slotId), e);
  }

  const dayLabels = DAYS.filter((d) => workingDays.includes(d.value));

  if (!slots.length) {
    return (
      <div className="rounded-xl border border-slate-100 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
        No period template configured. Add time slots in Settings.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white shadow-sm">
      <table className="min-w-full border-collapse text-left text-sm">
        <thead>
          <tr className="bg-[#FAEEE9]/70">
            <th className="sticky left-0 z-10 min-w-[110px] border-b border-slate-100 bg-[#FAEEE9] px-3 py-3 font-semibold text-[#667085]">
              Period
            </th>
            {dayLabels.map((d) => (
              <th
                key={d.value}
                className="min-w-[140px] border-b border-slate-100 px-3 py-3 font-semibold text-[#667085]"
              >
                {d.label.slice(0, 3)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {slots.map((slot) => {
            const isBreak = slot.type === "BREAK" || slot.type === "LUNCH";
            return (
              <tr key={slot._id} className={isBreak ? "bg-slate-50/80" : ""}>
                <td className="sticky left-0 z-10 border-b border-slate-50 bg-white px-3 py-2">
                  <p className="font-medium text-[#735366]">{slot.name}</p>
                  <p className="text-[11px] text-slate-400">
                    {slot.startTime}–{slot.endTime}
                  </p>
                </td>
                {dayLabels.map((d) => {
                  if (isBreak) {
                    return (
                      <td
                        key={d.value}
                        className="border-b border-slate-50 px-2 py-2 text-center text-xs font-medium text-slate-400"
                      >
                        {slot.type}
                      </td>
                    );
                  }
                  const entry = map.get(entryKey(d.value, slot._id));
                  const clickable = !readOnly && onCellClick;
                  return (
                    <td key={d.value} className="border-b border-slate-50 p-1.5">
                      <button
                        type="button"
                        disabled={!clickable}
                        onClick={() =>
                          clickable && onCellClick({ day: d.value, slot, entry })
                        }
                        className={`min-h-[64px] w-full rounded-lg border px-2 py-1.5 text-left transition ${
                          entry
                            ? "border-[#E8D5CE] bg-[#FAEEE9]/50"
                            : "border-dashed border-slate-200 bg-white"
                        } ${
                          clickable
                            ? "hover:border-[#A77A95] cursor-pointer"
                            : "cursor-default"
                        }`}
                      >
                        {entry ? (
                          <>
                            <p className="text-[12px] font-semibold text-[#735366] leading-tight">
                              {entry.subjectId?.subjectName ||
                                entry.subjectName ||
                                "Assigned"}
                            </p>
                            {showClass && entry.classId && (
                              <p className="text-[10px] text-[#A77A95]">
                                {classLabel(entry.classId)}
                              </p>
                            )}
                            <p className="text-[10px] text-slate-500 truncate">
                              {teacherName(entry.teacherId)}
                            </p>
                            {entry.roomId && (
                              <p className="text-[10px] text-slate-400 truncate">
                                {entry.roomId.name || entry.roomId.code}
                              </p>
                            )}
                          </>
                        ) : (
                          <span className="text-[11px] text-slate-300">
                            {clickable ? "Assign" : "—"}
                          </span>
                        )}
                      </button>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
