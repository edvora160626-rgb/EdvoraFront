import * as XLSX from "xlsx-js-style";
import {
  ATTENDANCE_DROPDOWN,
  attendanceHeaderKey,
  currentMonthKey,
  getMonthDays,
  isDayHeader,
  monthLabel,
  parseMonthFromText,
} from "./attendanceMonth";

const COLORS = {
  titleBg: "FF735366",
  titleText: "FFFFFFFF",
  accentBg: "FFF5D69B",
  accentText: "FF735366",
  headerBg: "FFA77A95",
  headerText: "FFFFFFFF",
  zebraBg: "FFFAEEE9",
  white: "FFFFFFFF",
  ink: "FF735366",
  muted: "FF8F6580",
  border: "FFC3C3D5",
  statusBg: "FFFFF8EE",
  futureBg: "FFE5E7EB",
  todayBg: "FFE8F5E9",
  identityBg: "FFF8F4F7",
};

function thinBorder() {
  return {
    top: { style: "thin", color: { argb: COLORS.border } },
    bottom: { style: "thin", color: { argb: COLORS.border } },
    left: { style: "thin", color: { argb: COLORS.border } },
    right: { style: "thin", color: { argb: COLORS.border } },
  };
}

function fill(argb) {
  return { type: "pattern", pattern: "solid", fgColor: { argb } };
}

function font({ bold = false, size = 11, color = COLORS.ink, italic = false } = {}) {
  return {
    name: "Calibri",
    bold,
    italic,
    size,
    color: { argb: color },
  };
}

function personName(person) {
  return [person.firstName, person.lastName].filter(Boolean).join(" ").trim();
}

function identityColumns(kind) {
  if (kind === "STUDENT") {
    return [
      { key: "sno", header: "S.No", width: 8 },
      { key: "admissionNumber", header: "admissionNumber", width: 16 },
      { key: "name", header: "student name", width: 24 },
      { key: "rollNumber", header: "rollNumber", width: 12 },
    ];
  }
  return [
    { key: "sno", header: "S.No", width: 8 },
    { key: "employeeId", header: "employeeId", width: 16 },
    { key: "name", header: "staff name", width: 24 },
    { key: "department", header: "department", width: 16 },
  ];
}

function mapIdentityValues(kind, person, index) {
  const name = personName(person);
  if (kind === "STUDENT") {
    return [
      index + 1,
      person.admissionNumber || "",
      name,
      person.rollNumber || "",
    ];
  }
  return [
    index + 1,
    person.employeeId || person.staffId || "",
    name,
    person.department || "",
  ];
}

