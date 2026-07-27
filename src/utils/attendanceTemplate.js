import * as XLSX from "xlsx-js-style";
import { formatAttendanceSheetDate, todayISO } from "./attendanceApi";

const COL_COUNT = 6;
const HEADERS = [
  "S.No",
  "employeeId",
  "staff name",
  "department",
  "Status",
  "Remarks",
];

const COLORS = {
  titleBg: "735366",
  titleText: "FFFFFF",
  accentBg: "F5D69B",
  accentText: "735366",
  headerBg: "A77A95",
  headerText: "FFFFFF",
  zebraBg: "FAEEE9",
  white: "FFFFFF",
  ink: "735366",
  muted: "8F6580",
  border: "C3C3D5",
  statusBg: "FFF8EE",
  remarksBg: "F8F4F7",
};

const thinBorder = {
  top: { style: "thin", color: { rgb: COLORS.border } },
  bottom: { style: "thin", color: { rgb: COLORS.border } },
  left: { style: "thin", color: { rgb: COLORS.border } },
  right: { style: "thin", color: { rgb: COLORS.border } },
};

function cellStyle({ fill, font = {}, alignment = {} } = {}) {
  return {
    fill: fill ? { patternType: "solid", fgColor: { rgb: fill } } : undefined,
    font: {
      name: "Calibri",
      sz: 11,
      color: { rgb: COLORS.ink },
      ...font,
    },
    alignment: {
      vertical: "center",
      wrapText: false,
      ...alignment,
    },
    border: thinBorder,
  };
}

function setCell(sheet, row, col, value, style) {
  const address = XLSX.utils.encode_cell({ r: row, c: col });
  sheet[address] = {
    t: typeof value === "number" ? "n" : "s",
    v: value ?? "",
    s: style,
  };
}

/**
 * WPS/Excel-compatible attendance template.
 * Avoids styling every cell inside merges (that causes WPS 0x80004005 on save).
 */
export function buildTeacherAttendanceTemplateWorkbook(
  staff = [],
  date = todayISO()
) {
  const titleDate = formatAttendanceSheetDate(date);
  const title = `Attendance sheet of ${titleDate}`;
  const subtitle = "Edvora - Active staff roster - Fill Status & Remarks only";

  const sheet = {};
  const lastDataRow = 2 + staff.length; // 0-based: title=0, sub=1, header=2, data starts 3
  const lastRow = Math.max(lastDataRow, 2);

  // Title — value + style ONLY on A1 (merged master). Do not write B1:F1.
  setCell(
    sheet,
    0,
    0,
    title,
    cellStyle({
      fill: COLORS.titleBg,
      font: { bold: true, sz: 16, color: { rgb: COLORS.titleText } },
      alignment: { horizontal: "center" },
    })
  );

  // Subtitle — value + style ONLY on A2
  setCell(
    sheet,
    1,
    0,
    subtitle,
    cellStyle({
      fill: COLORS.accentBg,
      font: { bold: true, sz: 10, italic: true, color: { rgb: COLORS.accentText } },
      alignment: { horizontal: "center" },
    })
  );

  // Header row
  HEADERS.forEach((label, col) => {
    setCell(
      sheet,
      2,
      col,
      label,
      cellStyle({
        fill: COLORS.headerBg,
        font: { bold: true, sz: 11, color: { rgb: COLORS.headerText } },
        alignment: { horizontal: "center" },
      })
    );
  });

  // Data rows
  staff.forEach((person, index) => {
    const row = 3 + index;
    const zebra = index % 2 === 1;
    const name = [person.firstName, person.lastName].filter(Boolean).join(" ").trim();
    const values = [
      index + 1,
      person.employeeId || person.staffId || "",
      name,
      person.department || "",
      person.attendanceStatus || "",
      person.remarks || "",
    ];

    values.forEach((value, col) => {
      let fill = zebra ? COLORS.zebraBg : COLORS.white;
      if (col === 4) fill = COLORS.statusBg;
      if (col === 5) fill = COLORS.remarksBg;

      setCell(
        sheet,
        row,
        col,
        value,
        cellStyle({
          fill,
          font: {
            sz: 11,
            bold: col === 1,
            color: { rgb: col === 0 ? COLORS.muted : COLORS.ink },
          },
          alignment: {
            horizontal: col === 0 || col === 4 ? "center" : "left",
          },
        })
      );
    });
  });

  sheet["!ref"] = XLSX.utils.encode_range({
    s: { r: 0, c: 0 },
    e: { r: lastRow, c: COL_COUNT - 1 },
  });

  sheet["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: COL_COUNT - 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: COL_COUNT - 1 } },
  ];

  sheet["!cols"] = [
    { wch: 8 },
    { wch: 14 },
    { wch: 24 },
    { wch: 22 },
    { wch: 14 },
    { wch: 28 },
  ];

  sheet["!rows"] = [
    { hpt: 30 },
    { hpt: 20 },
    { hpt: 22 },
    ...staff.map(() => ({ hpt: 20 })),
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Attendance");

  return XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
    cellStyles: true,
  });
}

export function downloadTeacherAttendanceTemplate(staff, date) {
  const buffer = buildTeacherAttendanceTemplateWorkbook(staff, date);
  const stamp = String(date || todayISO()).replace(/-/g, "");
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `teacher-attendance-${stamp}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
}

/** Read .xlsx / .xls into normalized raw row objects (header keys lowercased). */
export function parseExcelAttendanceFile(arrayBuffer) {
  const workbook = XLSX.read(arrayBuffer, { type: "array", cellStyles: false });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];

  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: "",
    raw: false,
  });

  if (!rows.length) return [];

  let headerIndex = -1;
  let headers = [];

  for (let i = 0; i < rows.length; i += 1) {
    const candidate = (rows[i] || []).map((cell) =>
      String(cell || "")
        .trim()
        .toLowerCase()
        .replace(/\./g, "")
        .replace(/\s+/g, "")
    );
    const keys = new Set(candidate);
    const hasStatus = keys.has("status") || keys.has("attendance");
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

    if (hasStatus && hasId) {
      headerIndex = i;
      headers = candidate;
      break;
    }
  }

  if (headerIndex < 0) return [];

  return rows.slice(headerIndex + 1).map((line) => {
    const row = {};
    headers.forEach((header, idx) => {
      if (!header) return;
      row[header] = String(line?.[idx] ?? "").trim();
    });
    return row;
  });
}
