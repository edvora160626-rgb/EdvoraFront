import {
  DAYS,
  classLabel,
  slotAppliesToDay,
  teacherName,
} from "../../../utils/timetableApi";

function entryKey(day, slotId) {
  return `${day}:${String(slotId)}`;
}

/**
 * Read-only or clickable weekly grid.
 * Slots may apply only to specific days (slot.days); empty days = all days.
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

  const visibleSlots = slots.filter((slot) =>
    dayLabels.some((d) => slotAppliesToDay(slot, d.value))
  );

  if (!visibleSlots.length) {
    return (
      <div className="glass-strong rounded-2xl p-8 text-center text-sm text-[color:var(--edvora-muted)]">
        No period template configured. Add time slots in Settings.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-[color:var(--edvora-glass-border-soft)] bg-[color:var(--edvora-glass)] shadow-[var(--edvora-glass-shadow)] backdrop-blur-[18px]">
      <table className="min-w-full border-collapse text-left text-sm">
        <thead>
          <tr className="bg-[color:var(--edvora-glass-soft)]">
            <th className="sticky left-0 z-10 min-w-[110px] border-b border-[color:var(--edvora-glass-border-soft)] bg-[color:var(--edvora-glass-strong)] px-3 py-3 font-semibold text-[color:var(--edvora-muted)]">
              Period
            </th>
            {dayLabels.map((d) => (
              <th
                key={d.value}
                className="min-w-[140px] border-b border-[color:var(--edvora-glass-border-soft)] px-3 py-3 font-semibold text-[color:var(--edvora-muted)]"
              >
                {d.label.slice(0, 3)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visibleSlots.map((slot) => {
            const isBreak = slot.type === "BREAK" || slot.type === "LUNCH";
            return (
              <tr key={slot._id}>
                <td className="sticky left-0 z-10 border-b border-[color:var(--edvora-glass-border-soft)] bg-[color:var(--edvora-glass-strong)] px-3 py-2">
                  <p className="font-medium text-[color:var(--edvora-ink-strong)]">
                    {slot.name}
                  </p>
                  <p className="text-[11px] text-[color:var(--edvora-muted)]">
                    {slot.startTime}–{slot.endTime}
                  </p>
                </td>
                {dayLabels.map((d) => {
                  if (!slotAppliesToDay(slot, d.value)) {
                    return (
                      <td
                        key={d.value}
                        className="border-b border-[color:var(--edvora-glass-border-soft)] bg-[color:var(--edvora-glass-soft)]/40 px-2 py-2 text-center"
                      >
                        <span className="text-[10px] font-medium uppercase tracking-wide text-[color:var(--edvora-muted)]/50">
                          Off
                        </span>
                      </td>
                    );
                  }

                  if (isBreak) {
                    return (
                      <td
                        key={d.value}
                        className="border-b border-[color:var(--edvora-glass-border-soft)] px-2 py-2 text-center text-xs font-medium text-[color:var(--edvora-muted)]"
                      >
                        {slot.type}
                      </td>
                    );
                  }

                  const entry = map.get(entryKey(d.value, slot._id));
                  const clickable = !readOnly && onCellClick;
                  return (
                    <td
                      key={d.value}
                      className="border-b border-[color:var(--edvora-glass-border-soft)] p-1.5"
                    >
                      <button
                        type="button"
                        disabled={!clickable}
                        onClick={() =>
                          clickable && onCellClick({ day: d.value, slot, entry })
                        }
                        className={`min-h-[64px] w-full rounded-xl border px-2 py-1.5 text-left transition ${
                          entry
                            ? "border-[color:var(--edvora-primary)]/25 bg-[color:var(--edvora-primary)]/8"
                            : "border-dashed border-[color:var(--edvora-glass-border-soft)] bg-[color:var(--edvora-glass-soft)]/50"
                        } ${
                          clickable
                            ? "hover:border-[color:var(--edvora-primary)] cursor-pointer"
                            : "cursor-default"
                        }`}
                      >
                        {entry ? (
                          <>
                            <p className="text-[12px] font-semibold text-[color:var(--edvora-ink-strong)] leading-tight">
                              {entry.subjectId?.subjectName ||
                                entry.subjectName ||
                                "Assigned"}
                            </p>
                            {showClass && entry.classId && (
                              <p className="text-[10px] text-[color:var(--edvora-primary)]">
                                {classLabel(entry.classId)}
                              </p>
                            )}
                            <p className="text-[10px] text-[color:var(--edvora-muted)] truncate">
                              {teacherName(entry.teacherId)}
                            </p>
                            {entry.roomId && (
                              <p className="text-[10px] text-[color:var(--edvora-muted)]/80 truncate">
                                {entry.roomId.name || entry.roomId.code}
                              </p>
                            )}
                          </>
                        ) : (
                          <span className="text-[11px] text-[color:var(--edvora-muted)]/50">
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
