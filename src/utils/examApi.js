import axios from "axios";
import { getToken } from "./auth";
import { createTtlCache } from "./http";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4001";

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const client = axios.create({
  baseURL: `${API_BASE}/exam`,
  withCredentials: true,
  timeout: 15000,
});

const examCache = createTtlCache(30000);

client.interceptors.request.use((config) => {
  config.headers = {
    ...config.headers,
    ...authHeaders(),
  };
  return config;
});

function getErrorMessage(error, fallback = "Request failed") {
  const data = error?.response?.data;
  if (typeof data === "string" && data.trim()) return data.trim();
  if (data?.message) return String(data.message);
  if (data?.error) return String(data.error);
  if (error?.message && !/status code/i.test(error.message)) {
    return error.message;
  }
  return fallback;
}

async function unwrap(promise) {
  try {
    const { data } = await promise;
    if (!data?.success) {
      throw new Error(data?.message || "Request failed");
    }
    return data.data;
  } catch (error) {
    if (error?.response || axios.isAxiosError?.(error) || error?.isAxiosError) {
      throw new Error(getErrorMessage(error));
    }
    throw error instanceof Error
      ? error
      : new Error(getErrorMessage(error));
  }
}

export const examApi = {
  getDashboard: () =>
    examCache.wrap("dashboard", () => unwrap(client.get("/dashboard"))),
  listTests: (type) =>
    examCache.wrap(`tests:${type || ""}`, () =>
      unwrap(client.get("/tests", { params: type ? { type } : undefined }))
    ),
  getTest: (testId) => unwrap(client.get(`/tests/${testId}`)),
  enroll: (testId) => {
    examCache.clear();
    return unwrap(client.post(`/tests/${testId}/enroll`));
  },
  precheck: (testId) => unwrap(client.get(`/tests/${testId}/precheck`)),
  start: (testId) => {
    examCache.clear();
    return unwrap(client.post(`/tests/${testId}/start`));
  },
  saveAnswer: (attemptId, questionId, selectedIndex) =>
    unwrap(
      client.post(`/attempts/${attemptId}/answer`, {
        questionId,
        selectedIndex,
      })
    ),
  submit: (attemptId) => {
    examCache.clear();
    return unwrap(client.post(`/attempts/${attemptId}/submit`));
  },
  getResult: (attemptId) =>
    unwrap(client.get(`/attempts/${attemptId}/result`)),
  listResults: () => unwrap(client.get("/results")),
  listCertificates: () => unwrap(client.get("/certificates")),
  listMaterials: () => unwrap(client.get("/materials")),
  listForum: () => unwrap(client.get("/forum")),
  createForumPost: (payload) => unwrap(client.post("/forum", payload)),
  listSupport: () => unwrap(client.get("/support")),
  createSupport: (payload) => unwrap(client.post("/support", payload)),

  staffOverview: () => unwrap(client.get("/staff/overview")),
  staffUsers: (role) =>
    unwrap(client.get("/staff/users", { params: role ? { role } : undefined })),
  staffSubjects: () => unwrap(client.get("/staff/subjects")),
  createSubject: (payload) => unwrap(client.post("/staff/subjects", payload)),
  staffQuestions: (params) =>
    unwrap(client.get("/staff/questions", { params: params || undefined })),
  createQuestion: (payload) => unwrap(client.post("/staff/questions", payload)),
  updateQuestion: (id, payload) =>
    unwrap(client.put(`/staff/questions/${id}`, payload)),
  staffTests: (params) =>
    unwrap(client.get("/staff/tests", { params: params || undefined })),
  getStaffTest: (id) => unwrap(client.get(`/staff/tests/${id}`)),
  createTest: (payload) => unwrap(client.post("/staff/tests", payload)),
  updateTest: (id, payload) =>
    unwrap(client.put(`/staff/tests/${id}`, payload)),
  publishTest: (id) => unwrap(client.post(`/staff/tests/${id}/publish`)),
  staffLiveSessions: () => unwrap(client.get("/staff/live-sessions")),
  staffScheduled: () => unwrap(client.get("/staff/scheduled")),
};

export function formatExamDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(iso);
  }
}
