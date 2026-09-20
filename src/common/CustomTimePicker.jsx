import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Clock } from "lucide-react";

const PRIMARY = "#A77A95";
const PRIMARY_HOVER = "#8F6580";
const BORDER = "#D0D5DD";
const TEXT = "#344054";

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTE_STEPS = Array.from({ length: 12 }, (_, i) => i * 5);

function pad(n) {
  return String(n).padStart(2, "0");
}

function parseTimeValue(value) {
  if (!value || typeof value !== "string") {
    return { hour12: 9, minute: 0, period: "AM" };
  }

  const [hRaw, mRaw] = value.split(":");
  let hour24 = Number(hRaw);
  let minute = Number(mRaw);

  if (Number.isNaN(hour24) || Number.isNaN(minute)) {
    return { hour12: 9, minute: 0, period: "AM" };
  }

  hour24 = Math.min(23, Math.max(0, hour24));
  minute = Math.min(59, Math.max(0, minute));

  const period = hour24 >= 12 ? "PM" : "AM";
  let hour12 = hour24 % 12;
  if (hour12 === 0) hour12 = 12;

  return { hour12, minute, period };
}

function toValue24({ hour12, minute, period }) {
  let hour24 = hour12 % 12;
  if (period === "PM") hour24 += 12;
  return `${pad(hour24)}:${pad(minute)}`;
}

function formatDisplay({ hour12, minute, period }) {
  return `${pad(hour12)}:${pad(minute)} ${period}`;
}

function ClockFace({ mode, selectedHour, selectedMinute, onSelectHour, onSelectMinute }) {
  const items = mode === "hour" ? HOURS : MINUTE_STEPS;
  const selected =
    mode === "hour" ? selectedHour : selectedMinute - (selectedMinute % 5);
  const size = 148;
  const center = size / 2;
  const radius = 54;

  const angleFor = (item) => {
    if (mode === "hour") return ((item % 12) / 12) * 360 - 90;
    return (item / 60) * 360 - 90;
  };

  const handAngle = angleFor(mode === "hour" ? selectedHour : selectedMinute);

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 35% 30%, #FFF9F6 0%, #FAEEE9 55%, #F3E4DD 100%)",
        }}
      />
      <div
        className="absolute left-1/2 top-1/2 origin-left transition-transform duration-200"
        style={{
          width: radius - 6,
          height: 2,
          background: PRIMARY,
          transform: `rotate(${handAngle}deg)`,
          borderRadius: 2,
        }}
      />
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-2 w-2 rounded-full"
        style={{ background: PRIMARY }}
      />

      {items.map((item) => {
        const angle = (angleFor(item) * Math.PI) / 180;
        const x = center + radius * Math.cos(angle);
        const y = center + radius * Math.sin(angle);
        const isActive =
          mode === "hour" ? item === selectedHour : item === selected;

        return (
          <button
            key={`${mode}-${item}`}
            type="button"
            onClick={() =>
              mode === "hour" ? onSelectHour(item) : onSelectMinute(item)
            }
            className="absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[10px] font-bold transition"
            style={{
              left: x,
              top: y,
              background: isActive ? PRIMARY : "transparent",
              color: isActive ? "#fff" : "#735366",
            }}
          >
            {pad(item)}
          </button>
        );
      })}
    </div>
  );
}

