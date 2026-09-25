import { useMemo, useRef, useState } from "react";
import { BookOpen, DoorOpen, Trash2, UserRound, X } from "lucide-react";
import CustomSelect from "../../../common/CustomSelect";
import { DAYS, classLabel, teacherName } from "../../../utils/timetableApi";

const labelClass =
  "block text-[12px] font-semibold tracking-wide uppercase text-[color:var(--edvora-muted)] mb-1.5";

function toMinutes(value) {
  const match = String(value || "").match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

function toHHMM(total) {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function formatClock(total) {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  const suffix = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

function rangesOverlap(a0, a1, b0, b1) {
  return a0 < b1 && b0 < a1;
}

function blockWindow(entry, slotsById) {
  const start = toMinutes(entry.startTime);
  const end = toMinutes(entry.endTime);
  if (start != null && end != null && end > start) {
    return { start, end, name: entry.periodName || "" };
  }
  const slotId = entry.timeSlotId?._id || entry.timeSlotId;
  const slot = slotsById.get(String(slotId || ""));
  if (!slot) return null;
  const slotStart = toMinutes(slot.startTime);
  const slotEnd = toMinutes(slot.endTime);
  if (slotStart == null || slotEnd == null || slotEnd <= slotStart) return null;
  return { start: slotStart, end: slotEnd, name: entry.periodName || slot.name || "" };
}

function subjectLabel(entry) {
  const subject = entry.subjectId;
  if (subject?.subjectName) return subject.subjectName;
  return entry.periodName || "Subject";
}

export default function ScheduleBoard({
  workingDays = ["MON", "TUE", "WED", "THU", "FRI"],
  schoolStart = "08:00",
  schoolEnd = "16:00",
  slots = [],
  entries = [],
  subjects = [],
  teachers = [],
  rooms = [],
  classes = [],
  classId,
  saving = false,
  onSave,
  onDelete,
  readOnly = false,
  showClass = false,
}) {
  const [draft, setDraft] = useState(null);
  const [ghost, setGhost] = useState(null);
  const [form, setForm] = useState(null);
  const columnsRef = useRef({});
  const gestureRef = useRef(null);

  const dayStart = toMinutes(schoolStart) ?? 8 * 60;
  const dayEnd = Math.max(toMinutes(schoolEnd) ?? 16 * 60, dayStart + 60);
  const pxPerMin = 1.15;
  const gridHeight = (dayEnd - dayStart) * pxPerMin;
  const hourMarks = useMemo(() => {
    const marks = [];
    const firstHour = Math.ceil(dayStart / 60) * 60;
    for (let minute = firstHour; minute < dayEnd; minute += 60) marks.push(minute);
    if (!marks.includes(dayStart)) marks.unshift(dayStart);
    return marks;
  }, [dayStart, dayEnd]);

  const days = DAYS.filter((day) => workingDays.includes(day.value));
  const slotsById = useMemo(
    () => new Map(slots.map((slot) => [String(slot._id), slot])),
    [slots]
  );

  const blocks = useMemo(
    () =>
      entries
        .map((entry) => {
          const window = blockWindow(entry, slotsById);
          if (!window) return null;
          return { entry, ...window };
        })
        .filter(Boolean),
    [entries, slotsById]
  );

  const minuteFromPointer = (day, clientY) => {
    const column = columnsRef.current[day];
    if (!column) return dayStart;
    const rect = column.getBoundingClientRect();
    const raw = dayStart + (clientY - rect.top) / pxPerMin;
    const snapped = Math.round(raw / 5) * 5;
    return Math.min(Math.max(dayStart, snapped), dayEnd);
  };

  const dayFromPointer = (clientX) => {
    for (const day of days) {
      const column = columnsRef.current[day.value];
      if (!column) continue;
      const rect = column.getBoundingClientRect();
      if (clientX >= rect.left && clientX <= rect.right) return day.value;
    }
    return null;
  };

  const overlapsExisting = (day, start, end, ignoreId) =>
    blocks.some(
      (block) =>
        block.entry.day === day &&
        String(block.entry._id) !== String(ignoreId || "") &&
        rangesOverlap(start, end, block.start, block.end)
    );

  const finishGesture = (event) => {
    const gesture = gestureRef.current;
    gestureRef.current = null;
    setDraft(null);
    setGhost(null);
    if (!gesture) return;

    if (gesture.kind === "create") {
      const pointerEnd = minuteFromPointer(gesture.day, event.clientY);
      const start = Math.min(gesture.anchor, pointerEnd);
      const end = Math.max(gesture.anchor, pointerEnd);
      if (end - start < 5) return;
      setForm({
        mode: "create",
        day: gesture.day,
        start,
        end,
        classId,
        subjectId: "",
        teacherId: "",
        roomId: "",
      });
      return;
    }

    const moved =
      Math.abs(event.clientX - gesture.x) > 4 ||
      Math.abs(event.clientY - gesture.y) > 4;
    if (!moved) {
      const block = blocks.find((item) => String(item.entry._id) === String(gesture.entryId));
      if (!block) return;
      setForm({
        mode: "edit",
        entryId: block.entry._id,
        day: block.entry.day,
        start: block.start,
        end: block.end,
        classId,
        subjectId: block.entry.subjectId?._id || block.entry.subjectId || "",
        teacherId: block.entry.teacherId?._id || block.entry.teacherId || "",
        roomId: block.entry.roomId?._id || block.entry.roomId || "",
      });
      return;
    }

    const next = resolveGesture(gesture, event.clientX, event.clientY);
    if (!next) return;
    if (overlapsExisting(next.day, next.start, next.end, gesture.entryId)) return;
    const block = blocks.find((item) => String(item.entry._id) === String(gesture.entryId));
    if (!block) return;
    onSave?.({
      entryId: block.entry._id,
      day: next.day,
      startTime: toHHMM(next.start),
      endTime: toHHMM(next.end),
      periodName: subjectLabel(block.entry),
      classId,
      subjectId: block.entry.subjectId?._id || block.entry.subjectId || "",
      teacherId: block.entry.teacherId?._id || block.entry.teacherId || "",
      roomId: block.entry.roomId?._id || block.entry.roomId || "",
    });
  };

  const resolveGesture = (gesture, clientX, clientY) => {
    const day = dayFromPointer(clientX) || gesture.day;
    const delta = minuteFromPointer(day, clientY) - gesture.pointerMinute;
    const duration = gesture.end - gesture.start;

    if (gesture.kind === "resize-start") {
      const start = Math.min(
        Math.max(dayStart, gesture.start + delta),
        gesture.end - 5
      );
      return { day: gesture.day, start, end: gesture.end };
    }
    if (gesture.kind === "resize-end") {
      const end = Math.max(
        Math.min(dayEnd, gesture.end + delta),
        gesture.start + 5
      );
      return { day: gesture.day, start: gesture.start, end };
    }

    let start = gesture.start + delta;
    start = Math.round(start / 5) * 5;
    start = Math.min(Math.max(dayStart, start), dayEnd - duration);
    return { day, start, end: start + duration };
  };

  const onPointerMove = (event) => {
    const gesture = gestureRef.current;
    if (!gesture) return;

    if (gesture.kind === "create") {
      const pointerEnd = minuteFromPointer(gesture.day, event.clientY);
      const start = Math.min(gesture.anchor, pointerEnd);
      const end = Math.max(gesture.anchor, pointerEnd);
      setDraft({ day: gesture.day, start, end });
      return;
    }

    const next = resolveGesture(gesture, event.clientX, event.clientY);
    if (!next) return;
    setGhost({
      ...next,
      invalid: overlapsExisting(next.day, next.start, next.end, gesture.entryId),
      entryId: gesture.entryId,
    });
  };

  const beginCreate = (day, event) => {
    if (readOnly) return;
    if (event.button != null && event.button !== 0) return;
    if (event.target.closest("[data-period]")) return;
    const anchor = minuteFromPointer(day, event.clientY);
    gestureRef.current = { kind: "create", day, anchor, x: event.clientX, y: event.clientY };
    setDraft({ day, start: anchor, end: anchor });
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const beginPeriod = (kind, block, event) => {
    event.stopPropagation();
    event.preventDefault();
    gestureRef.current = {
      kind,
      day: block.entry.day,
      entryId: block.entry._id,
      start: block.start,
      end: block.end,
      pointerMinute: minuteFromPointer(block.entry.day, event.clientY),
      x: event.clientX,
      y: event.clientY,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const topFor = (minute) => (minute - dayStart) * pxPerMin;
  const heightFor = (start, end) => Math.max((end - start) * pxPerMin, 22);

  const subjectOptions = subjects.map((subject) => ({
    value: subject._id,
    label: subject.subjectCode
      ? `${subject.subjectName} (${subject.subjectCode})`
      : subject.subjectName,
  }));
  const teacherOptions = teachers.map((teacher) => ({
    value: teacher._id,
    label: teacherName(teacher),
  }));
  const roomOptions = [
    { value: "", label: "No room" },
    ...rooms.map((room) => ({
      value: room._id,
      label: room.code ? `${room.name} (${room.code})` : room.name,
    })),
  ];
  const classOptions = classes.map((item) => ({
    value: item._id,
    label: classLabel(item),
  }));

  const renderSpan = (day, start, end, className, label) => {
    if (start >= dayEnd || end <= dayStart) return null;
    return (
      <div
        className={`pointer-events-none absolute inset-x-1 z-[2] rounded-xl border px-2 py-1 text-xs font-semibold ${className}`}
        style={{ top: topFor(start), height: heightFor(start, end) }}
      >
        {label || `${formatClock(start)} – ${formatClock(end)}`}
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[color:var(--edvora-muted)]">
          {readOnly
            ? "Each block shows the subject and the class this teacher is teaching."
            : "Drag any length inside the school day. Move a block or pull its edges to change the time."}
        </p>
        <p className="text-xs font-semibold text-[color:var(--edvora-ink)]">
          {formatClock(dayStart)} – {formatClock(dayEnd)}
        </p>
      </div>

      <div className="overflow-auto rounded-2xl border border-[color:var(--edvora-glass-border-soft)] bg-[color:var(--edvora-glass)] shadow-[var(--edvora-glass-shadow)]">
        <div
          className="grid min-w-[760px]"
          style={{ gridTemplateColumns: `76px repeat(${days.length}, minmax(140px, 1fr))` }}
        >
          <div className="sticky left-0 z-20 border-r border-[color:var(--edvora-glass-border-soft)] bg-[color:var(--edvora-card)]">
            <div className="h-10 border-b border-[color:var(--edvora-glass-border-soft)]" />
            <div className="relative" style={{ height: gridHeight }}>
              {hourMarks.map((minute) => (
                <div
                  key={minute}
                  className="absolute inset-x-0 -translate-y-2 px-2 text-[10px] font-medium text-[color:var(--edvora-muted)]"
                  style={{ top: topFor(minute) }}
                >
                  {formatClock(minute)}
                </div>
              ))}
            </div>
          </div>

          {days.map((day) => (
            <div key={day.value} className="min-w-0 border-r border-[color:var(--edvora-glass-border-soft)] last:border-r-0">
              <div className="sticky top-0 z-10 flex h-10 items-center justify-center border-b border-[color:var(--edvora-glass-border-soft)] bg-[color:var(--edvora-glass-strong)] text-xs font-bold uppercase tracking-wide text-[color:var(--edvora-ink)]">
                {day.label.slice(0, 3)}
              </div>
              <div
                ref={(node) => {
                  columnsRef.current[day.value] = node;
                }}
                className="relative touch-none select-none bg-[color:var(--edvora-glass-soft)]/30"
                style={{ height: gridHeight }}
                onPointerDown={(event) => beginCreate(day.value, event)}
                onPointerMove={onPointerMove}
                onPointerUp={finishGesture}
                onPointerCancel={() => {
                  gestureRef.current = null;
                  setDraft(null);
                  setGhost(null);
                }}
              >
                {hourMarks.map((minute) => (
                  <div
                    key={minute}
                    className="absolute inset-x-0 border-t border-[color:var(--edvora-glass-border-soft)]/80"
                    style={{ top: topFor(minute) }}
                  />
                ))}

                {blocks
                  .filter((block) => block.entry.day === day.value)
                  .map((block) => {
                    const hidden =
                      ghost && String(ghost.entryId) === String(block.entry._id);
                    if (hidden) return null;
                    const teacher = teacherName(block.entry.teacherId);
                    const room = block.entry.roomId?.name || block.entry.roomId?.code || "";
                    const classText = classLabel(block.entry.classId);
                    return (
                      <div
                        key={block.entry._id}
                        data-period="true"
                        className="absolute inset-x-1 z-[3] overflow-hidden rounded-xl border border-[color:var(--edvora-primary)]/30 bg-[color:var(--edvora-primary)]/15 px-2 py-1 shadow-sm"
                        style={{
                          top: topFor(block.start),
                          height: Math.max(heightFor(block.start, block.end) - 2, 28),
                        }}
                        onPointerDown={(event) => {
                          if (!readOnly) beginPeriod("move", block, event);
                        }}
                        onPointerMove={readOnly ? undefined : onPointerMove}
                        onPointerUp={readOnly ? undefined : finishGesture}
                      >
                        {readOnly ? null : (
                          <button
                            type="button"
                            aria-label="Change start"
                            className="absolute inset-x-0 top-0 h-2 cursor-ns-resize"
                            onPointerDown={(event) => beginPeriod("resize-start", block, event)}
                          />
                        )}
                        <p className="truncate text-[11px] font-bold text-[color:var(--edvora-ink-strong)]">
                          {formatClock(block.start)} – {formatClock(block.end)}
                        </p>
                        <p className="truncate text-xs font-semibold text-[color:var(--edvora-primary)]">
                          {subjectLabel(block.entry)}
                        </p>
                        {heightFor(block.start, block.end) > 40 ? (
                          <p className="truncate text-[10px] text-[color:var(--edvora-muted)]">
                            {showClass
                              ? classText
                              : [teacher !== "—" ? teacher : "", room].filter(Boolean).join(" · ")}
                          </p>
                        ) : null}
                        {readOnly ? null : (
                          <button
                            type="button"
                            aria-label="Change end"
                            className="absolute inset-x-0 bottom-0 h-2 cursor-ns-resize"
                            onPointerDown={(event) => beginPeriod("resize-end", block, event)}
                          />
                        )}
                      </div>
                    );
                  })}

                {draft?.day === day.value
                  ? renderSpan(
                      day.value,
                      draft.start,
                      draft.end,
                      overlapsExisting(day.value, draft.start, draft.end)
                        ? "border-red-400 bg-red-500/15 text-red-700"
                        : "border-[color:var(--edvora-primary)] bg-[color:var(--edvora-primary)]/20 text-[color:var(--edvora-ink-strong)]"
                    )
                  : null}
                {ghost?.day === day.value
                  ? renderSpan(
                      day.value,
                      ghost.start,
                      ghost.end,
                      ghost.invalid
                        ? "border-red-400 bg-red-500/20 text-red-700"
                        : "border-dashed border-[color:var(--edvora-primary)] bg-[color:var(--edvora-primary)]/25 text-[color:var(--edvora-ink-strong)]"
                    )
                  : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      {form ? (
        <PeriodForm
          form={form}
          saving={saving}
          subjectOptions={subjectOptions}
          teacherOptions={teacherOptions}
          roomOptions={roomOptions}
          classOptions={classOptions}
          onClose={() => setForm(null)}
          onChange={setForm}
          onDelete={
            form.entryId
              ? () => {
                  onDelete?.(form.entryId);
                  setForm(null);
                }
              : null
          }
          onSubmit={async () => {
            if (!form.subjectId || !form.teacherId) return;
            const subject = subjectOptions.find(
              (option) => String(option.value) === String(form.subjectId)
            );
            const ok = await onSave?.({
              entryId: form.entryId,
              day: form.day,
              startTime: toHHMM(form.start),
              endTime: toHHMM(form.end),
              periodName: String(subject?.label || "").split(" (")[0],
              classId: form.classId || classId,
              subjectId: form.subjectId,
              teacherId: form.teacherId,
              roomId: form.roomId,
            });
            if (ok !== false) setForm(null);
          }}
        />
      ) : null}
    </div>
  );
}

function PeriodForm({
  form,
  saving,
  subjectOptions,
  teacherOptions,
  roomOptions,
  classOptions,
  onClose,
  onChange,
  onSubmit,
  onDelete,
}) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[color:var(--edvora-overlay)] p-3 backdrop-blur-md">
      <div className="flex max-h-[90dvh] w-full max-w-[520px] flex-col overflow-hidden rounded-2xl glass-strong shadow-[var(--edvora-glass-shadow-lg)]">
        <div className="flex items-start justify-between gap-3 border-b border-[color:var(--edvora-glass-border-soft)] px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-[color:var(--edvora-ink-strong)]">
              {form.mode === "edit" ? "Edit period" : "New period"}
            </h2>
            <p className="mt-1 text-sm text-[color:var(--edvora-muted)]">
              {form.day} · {formatClock(form.start)} – {formatClock(form.end)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--edvora-primary)] text-white"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto px-5 py-4">
          <div>
            <label className={labelClass}>
              <span className="inline-flex items-center gap-1.5">
                <BookOpen size={12} /> Subject
              </span>
            </label>
            <CustomSelect
              options={subjectOptions}
              value={form.subjectId}
              onChange={(option) =>
                onChange((prev) => ({ ...prev, subjectId: option?.value || "" }))
              }
              placeholder="Select subject"
              isSearchable
            />
          </div>
          <div>
            <label className={labelClass}>
              <span className="inline-flex items-center gap-1.5">
                <UserRound size={12} /> Teacher
              </span>
            </label>
            <CustomSelect
              options={teacherOptions}
              value={form.teacherId}
              onChange={(option) =>
                onChange((prev) => ({ ...prev, teacherId: option?.value || "" }))
              }
              placeholder="Select teacher"
              isSearchable
            />
          </div>
          <div>
            <label className={labelClass}>Class / Section</label>
            <CustomSelect
              options={classOptions}
              value={form.classId}
              onChange={(option) =>
                onChange((prev) => ({ ...prev, classId: option?.value || prev.classId }))
              }
              placeholder="Select class"
              isSearchable
            />
          </div>
          <div>
            <label className={labelClass}>
              <span className="inline-flex items-center gap-1.5">
                <DoorOpen size={12} /> Room
              </span>
            </label>
            <CustomSelect
              options={roomOptions}
              value={form.roomId}
              onChange={(option) =>
                onChange((prev) => ({ ...prev, roomId: option?.value || "" }))
              }
              placeholder="Select room"
              isSearchable
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-[color:var(--edvora-glass-border-soft)] px-5 py-4">
          {onDelete ? (
            <button
              type="button"
              onClick={onDelete}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-[color:var(--edvora-danger)] hover:bg-[color:var(--edvora-danger-soft)]"
            >
              <Trash2 size={14} />
              Delete
            </button>
          ) : (
            <span />
          )}
          <button
            type="button"
            disabled={saving || !form.subjectId || !form.teacherId}
            onClick={onSubmit}
            className="h-10 rounded-xl theme-btn-primary px-5 text-sm font-semibold disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save period"}
          </button>
        </div>
      </div>
    </div>
  );
}
