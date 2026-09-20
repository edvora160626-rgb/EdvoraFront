import axios from "axios";
import { getCurrentUser, getSchoolId, getUserRole } from "./auth";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4001";

export const DAYS = [
  { value: "MON", label: "Monday" },
  { value: "TUE", label: "Tuesday" },
  { value: "WED", label: "Wednesday" },
  { value: "THU", label: "Thursday" },
  { value: "FRI", label: "Friday" },
  { value: "SAT", label: "Saturday" },
  { value: "SUN", label: "Sunday" },
];

export const SLOT_TYPES = [
  { value: "PERIOD", label: "Period" },
  { value: "BREAK", label: "Break" },
  { value: "LUNCH", label: "Lunch" },
];

/** Empty / missing days = applies to every working day (legacy slots). */
export function slotAppliesToDay(slot, day) {
  const days = slot?.days;
  if (!Array.isArray(days) || days.length === 0) return true;
  return days.includes(day);
}

export function dayShortLabel(dayValue) {
  return DAYS.find((d) => d.value === dayValue)?.label?.slice(0, 3) || dayValue;
}

export const ROOM_TYPES = [
  { value: "CLASSROOM", label: "Classroom" },
  { value: "LAB", label: "Lab" },
  { value: "LIBRARY", label: "Library" },
  { value: "AUDITORIUM", label: "Auditorium" },
  { value: "OTHER", label: "Other" },
];

function actorPayload() {
  const user = getCurrentUser();
  const role = getUserRole();
  const userId =
    user?._id != null
      ? String(
          typeof user._id === "object" ? user._id._id || user._id : user._id
        )
      : undefined;

  return {
    schoolId: getSchoolId(),
    role,
    userId,
    createdBy: userId,
    updatedBy: userId,
  };
}

function requireSchoolId() {
  const schoolId = getSchoolId();
  if (!schoolId) {
    throw new Error("School ID is missing. Please sign in again.");
  }
  return schoolId;
}

async function post(path, payload = {}) {
  const actor = actorPayload();
  requireSchoolId();
  const { data } = await axios.post(`${API_BASE}/timetable${path}`, {
    ...payload,
    schoolId: actor.schoolId,
    createdBy: payload.createdBy ?? actor.createdBy,
    updatedBy: payload.updatedBy ?? actor.updatedBy,
  });
  return data;
}

/* Academic years */
export async function createAcademicYear(payload) {
  const data = await post("/createAcademicYear", payload);
  return data?.data;
}

export async function updateAcademicYear(payload) {
  const data = await post("/updateAcademicYear", payload);
  return data?.data;
}

export async function listAcademicYears() {
  const data = await post("/listAcademicYears");
  return data?.data || [];
}

export async function setCurrentAcademicYear(academicYearId) {
  const data = await post("/setCurrentAcademicYear", { academicYearId });
  return data?.data;
}

/* Settings */
export async function getTimetableSettings(academicYearId) {
  const data = await post("/getSettings", { academicYearId });
  return data?.data;
}

export async function upsertTimetableSettings(payload) {
  const data = await post("/upsertSettings", payload);
  return data?.data;
}

/* Time slots */
export async function listTimeSlots(academicYearId) {
  const data = await post("/listTimeSlots", { academicYearId });
  return data?.data || [];
}

export async function createTimeSlot(payload) {
  const data = await post("/createTimeSlot", payload);
  return data?.data;
}

export async function updateTimeSlot(payload) {
  const data = await post("/updateTimeSlot", payload);
  return data?.data;
}

export async function deleteTimeSlot(timeSlotId) {
  const data = await post("/deleteTimeSlot", { timeSlotId });
  return data;
}

export async function replaceTimeSlots(academicYearId, slots) {
  const data = await post("/replaceTimeSlots", { academicYearId, slots });
  return data?.data || [];
}

/* Holidays */
export async function listHolidays(academicYearId) {
  const data = await post("/listHolidays", { academicYearId });
  return data?.data || [];
}

export async function createHoliday(payload) {
  const data = await post("/createHoliday", payload);
  return data?.data;
}

export async function deleteHoliday(holidayId) {
  const data = await post("/deleteHoliday", { holidayId });
  return data;
}