async function buildMonthlyAttendanceWorkbook({
  kind,
  people = [],
  monthKey = currentMonthKey(),
  subtitle,
}) {
  const mod = await import("exceljs");
  const ExcelJS = mod.default || mod;
  const days = getMonthDays(monthKey);
  const identity = identityColumns(kind);
  const label = monthLabel(monthKey);
  const dropdownList = `"${ATTENDANCE_DROPDOWN.join(",")}"`;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Edvora";
  const sheet = workbook.addWorksheet("Attendance", {
    views: [{ state: "frozen", xSplit: identity.length, ySplit: 3 }],
  });
  const help = workbook.addWorksheet("Instructions");

  const lastCol = identity.length + days.length;

  sheet.mergeCells(1, 1, 1, lastCol);
  const titleCell = sheet.getCell(1, 1);
  titleCell.value = `Attendance sheet · ${label}`;
  titleCell.fill = fill(COLORS.titleBg);
  titleCell.font = font({ bold: true, size: 16, color: COLORS.titleText });
  titleCell.alignment = { vertical: "middle", horizontal: "center" };

  sheet.mergeCells(2, 1, 2, lastCol);
  const infoCell = sheet.getCell(2, 1);
  infoCell.value = `Month: ${monthKey}  ·  ${subtitle}  ·  Dropdown or type: ${ATTENDANCE_DROPDOWN.join(" | ")}  ·  Grey columns are future dates and must stay empty`;
  infoCell.fill = fill(COLORS.accentBg);
  infoCell.font = font({
    bold: true,
    size: 10,
    italic: true,
    color: COLORS.accentText,
  });
  infoCell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };

  const headerRow = sheet.getRow(3);
  identity.forEach((col, index) => {
    const cell = headerRow.getCell(index + 1);
    cell.value = col.header;
    cell.fill = fill(COLORS.headerBg);
    cell.font = font({ bold: true, color: COLORS.headerText });
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = thinBorder();
    sheet.getColumn(index + 1).width = col.width;
  });

  days.forEach((day, index) => {
    const colNumber = identity.length + index + 1;
    const cell = headerRow.getCell(colNumber);
    cell.value = day.header;
    cell.fill = fill(day.isFuture ? COLORS.futureBg : COLORS.headerBg);
    cell.font = font({
      bold: true,
      color: day.isFuture ? COLORS.muted : COLORS.headerText,
      size: 9,
    });
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    cell.border = thinBorder();
    sheet.getColumn(colNumber).width = 7;
  });
  headerRow.height = 28;

  people.forEach((person, index) => {
    const rowNumber = 4 + index;
    const row = sheet.getRow(rowNumber);
    const zebra = index % 2 === 1;
    const values = mapIdentityValues(kind, person, index);

    values.forEach((value, colIndex) => {
      const cell = row.getCell(colIndex + 1);
      cell.value = value;
      cell.fill = fill(zebra ? COLORS.zebraBg : COLORS.white);
      cell.font = font({ bold: colIndex === 1, color: colIndex === 0 ? COLORS.muted : COLORS.ink });
      cell.alignment = {
        vertical: "middle",
        horizontal: colIndex === 0 ? "center" : "left",
      };
      cell.border = thinBorder();
      cell.protection = { locked: true };
    });

    days.forEach((day, dayIndex) => {
      const cell = row.getCell(identity.length + dayIndex + 1);
      cell.border = thinBorder();
      cell.alignment = { vertical: "middle", horizontal: "center" };
      if (day.isFuture) {
        cell.value = "";
        cell.fill = fill(COLORS.futureBg);
        cell.protection = { locked: true };
        return;
      }
      cell.value = "";
      cell.fill = fill(day.isToday ? COLORS.todayBg : COLORS.statusBg);
      cell.protection = { locked: false };
      cell.dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: [dropdownList],
        showDropDown: true,
        showInputMessage: true,
        promptTitle: "Attendance",
        prompt: "Pick P, A, L, HD or LV — or type the same code / full word.",
        showErrorMessage: true,
        errorStyle: "warning",
        errorTitle: "Attendance code",
        error: "Use P, A, L, HD, LV or PRESENT, ABSENT, LATE, HALF_DAY, LEAVE.",
      };
    });
    row.height = 20;
  });

  sheet.getRow(1).height = 32;
  sheet.getRow(2).height = 36;

  help.columns = [{ width: 92 }];
  const helpLines = [
    ["How to fill this attendance sheet"],
    [`Month covered: ${label} (${monthKey})`],
    [""],
    ["1. Keep identity columns as they are (do not rename headers)."],
    ["2. Each numbered column is one calendar day of this month."],
    ["3. Click a day cell and use the dropdown: P Present, A Absent, L Late, HD Half Day, LV Leave."],
    ["4. You may also type those short codes or the full words PRESENT / ABSENT / LATE / HALF_DAY / LEAVE."],
    ["5. Leave a cell empty if you are not marking that day."],
    ["6. Grey columns are future dates — do not enter attendance there."],
    ["7. Save as .xlsx and upload it on the Bulk Attendance screen. You can still edit marks on screen after upload."],
    [""],
    [
      kind === "STUDENT"
        ? "Students are matched by admissionNumber (roll number or email also works)."
        : "Staff are matched by employeeId (staffId or email also works).",
    ],
  ];
  helpLines.forEach((line, index) => {
    const cell = help.getRow(index + 1).getCell(1);
    cell.value = line[0];
    cell.font = font({
      bold: index === 0,
      size: index === 0 ? 14 : 11,
      color: index === 0 ? COLORS.titleBg : COLORS.ink,
    });
    help.getRow(index + 1).height = index === 0 ? 24 : 18;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}

function downloadWorkbookBuffer(buffer, filename) {
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export async function downloadTeacherAttendanceTemplate(staff, monthKey) {
  const buffer = await buildMonthlyAttendanceWorkbook({
    kind: "TEACHER",
    people: staff,
    monthKey,
    subtitle: "Edvora · Active staff roster",
  });
  downloadWorkbookBuffer(
    buffer,
    `staff-attendance-${monthKey || currentMonthKey()}.xlsx`
  );
}

export async function downloadStudentAttendanceTemplate(
  students,
  monthKey,
  classInfo
) {
  const classLabel = classInfo
    ? `${classInfo.className || "Class"} · Sec ${classInfo.section || "-"}`
    : "Class roster";
  const buffer = await buildMonthlyAttendanceWorkbook({
    kind: "STUDENT",
    people: students,
    monthKey,
    subtitle: `Edvora · ${classLabel}`,
  });
  const classSlug = classInfo
    ? `${classInfo.className || "class"}-${classInfo.section || ""}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
    : "class";
  downloadWorkbookBuffer(
    buffer,
    `student-attendance-${classSlug}-${monthKey || currentMonthKey()}.xlsx`
  );
}

function headerKey(cell) {
  return attendanceHeaderKey(cell);
}

function isIdentityHeaderRow(headers) {
  const keys = new Set(headers.filter(Boolean).map((header) => attendanceHeaderKey(header)));
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

export function parseExcelAttendanceFile(arrayBuffer) {
  const workbook = XLSX.read(arrayBuffer, { type: "array", cellStyles: false });
  const sheetName =
    workbook.SheetNames.find((name) => name.toLowerCase() !== "instructions") ||
    workbook.SheetNames[0];
  if (!sheetName) return { rows: [], monthKey: "" };

  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: "",
    raw: false,
  });

  if (!rows.length) return { rows: [], monthKey: "" };

  const monthFromSheet = parseMonthFromText(
    rows
      .slice(0, 4)
      .map((line) => (line || []).join(" "))
      .join(" ")
  );

  let headerIndex = -1;
  let headers = [];
  for (let i = 0; i < rows.length; i += 1) {
    const candidate = (rows[i] || []).map((cell) => headerKey(cell));
    if (isIdentityHeaderRow(candidate)) {
      headerIndex = i;
      headers = candidate;
      break;
    }
  }

  if (headerIndex < 0) return { rows: [], monthKey: monthFromSheet };

  const parsed = rows.slice(headerIndex + 1).map((line) => {
    const row = {};
    headers.forEach((header, idx) => {
      if (!header) return;
      row[header] = String(line?.[idx] ?? "").trim();
    });
    return row;
  });

  return { rows: parsed, monthKey: monthFromSheet };
}