function CustomTimePicker({
  value = "",
  onChange,
  placeholder = "Select time",
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("hour");
  const rootRef = useRef(null);
  const parsed = useMemo(() => parseTimeValue(value), [value]);
  const [draft, setDraft] = useState(parsed);

  useEffect(() => {
    if (open) {
      setDraft(parsed);
      setMode("hour");
    }
  }, [open, parsed]);

  useEffect(() => {
    if (!open) return undefined;

    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const display = value ? formatDisplay(parsed) : "";

  return (
    <div ref={rootRef} className="relative w-full">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        className="w-full h-[42px] rounded-lg border bg-white px-3 text-left text-[14px] outline-none flex items-center justify-between transition disabled:bg-[#F2F4F7] disabled:cursor-not-allowed"
        style={{
          borderColor: open ? PRIMARY : BORDER,
          boxShadow: open ? `0 0 0 1px ${PRIMARY}` : "none",
          color: display ? TEXT : "#98A2B3",
        }}
      >
        <span className="truncate">{display || placeholder}</span>
        <Clock size={16} style={{ color: disabled ? "#ccc" : PRIMARY }} />
      </button>

      {open ? (
        <div
          className="absolute z-[100050] mt-1.5 left-0 w-[220px] rounded-xl border border-[color:var(--edvora-border)] bg-white overflow-hidden"
          style={{ boxShadow: "0 10px 28px rgba(115, 83, 102, 0.18)" }}
        >
          <div
            className="px-3 pt-2.5 pb-2"
            style={{
              background: "linear-gradient(145deg, #A77A95 0%, #8F6580 100%)",
            }}
          >
            <div className="flex items-end justify-between gap-2">
              <div className="flex items-baseline gap-0.5 text-white">
                <button
                  type="button"
                  onClick={() => setMode("hour")}
                  className={`text-[22px] leading-none font-bold tabular-nums ${
                    mode === "hour" ? "opacity-100" : "opacity-45"
                  }`}
                >
                  {pad(draft.hour12)}
                </button>
                <span className="text-[22px] leading-none font-bold opacity-70">
                  :
                </span>
                <button
                  type="button"
                  onClick={() => setMode("minute")}
                  className={`text-[22px] leading-none font-bold tabular-nums ${
                    mode === "minute" ? "opacity-100" : "opacity-45"
                  }`}
                >
                  {pad(draft.minute)}
                </button>
              </div>

              <div className="flex gap-1 mb-0.5">
                {["AM", "PM"].map((period) => {
                  const active = draft.period === period;
                  return (
                    <button
                      key={period}
                      type="button"
                      onClick={() => setDraft((prev) => ({ ...prev, period }))}
                      className={`h-6 px-2 rounded text-[10px] font-bold ${
                        active
                          ? "bg-white text-[color:var(--edvora-ink-strong)]"
                          : "bg-white/15 text-white/80"
                      }`}
                    >
                      {period}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="px-2.5 py-2.5">
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <button
                type="button"
                onClick={() => setMode("hour")}
                className={`h-6 px-2.5 rounded-full text-[10px] font-semibold ${
                  mode === "hour"
                    ? "bg-[color:var(--edvora-primary)] text-white"
                    : "bg-[color:var(--edvora-primary-soft)] text-[color:var(--edvora-ink-strong)]"
                }`}
              >
                Hour
              </button>
              <button
                type="button"
                onClick={() => setMode("minute")}
                className={`h-6 px-2.5 rounded-full text-[10px] font-semibold ${
                  mode === "minute"
                    ? "bg-[color:var(--edvora-primary)] text-white"
                    : "bg-[color:var(--edvora-primary-soft)] text-[color:var(--edvora-ink-strong)]"
                }`}
              >
                Minute
              </button>
            </div>

            <ClockFace
              mode={mode}
              selectedHour={draft.hour12}
              selectedMinute={draft.minute}
              onSelectHour={(hour12) => {
                setDraft((prev) => ({ ...prev, hour12 }));
                setMode("minute");
              }}
              onSelectMinute={(minute) =>
                setDraft((prev) => ({ ...prev, minute }))
              }
            />
          </div>

          <div className="px-2.5 py-2 border-t border-[#F0E6E1] flex justify-end bg-[#FCFAF9]">
            <button
              type="button"
              onClick={() => {
                onChange?.(toValue24(draft));
                setOpen(false);
              }}
              className="inline-flex items-center gap-1 h-7 px-3 rounded-md text-[11px] font-semibold text-white"
              style={{ backgroundColor: PRIMARY }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = PRIMARY_HOVER;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = PRIMARY;
              }}
            >
              <Check size={12} />
              Done
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default CustomTimePicker;
