export const ATTENDANCE_DROPDOWN = ["P", "A", "L", "HD", "LV"];

function fallbackTodayISO() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function currentMonthKey(fromDate = fallbackTodayISO()) {
  return String(fromDate || fallbackTodayISO()).slice(0, 7);
}

export function monthLabel(monthKey) {
  const [year, month] = String(monthKey || "").split("-").map(Number);
  if (!year || !month) return String(monthKey || "");
  return new Date(year, month - 1, 1).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
}

export function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

export function pad2(value) {
  return String(value).padStart(2, "0");
}

export function isoDate(year, month, day) {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

export function getMonthDays(monthKey, today = fallbackTodayISO()) {
  const [year, month] = String(monthKey || currentMonthKey(today))
    .split("-")
    .map(Number);
  if (!year || !month) return [];

  const count = daysInMonth(year, month);
  const days = [];

  for (let day = 1; day <= count; day += 1) {
    const iso = isoDate(year, month, day);
    const weekday = new Date(year, month - 1, day).toLocaleDateString("en-US", {
      weekday: "short",
    });
    days.push({
      day,
      iso,
      weekday,
      isFuture: iso > today,
      isToday: iso === today,
      header: `${pad2(day)} ${weekday}`,
    });
  }

  return days;
}

export function clampMonthKey(monthKey, today = fallbackTodayISO()) {
  const current = currentMonthKey(today);
  const next = String(monthKey || current).slice(0, 7);
  if (!/^\d{4}-\d{2}$/.test(next)) return current;
  return next > current ? current : next;
}

export function monthKeyFromDate(date = fallbackTodayISO()) {
  return clampMonthKey(currentMonthKey(date), date);
}

export function isDayHeader(value) {
  const text = String(value || "").trim();
  if (!text) return false;
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return true;
  if (/^\d{1,2}$/.test(text)) {
    const day = Number(text);
    return day >= 1 && day <= 31;
  }
  if (/^\d{1,2}\s+[A-Za-z]{2,}$/.test(text)) return true;
  if (/^\d{1,2}[-/][A-Za-z]{3}$/.test(text)) return true;
  return false;
}

export function dayHeaderToIso(value, monthKey) {
  const text = String(value || "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;

  const [year, month] = String(monthKey || "").split("-").map(Number);
  if (!year || !month) return "";

  const dayMatch = text.match(/^(\d{1,2})/);
  if (!dayMatch) return "";
  const day = Number(dayMatch[1]);
  const last = daysInMonth(year, month);
  if (day < 1 || day > last) return "";
  return isoDate(year, month, day);
}

export function parseMonthFromText(value) {
  const text = String(value || "");
  const tagged = text.match(/Month:\s*(\d{4}-\d{2})/i);
  if (tagged) return tagged[1];
  const plain = text.match(/\b(\d{4}-\d{2})\b/);
  return plain ? plain[1] : "";
}

export function attendanceHeaderKey(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  if (isDayHeader(raw)) return raw;
  const collapsed = raw.toLowerCase().replace(/\./g, "").replace(/\s+/g, "");
  if (isDayHeader(collapsed)) return collapsed;
  return collapsed;
}