/* Rooms */
export async function listRooms(status) {
  const data = await post("/listRooms", status ? { status } : {});
  return {
    data: data?.data || [],
    counts: data?.counts || { ACTIVE: 0, INACTIVE: 0 },
  };
}

export async function createRoom(payload) {
  const data = await post("/createRoom", payload);
  return data?.data;
}

export async function updateRoom(payload) {
  const data = await post("/updateRoom", payload);
  return data?.data;
}

export async function deleteRoom(roomId) {
  const data = await post("/deleteRoom", { roomId });
  return data;
}

/* Availability */
export async function upsertTeacherAvailability(payload) {
  const data = await post("/upsertTeacherAvailability", payload);
  return data?.data;
}

export async function getTeacherAvailability(academicYearId, teacherId) {
  const data = await post("/getTeacherAvailability", {
    academicYearId,
    teacherId,
  });
  return data?.data;
}

export async function listTeacherAvailability(academicYearId) {
  const data = await post("/listTeacherAvailability", { academicYearId });
  return data?.data || [];
}

/* Allocations */
export async function listSubjectsByClass(classId) {
  const data = await post("/listSubjectsByClass", { classId });
  return data?.data || [];
}

export async function listAllocationsByClass(academicYearId, classId) {
  const data = await post("/listAllocationsByClass", {
    academicYearId,
    classId,
  });
  return data?.data || [];
}

export async function createAllocation(payload) {
  const data = await post("/createAllocation", payload);
  return data?.data;
}

export async function updateAllocation(payload) {
  const data = await post("/updateAllocation", payload);
  return data?.data;
}

export async function deleteAllocation(allocationId) {
  const data = await post("/deleteAllocation", { allocationId });
  return data;
}

/* Timetable */
export async function getTimetableByClass(academicYearId, classId) {
  const data = await post("/getTimetableByClass", { academicYearId, classId });
  return data?.data;
}

export async function upsertTimetableEntry(payload) {
  try {
    const data = await post("/upsertEntry", payload);
    return { ok: true, data: data?.data, warnings: data?.warnings || [] };
  } catch (error) {
    const body = error?.response?.data;
    if (body?.conflicts) {
      return {
        ok: false,
        conflicts: body.conflicts,
        warnings: body.warnings || [],
        message: body.message,
        data: body.data,
      };
    }
    throw error;
  }
}

export async function clearTimetableEntry(payload) {
  const data = await post("/clearEntry", payload);
  return data?.data;
}

export async function publishTimetable(academicYearId, classId) {
  try {
    const data = await post("/publishTimetable", { academicYearId, classId });
    return { ok: true, data: data?.data };
  } catch (error) {
    const body = error?.response?.data;
    if (body?.conflicts) {
      return {
        ok: false,
        conflicts: body.conflicts,
        message: body.message,
      };
    }
    throw error;
  }
}

export async function unpublishTimetable(academicYearId, classId) {
  const data = await post("/unpublishTimetable", { academicYearId, classId });
  return data?.data;
}

export async function copyTimetable(payload) {
  const data = await post("/copyTimetable", payload);
  return data?.data;
}

export async function listTimetableDashboard(academicYearId) {
  const data = await post(
    "/listDashboard",
    academicYearId ? { academicYearId } : {}
  );
  return data?.data;
}

export async function getTeacherTimetable(academicYearId, teacherId, publishedOnly = true) {
  const data = await post("/getTeacherTimetable", {
    academicYearId,
    teacherId,
    publishedOnly,
  });
  return data?.data;
}

export async function getRoomTimetable(academicYearId, roomId, publishedOnly = true) {
  const data = await post("/getRoomTimetable", {
    academicYearId,
    roomId,
    publishedOnly,
  });
  return data?.data;
}

export async function getMyTimetable(payload = {}) {
  const actor = actorPayload();
  requireSchoolId();
  const { data } = await axios.post(`${API_BASE}/timetable/getMyTimetable`, {
    schoolId: actor.schoolId,
    userId: actor.userId,
    role: actor.role,
    ...payload,
  });
  return data?.data;
}

export function teacherName(teacher) {
  if (!teacher) return "—";
  return [teacher.firstName, teacher.lastName].filter(Boolean).join(" ") || "—";
}

export function classLabel(cls) {
  if (!cls) return "—";
  return [cls.className, cls.section].filter(Boolean).join(" ");
}
