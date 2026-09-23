import axios from "axios";
import { getCurrentUser, getSchoolId } from "./auth";
import { dayHeaderToIso, isDayHeader, parseMonthFromText, attendanceHeaderKey } from "./attendanceMonth";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4001";
const CACHE_TTL_MS = 45_000;

let attendanceCache = new Map();
let attendanceInflight = new Map();

function todayISO() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export const ATTENDANCE_STATUSES = [
  { value: "PRESENT", label: "Present", short: "P", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { value: "ABSENT", label: "Absent", short: "A", color: "bg-rose-50 text-rose-700 border-rose-200" },
  { value: "LATE", label: "Late", short: "L", color: "bg-amber-50 text-amber-700 border-amber-200" },
  { value: "HALF_DAY", label: "Half Day", short: "HD", color: "bg-orange-50 text-orange-700 border-orange-200" },
  { value: "LEAVE", label: "Leave", short: "LV", color: "bg-sky-50 text-sky-700 border-sky-200" },
];

const STATUS_META_MAP = Object.fromEntries(
  ATTENDANCE_STATUSES.map((item) => [item.value, item])
);

export function getStatusMeta(status) {
  return (
    STATUS_META_MAP[status] || {
      value: status,
      label: status || "—",
      short: "—",
      color: "bg-slate-50 text-slate-600 border-slate-200",
    }
  );
}

export function clearAttendanceCache() {
  attendanceCache.clear();
  attendanceInflight.clear();
}

async function cachedRequest(key, runner) {
  const cached = attendanceCache.get(key);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return cached.data;
  }

  if (attendanceInflight.has(key)) {
    return attendanceInflight.get(key);
  }

  const promise = runner()
    .then((data) => {
      attendanceCache.set(key, { data, at: Date.now() });
      return data;
    })
    .catch((error) => {
      attendanceCache.delete(key);
      throw error;
    })
    .finally(() => {
      attendanceInflight.delete(key);
    });

  attendanceInflight.set(key, promise);
  return promise;
}

export async function getTeachersForAttendance(date = todayISO()) {
  const schoolId = getSchoolId();
  const key = `teachers:${schoolId}:${date}`;

  return cachedRequest(key, async () => {
    const { data } = await axios.post(
      `${API_BASE}/attendance/getTeachersForAttendance`,
      { schoolId, date }
    );

    return {
      date: data?.date,
      totalTeachers: data?.totalTeachers || 0,
      isMarked: Boolean(data?.isMarked),
      summary: data?.summary || {},
      teachers: data?.data || [],
    };
  });
}

export async function getAssignedClassesForAttendance(date = todayISO()) {
  const schoolId = getSchoolId();
  const teacherId = getCurrentUser()?._id;
  const key = `assigned-classes:${schoolId}:${teacherId}:${date}`;

  return cachedRequest(key, async () => {
    const { data } = await axios.post(
      `${API_BASE}/attendance/getAssignedClassesForAttendance`,
      { schoolId, teacherId, date }
    );

    return {
      date: data?.date,
      totalClasses: data?.totalClasses || 0,
      classes: data?.data || [],
    };
  });
}

export async function getStudentsForAttendance(classId, date = todayISO()) {
  const schoolId = getSchoolId();
  const teacherId = getCurrentUser()?._id;
  const key = `students:${schoolId}:${classId}:${date}:${teacherId}`;

  return cachedRequest(key, async () => {
    const { data } = await axios.post(
      `${API_BASE}/attendance/getStudentsForAttendance`,
      { schoolId, classId, date, teacherId }
    );

    return {
      date: data?.date,
      totalStudents: data?.totalStudents || 0,
      isMarked: Boolean(data?.isMarked),
      summary: data?.summary || {},
      classInfo: data?.data?.class || null,
      students: data?.data?.students || [],
    };
  });
}

export async function markAttendance({
  type,
  date,
  classId = null,
  records,
  notes = "",
}) {
  const schoolId = getSchoolId();
  const markedBy = getCurrentUser()?._id;

  const { data } = await axios.post(`${API_BASE}/attendance/markAttendance`, {
    schoolId,
    type,
    date,
    classId,
    records,
    markedBy,
    notes,
  });

  clearAttendanceCache();
  return data;
}

export async function bulkUploadAttendance({
  type,
  date,
  classId = null,
  rows,
  notes = "Bulk upload",
}) {
  const schoolId = getSchoolId();
  const markedBy = getCurrentUser()?._id;

  const { data } = await axios.post(
    `${API_BASE}/attendance/bulkUploadAttendance`,
    {
      schoolId,
      type,
      date,
      classId,
      rows,
      markedBy,
      notes,
    }
  );

  clearAttendanceCache();
  return data;
}

export async function getMonthAttendance({ type, month, classId = null }) {
  const schoolId = getSchoolId();
  const { data } = await axios.post(
    `${API_BASE}/attendance/getMonthAttendance`,
    {
      schoolId,
      type,
      month,
      classId,
      teacherId: getCurrentUser()?._id,
    }
  );

  return {
    month: data?.month || month,
    marks: data?.marks || {},
  };
}

export async function getAttendanceSummary({
  type,
  date = todayISO(),
  classId = null,
}) {
  const schoolId = getSchoolId();
  const key = `summary:${schoolId}:${type}:${date}:${classId || ""}`;

  return cachedRequest(key, async () => {
    const { data } = await axios.post(
      `${API_BASE}/attendance/getAttendanceSummary`,
      { schoolId, type, date, classId }
    );

    return {
      date: data?.date,
      type: data?.type,
      isMarked: Boolean(data?.isMarked),
      totalPeople: data?.totalPeople || 0,
      markedCount: data?.markedCount || 0,
      summary: data?.summary || {},
    };
  });
}

