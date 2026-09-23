import axios from "axios";
import { getCurrentUser, getSchoolId, getUserRole } from "./auth";
import { createTtlCache } from "./http";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4001";
const eventsCache = createTtlCache(45000);

export const EVENT_STATUSES = [
  { value: "ALL", label: "All" },
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
  { value: "CANCELLED", label: "Cancelled" },
];

function actorPayload() {
  const user = getCurrentUser();
  const role = getUserRole();
  const userId =
    user?._id != null
      ? String(typeof user._id === "object" ? user._id._id || user._id : user._id)
      : undefined;

  return {
    schoolId: getSchoolId(),
    role,
    createdBy: userId,
    updatedBy: userId,
    studentId: role === "STUDENT" ? userId : undefined,
    parentId: role === "PARENT" ? userId : undefined,
  };
}

function requireSchoolId() {
  const schoolId = getSchoolId();
  if (!schoolId) {
    throw new Error("School ID is missing. Please sign in again.");
  }
  return schoolId;
}

export async function createEvent(payload) {
  const actor = actorPayload();
  requireSchoolId();

  const { data } = await axios.post(`${API_BASE}/events/createEvent`, {
    ...payload,
    schoolId: actor.schoolId,
    createdBy: actor.createdBy,
  });

  eventsCache.clear();
  return data?.data;
}

export async function updateEvent(eventId, payload) {
  const actor = actorPayload();
  requireSchoolId();

  const { data } = await axios.post(`${API_BASE}/events/updateEvent`, {
    ...payload,
    schoolId: actor.schoolId,
    eventId,
    updatedBy: actor.updatedBy,
  });

  eventsCache.clear();
  return data?.data;
}

export async function publishEvent(eventId) {
  const actor = actorPayload();
  requireSchoolId();

  const { data } = await axios.post(`${API_BASE}/events/publishEvent`, {
    schoolId: actor.schoolId,
    eventId,
    updatedBy: actor.updatedBy,
  });

  eventsCache.clear();
  return data?.data;
}

export async function cancelEvent(eventId) {
  const actor = actorPayload();
  requireSchoolId();

  const { data } = await axios.post(`${API_BASE}/events/cancelEvent`, {
    schoolId: actor.schoolId,
    eventId,
    updatedBy: actor.updatedBy,
  });

  eventsCache.clear();
  return data?.data;
}

export async function deleteEvent(eventId) {
  const actor = actorPayload();
  requireSchoolId();

  const { data } = await axios.post(`${API_BASE}/events/deleteEvent`, {
    schoolId: actor.schoolId,
    eventId,
  });

  eventsCache.clear();
  return data;
}

export async function getEventsByStatus(status = "ALL") {
  const actor = actorPayload();
  if (!actor.schoolId) {
    return {
      totalEvents: 0,
      counts: { DRAFT: 0, PUBLISHED: 0, CANCELLED: 0, ALL: 0 },
      status,
      data: [],
    };
  }

  const body = {
    schoolId: actor.schoolId,
    role: actor.role,
    studentId: actor.studentId,
    parentId: actor.parentId,
  };

  if (status && status !== "ALL") {
    body.status = status;
  }

  return eventsCache.wrap(
    `${actor.schoolId}:${status}:${actor.role}:${actor.studentId || ""}:${actor.parentId || ""}`,
    async () => {
      const { data } = await axios.post(
        `${API_BASE}/events/getEventsBySchool`,
        body
      );

      return {
        totalEvents: data?.totalEvents || 0,
        counts: {
          DRAFT: data?.counts?.DRAFT || 0,
          PUBLISHED: data?.counts?.PUBLISHED || 0,
          CANCELLED: data?.counts?.CANCELLED || 0,
          ALL: data?.counts?.ALL || 0,
        },
        status: data?.status || status,
        data: data?.data || [],
      };
    }
  );
}

export async function getEventById(eventId) {
  const actor = actorPayload();
  requireSchoolId();

  const { data } = await axios.post(`${API_BASE}/events/getEventById`, {
    schoolId: actor.schoolId,
    eventId,
    role: actor.role,
    studentId: actor.studentId,
    parentId: actor.parentId,
  });

  return data?.data;
}

export async function addProgram(eventId, payload) {
  const actor = actorPayload();
  requireSchoolId();

  const { data } = await axios.post(`${API_BASE}/events/addProgram`, {
    ...payload,
    schoolId: actor.schoolId,
    eventId,
    createdBy: actor.createdBy,
  });

  return data?.data;
}

export async function updateProgram(programId, payload) {
  const actor = actorPayload();
  requireSchoolId();

  const { data } = await axios.post(`${API_BASE}/events/updateProgram`, {
    ...payload,
    schoolId: actor.schoolId,
    programId,
    updatedBy: actor.updatedBy,
  });

  return data?.data;
}

export async function deleteProgram(programId) {
  const actor = actorPayload();
  requireSchoolId();

  const { data } = await axios.post(`${API_BASE}/events/deleteProgram`, {
    schoolId: actor.schoolId,
    programId,
  });

  return data;
}

export async function registerForProgram(programId) {
  const actor = actorPayload();
  requireSchoolId();

  if (!actor.studentId) {
    throw new Error("Only students can register for programs.");
  }

  const { data } = await axios.post(`${API_BASE}/events/registerForProgram`, {
    schoolId: actor.schoolId,
    programId,
    studentId: actor.studentId,
  });

  return data?.data;
}

export async function cancelRegistration(programId) {
  const actor = actorPayload();
  requireSchoolId();

  if (!actor.studentId) {
    throw new Error("Only students can cancel registrations.");
  }

  const { data } = await axios.post(`${API_BASE}/events/cancelRegistration`, {
    schoolId: actor.schoolId,
    programId,
    studentId: actor.studentId,
  });

  return data?.data;
}

export async function getParticipants(filters = {}) {
  const actor = actorPayload();
  requireSchoolId();

  const { data } = await axios.post(`${API_BASE}/events/getParticipants`, {
    schoolId: actor.schoolId,
    role: actor.role,
    parentId: actor.parentId,
    ...filters,
  });

  return {
    total: data?.total || 0,
    data: data?.data || [],
  };
}

export async function getEventDashboardStats() {
  const schoolId = getSchoolId();
  if (!schoolId) {
    return {
      totalEvents: 0,
      activeEvents: 0,
      upcomingEvents: 0,
      totalPrograms: 0,
      totalRegistrations: 0,
      eventWiseRegistrationCount: [],
      programWiseRegistrationCount: [],
    };
  }

  const { data } = await axios.post(
    `${API_BASE}/events/getEventDashboardStats`,
    { schoolId }
  );

  return (
    data?.data || {
      totalEvents: 0,
      activeEvents: 0,
      upcomingEvents: 0,
      totalPrograms: 0,
      totalRegistrations: 0,
      eventWiseRegistrationCount: [],
      programWiseRegistrationCount: [],
    }
  );
}

export function formatEventDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function toDateInputValue(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
