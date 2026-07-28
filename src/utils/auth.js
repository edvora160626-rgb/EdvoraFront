export function getCurrentUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getToken() {
  return localStorage.getItem("token") || "";
}

export function normalizeRole(role = "") {
  if (role === "PRINCIPAL") return "SUPER_ADMIN";
  return role;
}

export function getUserRole() {
  return normalizeRole(getCurrentUser()?.role || "");
}

export function getSchoolId() {
  const schoolId = getCurrentUser()?.schoolId;
  if (!schoolId) return "";
  if (typeof schoolId === "string") return schoolId.trim();
  if (typeof schoolId === "object") {
    const raw =
      schoolId._id ??
      schoolId.id ??
      (typeof schoolId.toHexString === "function"
        ? schoolId.toHexString()
        : null);
    if (raw != null && raw !== "") {
      return String(raw).trim();
    }
    const asString =
      typeof schoolId.toString === "function" ? schoolId.toString() : "";
    if (asString && asString !== "[object Object]") {
      return asString.trim();
    }
    return "";
  }
  return String(schoolId).trim();
}

export function isAuthenticated() {
  return Boolean(getToken() && getCurrentUser());
}