export async function getAttendanceLogs({
  type,
  classId = null,
  page = 1,
  limit = 20,
  fromDate = "",
  toDate = "",
} = {}) {
  const schoolId = getSchoolId();
  const { data } = await axios.post(`${API_BASE}/attendance/getAttendanceLogs`, {
    schoolId,
    type,
    classId,
    page,
    limit,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
  });

  return {
    totalLogs: data?.totalLogs || 0,
    page: data?.page || page,
    limit: data?.limit || limit,
    logs: data?.data || [],
  };
}

export async function getAttendanceLogDetail(logId) {
  const schoolId = getSchoolId();
  const { data } = await axios.post(
    `${API_BASE}/attendance/getAttendanceLogDetail`,
    { schoolId, logId }
  );

  return {
    log: data?.data?.log || null,
    records: data?.data?.records || [],
  };
}

export { todayISO };

function isAttendanceHeaderRow(headers) {
  const keys = new Set(headers.map((header) => attendanceHeaderKey(header)));
  const hasId =
    keys.has("employeeid") ||
    keys.has("staffid") ||
    keys.has("admissionnumber") ||
    keys.has("admissionno") ||
    keys.has("rollnumber") ||
    keys.has("rollno") ||
    keys.has("email") ||
    keys.has("identifier") ||
    keys.has("id");
  if (!hasId) return false;
  const hasStatus = keys.has("status") || keys.has("attendance");
  const hasDays = headers.some((header) => isDayHeader(header));
  return hasStatus || hasDays;
}

/** Escape a CSV cell (quotes when needed). */
export function escapeCsvCell(value) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

/**
 * Build teacher attendance CSV:
 * title row + headers + one row per active staff.
 */
export function buildTeacherAttendanceTemplateCsv(staff = [], date = todayISO()) {
  const titleDate = formatAttendanceSheetDate(date);
  const title = `Attendance sheet of ${titleDate}`;
  const header = [
    "S.No",
    "employeeId",
    "staff name",
    "department",
    "Status",
    "Remarks",
  ].join(",");

  const rows = staff.map((person, index) => {
    const name = [person.firstName, person.lastName].filter(Boolean).join(" ").trim();
    const employeeId = person.employeeId || person.staffId || "";
    return [
      index + 1,
      escapeCsvCell(employeeId),
      escapeCsvCell(name),
      escapeCsvCell(person.department || ""),
      escapeCsvCell(person.attendanceStatus || ""),
      escapeCsvCell(person.remarks || ""),
    ].join(",");
  });

  return [`${escapeCsvCell(title)}`, header, ...rows].join("\n") + "\n";
}

export function formatAttendanceSheetDate(date = todayISO()) {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return String(date);
  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Parse CSV into objects. Skips title rows and finds the header line. */
export function parseCsv(text) {
  const source = String(text || "").replace(/^\uFEFF/, "");
  const lines = source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) return { rows: [], monthKey: parseMonthFromText(source) };

  let headerIndex = -1;
  let headers = [];

  for (let i = 0; i < lines.length; i += 1) {
    const candidate = splitCsvLine(lines[i]).map(attendanceHeaderKey);
    if (isAttendanceHeaderRow(candidate)) {
      headerIndex = i;
      headers = candidate;
      break;
    }
  }

  if (headerIndex < 0 || headerIndex >= lines.length - 1) {
    return { rows: [], monthKey: parseMonthFromText(source) };
  }

  const rows = lines.slice(headerIndex + 1).map((line) => {
    const cols = splitCsvLine(line);
    const row = {};
    headers.forEach((header, idx) => {
      row[header] = (cols[idx] || "").trim();
    });
    return row;
  });

  return { rows, monthKey: parseMonthFromText(source) };
}

function splitCsvLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

export function normalizeBulkRows(rawRows, type, monthKey = "") {
  return rawRows.flatMap((row) => {
    const identifier =
      row.identifier ||
      row.employeeid ||
      row.staffid ||
      row.admissionnumber ||
      row.admissionno ||
      row.rollnumber ||
      row.rollno ||
      row.email ||
      row.id ||
      "";

    const name = String(
      row.staffname || row.studentname || row.name || ""
    ).trim();
    const extra = String(row.department || row.rollnumber || row.class || "").trim();
    const remarks = String(row.remarks || row.note || row.notes || "").trim();
    const id = String(identifier).trim();

    const dayEntries = Object.entries(row).filter(([key]) => isDayHeader(key));
    if (dayEntries.length) {
      return dayEntries
        .map(([key, value]) => {
          const date = dayHeaderToIso(key, monthKey) || String(row.date || "").trim();
          const status = String(value || "").trim();
          if (!id && !status) return null;
          if (!status) return null;
          return {
            identifier: id,
            date,
            status,
            remarks,
            staffName: name,
            department: extra,
            type,
          };
        })
        .filter(Boolean);
    }

    const status = String(row.status || row.attendance || "").trim();
    const date =
      String(row.date || "").trim() ||
      (monthKey && todayISO().startsWith(monthKey) ? todayISO() : "");
    if (!id && !status && !remarks) return [];
    return [
      {
        identifier: id,
        date,
        status,
        remarks,
        staffName: name,
        department: extra,
        type,
      },
    ];
  });
}
